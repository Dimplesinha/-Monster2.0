const mongoose = require('mongoose');

const salaryDataSchema = new mongoose.Schema(
  {
    jobTitle:      { type: String, required: true, trim: true },
    location:      { type: String, required: true, trim: true },
    averageSalary: { type: Number, required: true },
    minSalary:     { type: Number, required: true },
    medianSalary:  { type: Number, required: true },
    maxSalary:     { type: Number, required: true },
    currency:      { type: String, default: 'INR', trim: true },
    source:        { type: String, default: 'Monster India', trim: true },
    lastUpdated:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

salaryDataSchema.index({ jobTitle: 1 });
salaryDataSchema.index({ location: 1 });
salaryDataSchema.index({ jobTitle: 1, location: 1 });
salaryDataSchema.index({ jobTitle: 'text', location: 'text' });

module.exports = mongoose.model('SalaryData', salaryDataSchema);
