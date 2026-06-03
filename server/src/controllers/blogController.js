const Blog = require('../models/Blog');

/* ── helpers ─────────────────────────────────────────────────────── */
const BASE_FILTER = { isDeleted: false };

function ownerFilter(userId) {
  return { ...BASE_FILTER, owner: userId };
}

/**
 * Sanitise a tags array: flatten comma-separated entries, trim, lowercase,
 * drop empties, cap each tag at 30 chars, deduplicate, keep up to 8.
 */
function sanitiseTags(raw) {
  if (!Array.isArray(raw)) return [];
  return [
    ...new Set(
      raw
        .flatMap((t) => String(t).split(','))
        .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 30))
        .filter(Boolean)
    ),
  ].slice(0, 8);
}

/* ── In-memory AI rate limiter (10 calls / user / hour) ─────────── */
const _aiCallLog = new Map(); // userId -> number[]  (timestamps ms)

function checkAiRateLimit(userId) {
  const now    = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const prev   = (_aiCallLog.get(userId) || []).filter((t) => now - t < window);
  if (prev.length >= 10) return false;
  _aiCallLog.set(userId, [...prev, now]);
  return true;
}

/* ── Gemini REST helper ──────────────────────────────────────────── */
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const err = new Error('GEMINI_API_KEY is not configured.');
    err.status = 503;
    throw err;
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err  = new Error(body.error?.message || `Gemini error ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

/* ── Prompt builders ─────────────────────────────────────────────── */
function buildPrompt(action, { topic, content, tone, blogTitle }) {
  switch (action) {
    case 'generate_draft':
      return `You are a professional blog writer. Write a well-structured blog post about: "${topic}".

Format your response EXACTLY like this (include all three labels on their own lines):
TITLE: [a catchy, specific blog title]
DESCRIPTION: [one or two sentences summarising the post for a list view]
CONTENT:
[the full blog post in Markdown — use ## headings, paragraphs, bullet lists, and bold text]`;

    case 'improve':
      return `You are an expert editor. Improve the writing quality of this blog post.
Fix grammar, enhance clarity, improve flow, and make the prose more engaging.
Keep all the original information and structure. Return ONLY the improved Markdown — no extra commentary.

${content}`;

    case 'rewrite_tone':
      return `You are a skilled copywriter. Rewrite this blog post in a ${tone} tone.
Keep every key point and the Markdown structure intact.
Return ONLY the rewritten Markdown — no extra commentary.

${content}`;

    case 'summarize':
      return `Write a 1–2 sentence description for this blog post titled "${blogTitle || 'Untitled'}".
This description will appear in list views under the title.
Return ONLY the plain-text description — no markdown, no quotes, no labels.

${content}`;

    default:
      return '';
  }
}

/* ── Parse Gemini text for generate_draft ───────────────────────── */
function parseGeneratedDraft(text) {
  const titleMatch   = text.match(/^TITLE:\s*(.+)/m);
  const descMatch    = text.match(/^DESCRIPTION:\s*(.+)/m);
  const contentMatch = text.match(/^CONTENT:\s*\n([\s\S]+)/m);

  return {
    title:       titleMatch?.[1]?.trim()   || '',
    description: descMatch?.[1]?.trim()    || '',
    content:     contentMatch?.[1]?.trim() || text,
  };
}

/* ══════════════════════════════════════════════════════════════════
   CRUD handlers
   ══════════════════════════════════════════════════════════════════ */

/* ── POST /api/blogs ─────────────────────────────────────────────── */
exports.createBlog = async (req, res, next) => {
  try {
    const { title, description = '', content = '', tags = [] } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const blog = await Blog.create({
      owner:     req.user.id,
      ownerRole: req.user.role,
      title:     title.trim(),
      description,
      content,
      tags:      sanitiseTags(tags),
    });

    res.status(201).json({ blog });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/blogs ──────────────────────────────────────────────── */
exports.listMyBlogs = async (req, res, next) => {
  try {
    const filter = ownerFilter(req.user.id);

    if (req.query.status === 'draft' || req.query.status === 'published') {
      filter.status = req.query.status;
    }

    const blogs = await Blog.find(filter)
      .select('title slug description tags status publishedAt createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({ blogs });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/blogs/public  (no auth — list all published) ──────── */
exports.listPublicBlogs = async (req, res, next) => {
  try {
    const { tag, q, page = 1, limit = 12 } = req.query;
    const filter = { status: 'published', isDeleted: false };
    if (tag) filter.tags = tag;
    if (q)   filter.title = { $regex: q, $options: 'i' };

    const skip  = (Number(page) - 1) * Number(limit);
    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('owner', 'name role companyProfile')
        .select('title slug description tags publishedAt owner ownerRole')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Blog.countDocuments(filter),
    ]);

    res.json({
      blogs,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/blogs/public/:slug  (no auth — published only) ─────── */
exports.getPublicBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({
      slug:      req.params.slug,
      status:    'published',
      isDeleted: false,
    }).populate('owner', 'name companyProfile');

    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ blog });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/blogs/:id ──────────────────────────────────────────── */
exports.getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, ...BASE_FILTER });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // owner can always read; non-owners can only read published
    if (String(blog.owner) !== req.user.id && blog.status !== 'published') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ blog });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/blogs/:id ──────────────────────────────────────────── */
exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, ...BASE_FILTER });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (String(blog.owner) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (blog.status === 'published') {
      return res.status(400).json({
        message: 'Published blogs cannot be edited directly. Revert to Draft first.',
      });
    }

    const { title, description, content, tags } = req.body;
    if (title       !== undefined) blog.title       = title.trim();
    if (description !== undefined) blog.description = description;
    if (content     !== undefined) blog.content     = content;
    if (Array.isArray(tags))       blog.tags        = sanitiseTags(tags);

    await blog.save();
    res.json({ blog });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/blogs/:id (soft) ────────────────────────────────── */
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, ...BASE_FILTER });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (String(blog.owner) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    blog.isDeleted = true;
    await blog.save();
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/blogs/:id/publish ─────────────────────────────────── */
exports.publishBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, ...BASE_FILTER });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (String(blog.owner) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (!blog.title?.trim()) {
      return res.status(400).json({ message: 'A title is required before publishing.' });
    }
    if (!blog.content?.trim()) {
      return res.status(400).json({ message: 'Content cannot be empty before publishing.' });
    }

    blog.status      = 'published';
    blog.publishedAt = blog.publishedAt ?? new Date();
    await blog.save();

    res.json({ blog });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/blogs/:id/unpublish ──────────────────────────────── */
exports.unpublishBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, ...BASE_FILTER });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (String(blog.owner) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    blog.status = 'draft';
    await blog.save();
    res.json({ blog });
  } catch (err) {
    next(err);
  }
};

/* ══════════════════════════════════════════════════════════════════
   POST /api/blogs/:id/ai
   ══════════════════════════════════════════════════════════════════ */
exports.aiAction = async (req, res, next) => {
  try {
    /* ── auth + ownership ── */
    const blog = await Blog.findOne({ _id: req.params.id, ...BASE_FILTER });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (String(blog.owner) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    /* ── validate action ── */
    const ALLOWED = ['generate_draft', 'improve', 'rewrite_tone', 'summarize'];
    const { action, prompt: userTopic, tone } = req.body;

    if (!ALLOWED.includes(action)) {
      return res.status(400).json({
        message: `Invalid action. Must be one of: ${ALLOWED.join(', ')}`,
      });
    }

    /* ── per-field validation ── */
    if (action === 'generate_draft' && !userTopic?.trim()) {
      return res.status(400).json({ message: 'Please enter a topic to generate a draft.' });
    }
    if (['improve', 'rewrite_tone', 'summarize'].includes(action) && !blog.content?.trim()) {
      return res.status(400).json({ message: 'Blog content is empty — nothing to process.' });
    }
    if (action === 'rewrite_tone') {
      const TONES = ['professional', 'friendly', 'concise'];
      if (!TONES.includes(tone)) {
        return res.status(400).json({ message: `Tone must be one of: ${TONES.join(', ')}` });
      }
    }

    /* ── rate limit ── */
    if (!checkAiRateLimit(req.user.id)) {
      return res.status(429).json({
        message: 'You have used 10 AI requests this hour. Please try again later.',
      });
    }

    /* ── build prompt + call Gemini ── */
    const prompt = buildPrompt(action, {
      topic:     userTopic,
      content:   blog.content,
      tone,
      blogTitle: blog.title,
    });

    let aiText;
    try {
      aiText = await callGemini(prompt);
    } catch (aiErr) {
      const status = aiErr.status || 500;
      if (status === 503) {
        return res.status(503).json({ message: aiErr.message });
      }
      if (status === 429) {
        return res.status(429).json({
          message: 'The AI service is busy right now. Please wait a moment and try again.',
        });
      }
      return res.status(502).json({
        message: `AI service error: ${aiErr.message}`,
      });
    }

    /* ── parse + return result ── */
    let result = {};
    if (action === 'generate_draft') {
      result = parseGeneratedDraft(aiText);
    } else if (action === 'improve' || action === 'rewrite_tone') {
      result = { content: aiText };
    } else if (action === 'summarize') {
      result = { description: aiText };
    }

    res.json({ result });
  } catch (err) {
    next(err);
  }
};
