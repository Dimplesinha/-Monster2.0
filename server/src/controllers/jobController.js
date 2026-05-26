const Job = require('../models/Job');
const Application = require('../models/Application');

exports.listJobs = async (req, res, next) => {
  try {
    const { q, location, type, remote, page = 1, limit = 12 } = req.query;
    const filter = { active: true };
    if (q) filter.$text = { $search: q };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type) filter.type = type;
    if (remote === 'true') filter.remote = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Job.countDocuments(filter),
    ]);

    res.json({ jobs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('applicantCount');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ job });
  } catch (err) {
    next(err);
  }
};

exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
};

exports.myJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 }).populate('applicantCount');
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};

exports.applyToJob = async (req, res, next) => {
  try {
    const exists = await Application.exists({ job: req.params.id, applicant: req.user.id });
    if (exists) return res.status(409).json({ message: 'Already applied' });
    const application = await Application.create({
      job: req.params.id,
      applicant: req.user.id,
      coverNote: req.body.coverNote,
    });
    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
};
