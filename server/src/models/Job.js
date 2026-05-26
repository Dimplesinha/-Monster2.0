const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
      default: 'Full-time',
    },
    remote: { type: Boolean, default: false },
    salary: { type: String, trim: true },
    description: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ location: 1, type: 1, active: 1 });

jobSchema.virtual('applicantCount', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
  count: true,
});

module.exports = mongoose.model('Job', jobSchema);
