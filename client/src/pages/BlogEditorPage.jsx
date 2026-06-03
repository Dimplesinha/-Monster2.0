import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TagInput from '../components/blog/TagInput';
import AIToolbar from '../components/blog/AIToolbar';
import MarkdownContent from '../components/blog/MarkdownContent';
import styles from './BlogEditorPage.module.css';

/* ── Icons ─────────────────────────────────────────────────────── */
function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

/* ── Markdown toolbar button helpers ─────────────────────────── */
const MD_ACTIONS = [
  { label: 'B',      title: 'Bold',          wrap: ['**', '**'],   block: false },
  { label: 'I',      title: 'Italic',        wrap: ['*', '*'],     block: false },
  { label: '# H2',   title: 'Heading 2',     prefix: '## ',        block: true  },
  { label: '# H3',   title: 'Heading 3',     prefix: '### ',       block: true  },
  { label: '— HR',   title: 'Divider',       insert: '\n\n---\n\n',block: false },
  { label: '• List', title: 'Bullet list',   prefix: '- ',         block: true  },
  { label: '1. List',title: 'Numbered list', prefix: '1. ',        block: true  },
  { label: '❝',      title: 'Blockquote',    prefix: '> ',         block: true  },
  { label: '</>',    title: 'Code block',    wrap: ['`', '`'],     block: false },
];

function applyMdAction(textarea, action, content, setContent) {
  if (!textarea) return;
  const { selectionStart: start, selectionEnd: end } = textarea;
  const selected = content.slice(start, end);

  let newContent = content;
  let newCursorStart = start;
  let newCursorEnd = end;

  if (action.insert) {
    newContent = content.slice(0, start) + action.insert + content.slice(end);
    newCursorStart = newCursorEnd = start + action.insert.length;
  } else if (action.wrap) {
    const [open, close] = action.wrap;
    const replacement = `${open}${selected || 'text'}${close}`;
    newContent = content.slice(0, start) + replacement + content.slice(end);
    newCursorStart = start + open.length;
    newCursorEnd   = start + open.length + (selected || 'text').length;
  } else if (action.prefix) {
    // Apply to each selected line
    const lineStart   = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd     = content.indexOf('\n', end);
    const chunk       = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const prefixed    = chunk.split('\n').map((l) => action.prefix + l).join('\n');
    newContent = content.slice(0, lineStart) + prefixed + (lineEnd === -1 ? '' : content.slice(lineEnd));
    newCursorStart = lineStart;
    newCursorEnd   = lineStart + prefixed.length;
  }

  setContent(newContent);
  // Restore selection after React re-render
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(newCursorStart, newCursorEnd);
  });
}

/* ── Save status indicator ────────────────────────────────────── */
function SaveStatus({ status }) {
  // status: '' | 'saving' | 'saved' | 'error'
  if (!status) return null;
  return (
    <span className={`${styles.saveStatus} ${styles[`saveStatus_${status}`]}`}>
      {status === 'saving' && '↻ Saving…'}
      {status === 'saved'  && <><CheckIcon /> Saved</>}
      {status === 'error'  && '✕ Save failed'}
    </span>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function BlogEditorPage() {
  const { id } = useParams();          // undefined when creating
  const { user } = useAuth();
  const navigate = useNavigate();

  const isEmployer = user?.role === 'employer' || user?.role === 'admin';
  const listPath   = isEmployer ? '/employer/blogs' : '/my-blogs';
  const dashPath   = isEmployer ? '/dashboard'      : '/';

  /* ── Form state ────────────────────────────────────────────── */
  const [blogId,      setBlogId]      = useState(id || null);
  const [slug,        setSlug]        = useState('');
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [content,     setContent]     = useState('');
  const [tags,        setTags]        = useState([]);
  const [status,      setStatus]      = useState('draft');    // 'draft' | 'published'

  /* ── UI state ──────────────────────────────────────────────── */
  const [loading,     setLoading]     = useState(!!id);        // true while fetching existing
  const [saveStatus,  setSaveStatus]  = useState('');          // '' | 'saving' | 'saved' | 'error'
  const [publishErr,  setPublishErr]  = useState('');
  const [publishing,  setPublishing]  = useState(false);
  const [activeTab,   setActiveTab]   = useState('editor');    // mobile tab: 'editor' | 'preview'

  const textareaRef = useRef(null);

  /* ── Load existing blog ────────────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    api.get(`/blogs/${id}`)
      .then(({ data }) => {
        const b = data.blog;
        setBlogId(b._id);
        setSlug(b.slug || '');
        setTitle(b.title || '');
        setDescription(b.description || '');
        setContent(b.content || '');
        setTags(b.tags || []);
        setStatus(b.status);
      })
      .catch(() => navigate(listPath))
      .finally(() => setLoading(false));
  }, [id, listPath, navigate]);

  const isPublished = status === 'published';
  const editorDisabled = isPublished;

  /* ── Save draft ────────────────────────────────────────────── */
  const saveDraft = useCallback(async (silent = false) => {
    setPublishErr('');
    if (!silent) setSaveStatus('saving');

    try {
      const payload = { title, description, content, tags };

      if (!blogId) {
        // First save — create the blog
        if (!title.trim()) {
          setSaveStatus('error');
          return null;
        }
        const { data } = await api.post('/blogs', payload);
        const newId = data.blog._id;
        setBlogId(newId);
        setStatus('draft');
        if (!silent) setSaveStatus('saved');
        // Update URL to edit route without full reload
        window.history.replaceState(
          null, '',
          isEmployer ? `/employer/blogs/${newId}/edit` : `/my-blogs/${newId}/edit`
        );
        return newId;
      } else {
        await api.put(`/blogs/${blogId}`, payload);
        if (!silent) setSaveStatus('saved');
        return blogId;
      }
    } catch (err) {
      if (!silent) setSaveStatus('error');
      return null;
    } finally {
      if (!silent) {
        setTimeout(() => setSaveStatus((s) => s === 'saved' ? '' : s), 2500);
      }
    }
  }, [blogId, title, description, content, tags, isEmployer]);

  /* ── Publish ───────────────────────────────────────────────── */
  const handlePublish = async () => {
    setPublishErr('');
    if (!title.trim()) { setPublishErr('Please add a title before publishing.'); return; }
    if (!content.trim()) { setPublishErr('Content cannot be empty before publishing.'); return; }

    setPublishing(true);
    try {
      // Save draft first to persist latest content, then publish
      const savedId = blogId ? blogId : await saveDraft(true);
      if (!savedId) { setPublishErr('Could not save. Please try again.'); return; }

      await api.put(`/blogs/${savedId}`, { title, description, content, tags });
      const { data } = await api.post(`/blogs/${savedId}/publish`);
      setStatus(data.blog.status);
      setBlogId(savedId);
      if (data.blog.slug) setSlug(data.blog.slug);
    } catch (err) {
      setPublishErr(err.response?.data?.message || 'Publish failed. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  /* ── Unpublish (back to draft) ─────────────────────────────── */
  const handleUnpublish = async () => {
    if (!blogId) return;
    try {
      await api.post(`/blogs/${blogId}/unpublish`);
      setStatus('draft');
    } catch {
      setPublishErr('Could not revert to draft. Please try again.');
    }
  };

  /* ── AI result handler (Sprint 3 fills this in) ────────────── */
  const handleAIResult = useCallback(({ title: t, content: c, description: d }) => {
    if (t !== undefined) setTitle(t);
    if (c !== undefined) setContent(c);
    if (d !== undefined) setDescription(d);
  }, []);

  /* ── Loading skeleton ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingPage}>
          <div className={styles.loadingSkeleton} />
          <div className={styles.loadingSkeleton} style={{ height: '60vh' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to={dashPath} className={styles.logoLink}>
            Monster<span className={styles.logoPlus}>+</span>
          </Link>
          <Link to={listPath} className={styles.backLink}>
            <ArrowLeftIcon />
            My Blogs
          </Link>
        </div>

        <div className={styles.headerRight}>
          <SaveStatus status={saveStatus} />

          {isPublished ? (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleUnpublish}
            >
              ↩ Revert to Draft
            </button>
          ) : (
            <>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => saveDraft()}
                disabled={saveStatus === 'saving' || publishing}
              >
                Save Draft
              </button>
              <button
                type="button"
                className={styles.btnPublish}
                onClick={handlePublish}
                disabled={saveStatus === 'saving' || publishing}
              >
                {publishing ? 'Publishing…' : '🚀 Publish'}
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── Publish error ─────────────────────────────────────── */}
      {publishErr && (
        <div className={styles.publishError}>
          {publishErr}
          <button className={styles.publishErrorClose} onClick={() => setPublishErr('')}>×</button>
        </div>
      )}

      {/* ── Published banner ──────────────────────────────────── */}
      {isPublished && (
        <div className={styles.publishedBanner}>
          ✓ This blog is published.
          {slug && (
            <>
              {' '}
              <Link
                to={`/blogs/${slug}`}
                className={styles.viewPublicLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                View public page →
              </Link>
            </>
          )}
          <span className={styles.publishedBannerNote}>
            Click "Revert to Draft" to edit.
          </span>
        </div>
      )}

      {/* ── Mobile tab switcher ────────────────────────────────── */}
      <div className={styles.mobileTabs}>
        <button
          className={`${styles.mobileTab} ${activeTab === 'editor' ? styles.mobileTabActive : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Editor
        </button>
        <button
          className={`${styles.mobileTab} ${activeTab === 'preview' ? styles.mobileTabActive : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>

      {/* ── Split pane ─────────────────────────────────────────── */}
      <div className={styles.splitPane}>

        {/* ══ LEFT — Editor ══════════════════════════════════════ */}
        <div className={`${styles.editorPanel} ${activeTab === 'preview' ? styles.panelHiddenMobile : ''}`}>

          {/* Title */}
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="blog-title">
              Title <span className={styles.req}>*</span>
            </label>
            <input
              id="blog-title"
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your blog a title…"
              disabled={editorDisabled}
              maxLength={200}
            />
            <span className={styles.charCount}>{title.length}/200</span>
          </div>

          {/* Short description */}
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="blog-desc">
              Short Description
              <span className={styles.fieldHint}> — shown in list views</span>
            </label>
            <input
              id="blog-desc"
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One or two sentences about this post…"
              disabled={editorDisabled}
              maxLength={500}
            />
          </div>

          {/* Tags */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Tags</label>
            <TagInput
              tags={tags}
              onChange={setTags}
              disabled={editorDisabled}
              max={8}
            />
          </div>

          {/* AI Toolbar */}
          <AIToolbar
            blogId={blogId}
            content={content}
            onResult={handleAIResult}
            disabled={editorDisabled}
          />

          {/* Content / Markdown editor */}
          <div className={styles.field}>
            <div className={styles.contentHeader}>
              <label className={styles.fieldLabel} htmlFor="blog-content">
                Content <span className={styles.req}>*</span>
                <span className={styles.fieldHint}> — Markdown supported</span>
              </label>
              {/* Formatting mini-toolbar */}
              {!editorDisabled && (
                <div className={styles.mdToolbar} aria-label="Markdown formatting">
                  {MD_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className={styles.mdBtn}
                      title={action.title}
                      onMouseDown={(e) => {
                        e.preventDefault(); // don't blur textarea
                        applyMdAction(textareaRef.current, action, content, setContent);
                      }}
                      aria-label={action.title}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <textarea
              id="blog-content"
              ref={textareaRef}
              className={styles.contentTextarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Write your blog in Markdown…\n\n## Heading\n\nParagraph text, **bold**, *italic*.\n\n- List item`}
              disabled={editorDisabled}
              rows={22}
              spellCheck
            />
            <span className={styles.charCount}>{content.length} characters</span>
          </div>

        </div>

        {/* ══ RIGHT — Preview ════════════════════════════════════ */}
        <div className={`${styles.previewPanel} ${activeTab === 'editor' ? styles.panelHiddenMobile : ''}`}>
          <div className={styles.previewSticky}>

            <div className={styles.previewHeader}>
              <span className={styles.previewLabel}>Live Preview</span>
              {isPublished && <span className={styles.publishedPill}>Published</span>}
            </div>

            <div className={styles.previewCard}>
              {/* Render preview title */}
              {title && <h1 className={styles.previewTitle}>{title}</h1>}

              {/* Tags preview */}
              {tags.length > 0 && (
                <div className={styles.previewTags}>
                  {tags.map((t) => (
                    <span key={t} className={styles.previewTag}>#{t}</span>
                  ))}
                </div>
              )}

              {/* Description preview */}
              {description && (
                <p className={styles.previewDescription}>{description}</p>
              )}

              {/* Divider */}
              {(title || description || tags.length > 0) && content && (
                <hr className={styles.previewDivider} />
              )}

              {/* Markdown content */}
              <MarkdownContent content={content} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
