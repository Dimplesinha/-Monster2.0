/**
 * Onboarding helpers for candidate users.
 *
 * nextOnboardingStep(user) → string | null
 *   Returns the path of the first incomplete required onboarding step,
 *   or null if onboarding is complete (or user is not a jobseeker).
 *
 * isOnboardingComplete(user) → boolean
 */

export function nextOnboardingStep(user) {
  if (!user || user.role !== 'jobseeker') return null;

  const o = user.onboarding || {};

  if (!o.resumeUploaded)       return '/resume-upload';
  if (!o.contactInfoCompleted) return '/onboarding/contact-info';
  if (!o.visibilityCompleted)  return '/onboarding/visibility';

  // Job preferences: complete if filled OR explicitly skipped
  if (!o.jobPreferencesCompleted && !o.jobPreferencesSkipped) {
    return '/onboarding/job-preferences';
  }

  return null; // all done
}

export function isOnboardingComplete(user) {
  return nextOnboardingStep(user) === null;
}
