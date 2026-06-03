const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/* ── Resume upload metadata ──────────────────────────────────────── */
const resumeSchema = new mongoose.Schema(
  {
    originalName: { type: String },
    fileName:     { type: String },
    mimeType:     { type: String },
    size:         { type: Number },
    uploadedAt:   { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ── Onboarding progress flags ───────────────────────────────────── */
const onboardingSchema = new mongoose.Schema(
  {
    resumeUploaded:          { type: Boolean, default: false },
    contactInfoCompleted:    { type: Boolean, default: false },
    visibilityCompleted:     { type: Boolean, default: false },
    jobPreferencesCompleted: { type: Boolean, default: false },
    jobPreferencesSkipped:   { type: Boolean, default: false },
  },
  { _id: false }
);

/* ── Contact information ─────────────────────────────────────────── */
const contactInfoSchema = new mongoose.Schema(
  {
    firstName:        { type: String },
    lastName:         { type: String },
    phoneCountryCode: { type: String },
    phone:            { type: String },
    country:          { type: String },
    zipCode:          { type: String },
    city:             { type: String },
    authorizedToWork: { type: Boolean },
  },
  { _id: false }
);

/* ── Job search preferences ──────────────────────────────────────── */
const jobPreferencesSchema = new mongoose.Schema(
  {
    preferredJobTitle: { type: String },
    country:           { type: String },
    city:              { type: String },
    remoteInterested:  { type: Boolean, default: false },
  },
  { _id: false }
);

/* ── Work experience entry ───────────────────────────────────────── */
const workExperienceSchema = new mongoose.Schema(
  {
    title:       { type: String },
    company:     { type: String },
    startDate:   { type: String },
    endDate:     { type: String },
    isCurrent:   { type: Boolean, default: false },
    location:    { type: String },
    description: { type: String },
  },
  { _id: false }
);

/* ── Education entry ─────────────────────────────────────────────── */
const educationSchema = new mongoose.Schema(
  {
    degree:       { type: String },
    institution:  { type: String },
    fieldOfStudy: { type: String },
    startYear:    { type: String },
    endYear:      { type: String },
    location:     { type: String },
  },
  { _id: false }
);

/* ── Employer company profile ────────────────────────────────────── */
const companyProfileSchema = new mongoose.Schema(
  {
    firstName:   { type: String },
    lastName:    { type: String },
    companyName: { type: String },
    companySize: { type: String },
    website:     { type: String },
    phone:       { type: String },
    plan:        { type: String, default: 'standard' },
    agreeMarketing: { type: Boolean, default: false },
  },
  { _id: false }
);

/* ── Profile link ────────────────────────────────────────────────── */
const profileLinkSchema = new mongoose.Schema(
  {
    url:   { type: String },
    label: { type: String },
  },
  { _id: false }
);

/* ── Main user schema ────────────────────────────────────────────── */
const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role:     { type: String, enum: ['jobseeker', 'employer', 'admin'], default: 'jobseeker' },

    // Email verification — codes are hidden from normal queries
    emailVerified:            { type: Boolean, default: false },
    emailVerificationCode:    { type: String,  select: false },
    emailVerificationExpires: { type: Date,    select: false },

    // Resume upload metadata (jobseeker only)
    resume: { type: resumeSchema, default: null },

    // Onboarding progress (jobseeker only)
    onboarding: { type: onboardingSchema, default: () => ({}) },

    // Candidate profile fields
    contactInfo:      { type: contactInfoSchema, default: null },
    resumeVisibility: {
      type: String,
      enum: ['hide_contact', 'visible', 'not_visible'],
      default: null,
    },
    jobPreferences:  { type: jobPreferencesSchema, default: null },

    // Employer company profile (employer only)
    companyProfile:              { type: companyProfileSchema, default: null },
    employerOnboardingComplete:  { type: Boolean, default: false },

    // Parsed resume data (auto-populated from uploaded resume)
    resumeParsed:  { type: Boolean, default: false },
    summary:       { type: String,  default: '' },
    skills:        [{ type: String }],
    workExperience:[workExperienceSchema],
    education:     [educationSchema],
    profileLinks:  [profileLinkSchema],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
