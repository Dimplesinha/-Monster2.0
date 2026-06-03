const mongoose = require('mongoose');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

/* POST /api/saved-jobs  — save a job */
exports.saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const job = await Job.findById(jobId);
    // treat missing active field (undefined) as active=true — only reject explicit false
    if (!job || job.active === false) return res.status(404).json({ message: 'Job not found' });

    // upsert — ignore duplicate key error gracefully
    const saved = await SavedJob.findOneAndUpdate(
      { user: req.user.id, job: jobId },
      { user: req.user.id, job: jobId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ savedJob: saved });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Job already saved' });
    }
    next(err);
  }
};

/* DELETE /api/saved-jobs/:jobId  — unsave a job */
exports.unsaveJob = async (req, res, next) => {
  try {
    const result = await SavedJob.findOneAndDelete({
      user: req.user.id,
      job: req.params.jobId,
    });
    if (!result) return res.status(404).json({ message: 'Saved job not found' });
    res.json({ message: 'Job removed from saved list' });
  } catch (err) {
    next(err);
  }
};

/* GET /api/saved-jobs/count  — badge count (must come BEFORE /:jobId route) */
exports.getSavedCount = async (req, res, next) => {
  try {
    const count = await SavedJob.countDocuments({ user: req.user.id });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

/* GET /api/saved-jobs  — list saved jobs with search / filters / pagination */
exports.getSavedJobs = async (req, res, next) => {
  try {
    const {
      search   = '',
      type     = '',
      location = '',
      days,
      page     = 1,
      limit    = 10,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page, 10)  || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    // ── Build pipeline ─────────────────────────────────────────────
    const pipeline = [
      // 1. Match this user's saved jobs
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },

      // 2. Join the jobs collection
      {
        $lookup: {
          from:         'jobs',
          localField:   'job',
          foreignField: '_id',
          as:           'jobData',
        },
      },

      // 3. Flatten (removes entries where job was deleted)
      { $unwind: '$jobData' },

      // 4. Base job filter — only non-deactivated jobs
      //    Use $ne false so jobs without the field (undefined) still pass
      { $match: { 'jobData.active': { $ne: false } } },
    ];

    // 5. Optional filters — each added as its own $match stage
    if (location) {
      pipeline.push({ $match: { 'jobData.location': { $regex: location, $options: 'i' } } });
    }
    if (type) {
      pipeline.push({ $match: { 'jobData.type': type } });
    }
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(days, 10));
      pipeline.push({ $match: { 'jobData.createdAt': { $gte: cutoff } } });
    }
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'jobData.title':   { $regex: search, $options: 'i' } },
            { 'jobData.company': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    // 6. Sort by most recently saved
    pipeline.push({ $sort: { createdAt: -1 } });

    // 7. Paginate with facet
    pipeline.push({
      $facet: {
        total: [{ $count: 'count' }],
        data: [
          { $skip:  (pageNum - 1) * limitNum },
          { $limit: limitNum },
          {
            $project: {
              _id:    1,
              savedAt: '$createdAt',
              job: {
                _id:       '$jobData._id',
                title:     '$jobData.title',
                company:   '$jobData.company',
                location:  '$jobData.location',
                type:      '$jobData.type',
                remote:    '$jobData.remote',
                salary:    '$jobData.salary',
                createdAt: '$jobData.createdAt',
              },
            },
          },
        ],
      },
    });

    const [result] = await SavedJob.aggregate(pipeline);
    const total    = result?.total[0]?.count ?? 0;
    const pages    = Math.ceil(total / limitNum) || 1;

    res.json({
      savedJobs:  result?.data ?? [],
      pagination: { total, page: pageNum, pages, limit: limitNum },
    });
  } catch (err) {
    next(err);
  }
};
