const Application = require('../models/Application');
const Job = require('../models/Job');

exports.myApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location type')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
};

exports.jobApplications = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (String(application.job.postedBy) !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    application.status = req.body.status;
    await application.save();
    res.json({ application });
  } catch (err) {
    next(err);
  }
};
