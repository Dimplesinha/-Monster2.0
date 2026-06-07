const ResumeTemplate = require('../models/ResumeTemplate');

/* ── GET /api/resume-templates ───────────────────────────────────── */
exports.list = async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      experienceLevel = '',
      style = '',
      layout = '',
      isPremium = '',
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { style:    { $regex: search, $options: 'i' } },
        { tags:     { $regex: search, $options: 'i' } },
      ];
    }
    if (category)        filter.category        = { $regex: category, $options: 'i' };
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (style)           filter.style           = style;
    if (layout)          filter.layout          = layout;
    if (isPremium !== '') filter.isPremium = isPremium === 'true';

    const [templates, total] = await Promise.all([
      ResumeTemplate.find(filter)
        .sort({ isPremium: 1, atsScore: -1, name: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      ResumeTemplate.countDocuments(filter),
    ]);

    res.json({ templates, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/resume-templates/:id ──────────────────────────────── */
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query  = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id }
      : { slug: id };

    const template = await ResumeTemplate.findOne({ ...query, isActive: true });
    if (!template) return res.status(404).json({ message: 'Template not found' });

    res.json(template);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/resume-templates/meta/options ─────────────────────── */
exports.metaOptions = async (req, res, next) => {
  try {
    const [categories, styles, layouts, experienceLevels] = await Promise.all([
      ResumeTemplate.distinct('category', { isActive: true }),
      ResumeTemplate.distinct('style',    { isActive: true }),
      ResumeTemplate.distinct('layout',   { isActive: true }),
      ResumeTemplate.distinct('experienceLevel', { isActive: true }),
    ]);

    res.json({
      categories:      [...new Set(categories.flat())].sort(),
      styles:          styles.sort(),
      layouts:         layouts.sort(),
      experienceLevels: experienceLevels.sort(),
    });
  } catch (err) {
    next(err);
  }
};
