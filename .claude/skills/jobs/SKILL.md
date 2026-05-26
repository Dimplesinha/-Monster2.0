# Jobs Skill

## Purpose
Implement job posting, listing, search, filters, job details, and employer ownership rules.

## Owned Areas
- `server/src/models/Job.js`
- `server/src/controllers/jobController.js`
- `server/src/routes/jobs.js`
- `client/src/pages/Home.jsx`
- `client/src/pages/Jobs.jsx`
- `client/src/pages/JobDetail.jsx`
- `client/src/pages/PostJob.jsx`
- `client/src/components/JobCard.jsx`
- `client/src/components/SearchBar.jsx`

## Backend Requirements
- Public job list endpoint with search and filters.
- Public job detail endpoint.
- Employer/admin-only create job endpoint.
- Employer can edit/delete only their own jobs.
- Admin can manage all jobs.
- Filters should include keyword, location, job type, experience level, salary range, and remote option.
- Return paginated or consistently limited results if data grows.

## Frontend Requirements
- Homepage search should route to jobs page with query params.
- Jobs page should show filters sidebar, results count, job cards, loading state, empty state, and errors.
- Job details page should show role-aware apply/save actions.
- Employer post job form should validate required fields.

## Verification
- Create job as employer.
- Browse jobs without login.
- Search and filter jobs.
- Open job details.
- Confirm unauthorized users cannot create/delete jobs.
