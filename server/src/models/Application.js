const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job:       { type: mongoose.Schema.Types.ObjectId, ref: 'Job',  required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
      default: 'pending',
    },
    coverNote: { type: String, maxlength: 2000 },

    // Snapshot of contact info at time of application
    firstName:        { type: String },
    lastName:         { type: String },
    pronouns:         { type: String },
    email:            { type: String },
    phone:            { type: String },
    phoneCountryCode: { type: String },
    country:          { type: String },
    zipCode:          { type: String },
    city:             { type: String },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
