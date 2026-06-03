const SalaryData = require('../models/SalaryData');

/* ── POST /api/salary/search — public ───────────────────────────── */
exports.search = async (req, res, next) => {
  try {
    const { jobTitle, location } = req.body;
    if (!jobTitle?.trim() || !location?.trim()) {
      return res.status(400).json({ message: 'Job title and location are required' });
    }

    // 1. Best: match both title + location (exact city word, case-insensitive)
    const safeTitle = jobTitle.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeLoc   = location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const titleReSafe = new RegExp(safeTitle, 'i');
    const locReSafe   = new RegExp(`\\b${safeLoc}\\b`, 'i');

    let isFallback = false;
    let record = await SalaryData.findOne({ jobTitle: titleReSafe, location: locReSafe })
      .sort({ lastUpdated: -1 });

    // 2. Fallback: title only (closest city — pick the one with highest average)
    if (!record) {
      isFallback = true;
      record = await SalaryData.findOne({ jobTitle: titleReSafe }).sort({ averageSalary: -1 });
    }

    if (!record) {
      return res.status(404).json({
        message: `No salary data found for "${jobTitle}". Try a different job title (e.g. "Software Engineer", "React Developer").`,
      });
    }

    res.json({
      jobTitle:         record.jobTitle,
      location:         record.location,
      averageSalary:    record.averageSalary,
      minSalary:        record.minSalary,
      medianSalary:     record.medianSalary,
      maxSalary:        record.maxSalary,
      currency:         record.currency,
      source:           record.source,
      lastUpdated:      record.lastUpdated || record.updatedAt,
      // Tell the client when we fell back so it can show a notice
      fallback:         isFallback,
      requestedLocation: isFallback ? location.trim() : undefined,
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/salary — admin list ───────────────────────────────── */
exports.list = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const query = search
      ? { $or: [
          { jobTitle: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ]}
      : {};

    const [records, total] = await Promise.all([
      SalaryData.find(query)
        .sort({ jobTitle: 1, location: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      SalaryData.countDocuments(query),
    ]);

    res.json({ records, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/salary — admin create ────────────────────────────── */
exports.create = async (req, res, next) => {
  try {
    const record = await SalaryData.create({ ...req.body, lastUpdated: new Date() });
    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/salary/:id — admin update ─────────────────────────── */
exports.update = async (req, res, next) => {
  try {
    const record = await SalaryData.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ record });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/salary/:id — admin delete ──────────────────────── */
exports.remove = async (req, res, next) => {
  try {
    const record = await SalaryData.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/salary/bulk — admin bulk import ──────────────────── */
exports.bulkImport = async (req, res, next) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'records array is required' });
    }
    const stamped = records.map((r) => ({ ...r, lastUpdated: new Date() }));
    const result  = await SalaryData.insertMany(stamped, { ordered: false });
    res.status(201).json({ inserted: result.length, message: `${result.length} records imported` });
  } catch (err) {
    // Partial success on duplicate keys
    if (err.insertedDocs) {
      return res.status(207).json({ inserted: err.insertedDocs.length, errors: err.writeErrors?.length });
    }
    next(err);
  }
};
