# Auth Skill

## Purpose
Implement and maintain registration, login, current user, JWT, password hashing, and role-based access.

## Owned Areas
- `server/src/controllers/authController.js`
- `server/src/routes/auth.js`
- `server/src/middleware/auth.js`
- `server/src/models/User.js`
- `client/src/context/AuthContext.jsx`
- `client/src/pages/Login.jsx`
- `client/src/pages/Register.jsx`
- `client/src/components/ProtectedRoute.jsx`

## Backend Requirements
- Register users with roles: `jobseeker`, `employer`, `admin`.
- Hash passwords with bcrypt before saving.
- Login returns JWT and safe user object.
- `/api/auth/me` returns current user from token.
- Never return password hashes in API responses.
- Validate required fields and duplicate email.
- Use `JWT_SECRET` and `JWT_EXPIRES_IN` from env.

## Frontend Requirements
- Login and register forms should call real backend APIs.
- Store token safely enough for demo use.
- Auth context should expose user, token, login, register, logout, and loading state.
- Protected routes should block unauthenticated users.
- Role-based routes should block wrong roles.
- Show clear errors for invalid login/register.

## Verification
- Register a candidate and employer.
- Confirm users appear in MongoDB `users` collection.
- Login and refresh page; user session should remain usable.
- Confirm password is hashed in MongoDB.
