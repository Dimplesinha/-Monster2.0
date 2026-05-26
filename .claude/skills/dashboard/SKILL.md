# Dashboard Skill

## Purpose
Build role-based dashboards for candidates, employers, and admins.

## Owned Areas
- `client/src/pages/Dashboard.jsx`
- `client/src/pages/Dashboard.module.css`
- Dashboard-related API calls and components

## Candidate Dashboard
- Profile summary.
- Saved jobs.
- Applied jobs with status.
- Resume upload area.
- Recommended jobs if available.

## Employer Dashboard
- Company/profile summary.
- Posted jobs.
- Create/edit/delete job actions.
- Applicants by job.
- Application status controls if backend supports them.

## Admin Dashboard
- Users overview.
- Jobs overview.
- Applications overview.
- Basic remove/manage actions.

## UX Requirements
- Dashboard should adapt to role from auth context.
- Show empty states for new accounts.
- Protect dashboard behind login.
- Keep mobile layout usable.

## Verification
- Login as candidate, employer, and admin.
- Confirm each role sees only intended actions.
