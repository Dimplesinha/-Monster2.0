# Applications Skill

## Purpose
Handle applying to jobs, viewing candidate applications, and employer applicant management.

## Owned Areas
- `server/src/models/Application.js`
- `server/src/controllers/applicationController.js`
- `server/src/routes/applications.js`
- `server/src/routes/jobs.js`
- `client/src/pages/JobDetail.jsx`
- `client/src/pages/Dashboard.jsx`

## Backend Requirements
- Only `jobseeker` users can apply.
- Prevent duplicate applications to the same job by the same candidate.
- Store application status, candidate, job, employer, resume metadata if available.
- Candidate can view own applications.
- Employer can view applicants for their own jobs.
- Admin can view/manage all applications if implemented.
- Employer can update application status.

## Frontend Requirements
- Candidate can apply from job detail.
- Show success/error feedback.
- Candidate dashboard lists applied jobs and statuses.
- Employer dashboard lists applicants per job.

## Verification
- Candidate applies to a job.
- Duplicate apply is blocked.
- Employer sees applicant.
- Employer can update status if status endpoint exists.
