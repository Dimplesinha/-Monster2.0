const mongoose = require('mongoose');

const resumeTemplateSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    slug:            { type: String, required: true, unique: true, trim: true, lowercase: true },
    category:        [{ type: String, trim: true }],
    experienceLevel: { type: String, enum: ['Entry', 'Mid-Level', 'Senior', 'Executive', 'All Levels'], default: 'All Levels' },
    style:           { type: String, trim: true },   // 'Classic', 'Modern', 'Creative', 'Minimal', 'Elegant'
    layout:          { type: String, trim: true },   // 'classic' | 'modern-left' | 'modern-right' | 'header-band'
    colorName:       { type: String, trim: true },
    accentColor:     { type: String, trim: true },   // hex e.g. '#6b21a8'
    headerBg:        { type: String, trim: true },   // hex for header/sidebar background
    secondaryBg:     { type: String, trim: true },   // light background for sidebar/accents
    fontFamily:      { type: String, trim: true },
    atsScore:        { type: Number, min: 0, max: 100, default: 95 },
    isPremium:       { type: Boolean, default: false },
    isActive:        { type: Boolean, default: true },
    tags:            [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// slug index is already created by unique:true on the field — no duplicate needed
resumeTemplateSchema.index({ category: 1 });
resumeTemplateSchema.index({ experienceLevel: 1 });
resumeTemplateSchema.index({ isPremium: 1 });
resumeTemplateSchema.index({ name: 'text', category: 'text', style: 'text' });

module.exports = mongoose.model('ResumeTemplate', resumeTemplateSchema);
