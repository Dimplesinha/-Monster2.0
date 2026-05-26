# Admin Skill

## Purpose
Add basic admin management for users, jobs, and applications.

## Backend Requirements
- Admin-only middleware protection.
- Admin can list users without password hashes.
- Admin can view all jobs and applications.
- Admin can remove inappropriate jobs or deactivate users if implemented.

## Frontend Requirements
- Admin dashboard section visible only to admin users.
- Tables/lists for users, jobs, and applications.
- Confirmation before destructive actions.
- Clear loading, empty, and error states.

## Safety
- Do not allow regular candidates/employers to call admin APIs.
- Keep destructive actions explicit.

## Verification
- Candidate cannot access admin UI/API.
- Employer cannot access admin UI/API.
- Admin can view management data.
