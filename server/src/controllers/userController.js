'use strict';

const fs   = require('fs');
const path = require('path');
const User = require('../models/User');
const { parseResume } = require('../utils/resumeParser');

/* ── POST /api/users/me/resume ───────────────────────────────────── */
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;

    const resumeMeta = {
      originalName: originalname,
      fileName:     filename,
      mimeType:     mimetype,
      size,
      uploadedAt:   new Date(),
    };

    // Delete previous resume file (best-effort)
    const existing = await User.findById(req.user.id).select('resume contactInfo');
    if (existing?.resume?.fileName) {
      const oldPath = path.join(__dirname, '../../uploads/resumes', existing.resume.fileName);
      fs.unlink(oldPath, () => {});
    }

    // ── Parse the uploaded resume ──────────────────────────────────
    const resolvedPath = filePath || path.join(__dirname, '../../uploads/resumes', filename);
    let parsed = null;
    try {
      parsed = await parseResume(resolvedPath);
    } catch (parseErr) {
      console.error('[uploadResume] parseResume failed:', parseErr.message);
    }

    // Build the $set payload
    const setPayload = {
      resume:                      resumeMeta,
      'onboarding.resumeUploaded': true,
    };

    if (parsed) {
      setPayload.resumeParsed  = true;
      setPayload.summary       = parsed.summary       || '';
      setPayload.skills        = parsed.skills        || [];
      setPayload.workExperience= parsed.workExperience|| [];
      setPayload.education     = parsed.education     || [];
      setPayload.profileLinks  = parsed.profileLinks  || [];

      // Auto-fill contactInfo only if the candidate hasn't completed it yet
      if (!existing?.contactInfo) {
        const nameParts = (parsed.name || '').trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName  = nameParts.slice(1).join(' ') || '';

        if (firstName || parsed.phone || parsed.email) {
          setPayload.contactInfo = {
            firstName:        firstName,
            lastName:         lastName,
            phoneCountryCode: parsed.phoneCountryCode || '+1',
            phone:            parsed.phone            || '',
            country:          '',
            zipCode:          '',
            city:             '',
            authorizedToWork: null,
          };
        }
      }
    }

    await User.findByIdAndUpdate(req.user.id, { $set: setPayload });

    return res.status(201).json({
      message:      'Resume uploaded successfully.',
      resume:       resumeMeta,
      resumeParsed: !!parsed,
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/users/me/resume ────────────────────────────────────── */
exports.getResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('resume');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.resume || !user.resume.fileName) {
      return res.status(404).json({ message: 'No resume on file.' });
    }

    const { originalName, mimeType, size, uploadedAt } = user.resume;
    return res.json({ resume: { originalName, mimeType, size, uploadedAt } });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/users/me/onboarding ────────────────────────────────── */
exports.getOnboarding = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('onboarding contactInfo resumeVisibility jobPreferences');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({
      onboarding:       user.onboarding || {},
      contactInfo:      user.contactInfo || null,
      resumeVisibility: user.resumeVisibility || null,
      jobPreferences:   user.jobPreferences || null,
    });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/users/me/contact-info ───────────────────────────── */
exports.updateContactInfo = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneCountryCode, phone, country, zipCode, city, authorizedToWork } = req.body;

    if (!firstName || !lastName || !country || !zipCode || !city) {
      return res.status(400).json({
        message: 'First name, last name, country, zip code, and city are required.',
      });
    }
    if (authorizedToWork === undefined || authorizedToWork === null) {
      return res.status(400).json({ message: 'Work authorization selection is required.' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          contactInfo: {
            firstName: firstName.trim(),
            lastName:  lastName.trim(),
            phoneCountryCode: (phoneCountryCode || '+1').trim(),
            phone:     (phone || '').trim(),
            country:   country.trim(),
            zipCode:   zipCode.trim(),
            city:      city.trim(),
            authorizedToWork: Boolean(authorizedToWork),
          },
          'onboarding.contactInfoCompleted': true,
        },
      },
      { new: true }
    ).select('contactInfo onboarding');

    return res.json({
      message:     'Contact information saved.',
      contactInfo: updated.contactInfo,
      onboarding:  updated.onboarding,
    });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/users/me/resume-visibility ───────────────────────── */
exports.updateResumeVisibility = async (req, res, next) => {
  try {
    const { resumeVisibility } = req.body;
    const allowed = ['hide_contact', 'visible', 'not_visible'];

    if (!resumeVisibility || !allowed.includes(resumeVisibility)) {
      return res.status(400).json({
        message: `resumeVisibility must be one of: ${allowed.join(', ')}.`,
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          resumeVisibility,
          'onboarding.visibilityCompleted': true,
        },
      },
      { new: true }
    ).select('resumeVisibility onboarding');

    return res.json({
      message:          'Visibility preference saved.',
      resumeVisibility: updated.resumeVisibility,
      onboarding:       updated.onboarding,
    });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/users/me/job-preferences ────────────────────────── */
exports.updateJobPreferences = async (req, res, next) => {
  try {
    const { preferredJobTitle, country, city, remoteInterested } = req.body;

    if (!preferredJobTitle || !country || !city) {
      return res.status(400).json({
        message: 'Preferred job title, country, and city are required.',
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          jobPreferences: {
            preferredJobTitle: preferredJobTitle.trim(),
            country:           country.trim(),
            city:              city.trim(),
            remoteInterested:  Boolean(remoteInterested),
          },
          'onboarding.jobPreferencesCompleted': true,
          'onboarding.jobPreferencesSkipped':   false,
        },
      },
      { new: true }
    ).select('jobPreferences onboarding');

    return res.json({
      message:        'Job preferences saved.',
      jobPreferences: updated.jobPreferences,
      onboarding:     updated.onboarding,
    });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/users/me/company-profile ────────────────────────── */
exports.updateCompanyProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, companyName, companySize, website, phone, plan, agreeMarketing } = req.body;

    if (!firstName || !lastName || !companyName || !companySize) {
      return res.status(400).json({
        message: 'First name, last name, company name, and company size are required.',
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          companyProfile: {
            firstName:      firstName.trim(),
            lastName:       lastName.trim(),
            companyName:    companyName.trim(),
            companySize:    companySize.trim(),
            website:        (website || '').trim(),
            phone:          (phone   || '').trim(),
            plan:           plan || 'standard',
            agreeMarketing: Boolean(agreeMarketing),
          },
          employerOnboardingComplete: true,
          // Also update the user's display name from company profile
          name: `${firstName.trim()} ${lastName.trim()}`,
        },
      },
      { new: true }
    ).select('companyProfile employerOnboardingComplete name');

    return res.json({
      message:        'Company profile saved.',
      companyProfile: updated.companyProfile,
      employerOnboardingComplete: updated.employerOnboardingComplete,
    });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/users/me/job-preferences/skip ───────────────────── */
exports.skipJobPreferences = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'onboarding.jobPreferencesSkipped': true } },
      { new: true }
    ).select('onboarding');

    return res.json({
      message:    'Job preferences skipped.',
      onboarding: updated.onboarding,
    });
  } catch (err) {
    next(err);
  }
};
