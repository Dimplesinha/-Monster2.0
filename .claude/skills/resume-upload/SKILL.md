# Resume Upload Skill

## Purpose
Add resume upload for candidates using free-tier-friendly tooling.

## Recommended Approach
- Development: Multer local upload storage.
- Production: Cloudinary free tier or similar free object storage.

## Backend Requirements
- Add upload middleware with file type and size validation.
- Accept PDF/DOC/DOCX where feasible.
- Store resume URL/path and metadata on user profile or application.
- Protect upload endpoint for `jobseeker` role.
- Never trust original file names for storage paths.

## Frontend Requirements
- Candidate dashboard upload component.
- Show selected file, upload progress/loading, success, and error.
- Display current resume metadata if available.

## Security
- Validate MIME type and extension.
- Limit file size.
- Do not expose local filesystem paths in production responses.

## Verification
- Upload valid resume.
- Reject unsupported file.
- Confirm uploaded resume metadata is saved.
