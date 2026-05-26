# Deployment Skill

## Purpose
Prepare the app for free-tier deployment.

## Frontend: Vercel
- Root directory: `client`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Set `VITE_API_BASE_URL` to Render backend API URL.

## Backend: Render
- Root directory: `server`.
- Build command: `npm install`.
- Start command: `npm start`.
- Set env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN`, `NODE_ENV=production`.

## Database: MongoDB Atlas
- Use free M0 cluster.
- Put database name in URI, for example `/jobboard`.
- Add Render outbound access as needed, or temporarily allow broad access for demo.

## Documentation Requirements
- Update README with exact deployment steps.
- Include `.env.example` updates.
- Mention free-tier limitations such as Render sleep.

## Verification
- Frontend loads deployed URL.
- Backend health/API route responds.
- Auth and job search work against deployed API.
