const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ── Sub-schemas ─────────────────────────────────────────────────── */
const ExperienceSchema = new Schema({
  title:     { type: String, trim: true },
  company:   { type: String, trim: true },
  location:  { type: String, trim: true },
  startDate: { type: String, trim: true },
  endDate:   { type: String, trim: true },
  current:   { type: Boolean, default: false },
  bullets:   [{ type: String, trim: true }],
  description: { type: String, trim: true },
}, { _id: true });

const EducationSchema = new Schema({
  degree:    { type: String, trim: true },
  school:    { type: String, trim: true },
  location:  { type: String, trim: true },
  startDate: { type: String, trim: true },
  endDate:   { type: String, trim: true },
  gpa:       { type: String, trim: true },
  honors:    { type: String, trim: true },
  relevant:  { type: String, trim: true },
}, { _id: true });

const SkillSchema = new Schema({
  name:  { type: String, trim: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', ''], default: '' },
}, { _id: true });

const ProjectSchema = new Schema({
  name:        { type: String, trim: true },
  description: { type: String, trim: true },
  url:         { type: String, trim: true },
  startDate:   { type: String, trim: true },
  endDate:     { type: String, trim: true },
  bullets:     [{ type: String, trim: true }],
}, { _id: true });

const CertSchema = new Schema({
  name:   { type: String, trim: true },
  issuer: { type: String, trim: true },
  date:   { type: String, trim: true },
  url:    { type: String, trim: true },
}, { _id: true });

const LanguageSchema = new Schema({
  name:        { type: String, trim: true },
  proficiency: { type: String, trim: true }, // 'Native', 'Fluent', 'Professional', 'Conversational', 'Basic'
}, { _id: true });

const AwardSchema = new Schema({
  title:       { type: String, trim: true },
  issuer:      { type: String, trim: true },
  date:        { type: String, trim: true },
  description: { type: String, trim: true },
}, { _id: true });

/* ── Main Resume Schema ──────────────────────────────────────────── */
const resumeSchema = new Schema(
  {
    user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    template: { type: Schema.Types.ObjectId, ref: 'ResumeTemplate' },
    title:    { type: String, trim: true, default: 'My Resume' },
    status:   { type: String, enum: ['draft', 'complete'], default: 'draft' },

    personalInfo: {
      name:     { type: String, trim: true, default: '' },
      email:    { type: String, trim: true, default: '' },
      phone:    { type: String, trim: true, default: '' },
      address:  { type: String, trim: true, default: '' },
      city:     { type: String, trim: true, default: '' },
      state:    { type: String, trim: true, default: '' },
      zip:      { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      website:  { type: String, trim: true, default: '' },
      summary:  { type: String, trim: true, default: '' },
    },

    experience:     [ExperienceSchema],
    education:      [EducationSchema],
    skills:         [SkillSchema],
    projects:       [ProjectSchema],
    certifications: [CertSchema],
    languages:      [LanguageSchema],
    awards:         [AwardSchema],

    // Track download events
    downloadCount: { type: Number, default: 0 },
    lastDownloaded: { type: Date },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1 });
resumeSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
