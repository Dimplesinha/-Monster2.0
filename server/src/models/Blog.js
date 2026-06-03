const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerRole: {
      type: String,
      enum: ['jobseeker', 'employer'],
      required: true,
    },

    title:       { type: String, required: true, trim: true, maxlength: 200 },
    slug:        { type: String, unique: true, sparse: true, index: true },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    content:     { type: String, default: '' },   // raw Markdown
    tags:        [{ type: String, trim: true, maxlength: 50 }],

    status: {
      type:    String,
      enum:    ['draft', 'published'],
      default: 'draft',
    },

    publishedAt: { type: Date, default: null },
    isDeleted:   { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

/* ── Compound indexes for list queries ───────────────────────────── */
blogSchema.index({ owner: 1, isDeleted: 1, status: 1 });

/* ── Auto-generate slug from title + short _id suffix ───────────── */
blogSchema.pre('save', function (next) {
  if (this.slug) return next();           // already set — skip
  if (!this.title) return next();

  const base = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  this.slug = `${base}-${this._id.toString().slice(-6)}`;
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
