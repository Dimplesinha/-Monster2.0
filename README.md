# JobBoard — Full-Stack Job Portal

A Monster.com-inspired job portal built with React + Vite, Node/Express, and MongoDB.

## Project Structure

```
Monster2.0/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
└── .github/
    └── workflows/   # GitHub Actions CI
```

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, React Router, CSS Modules |
| Backend    | Node.js, Express 4, Mongoose            |
| Database   | MongoDB (Atlas in production)           |
| Auth       | JWT + bcrypt                            |
| API Docs   | Swagger (OpenAPI 3.0)                   |
| CI         | GitHub Actions                          |
| Deploy FE  | Vercel                                  |
| Deploy BE  | Render                                  |

## Quick Start

### Prerequisites
- Node 20+
- MongoDB running locally (or Atlas URI)

### 1. Clone & install

```bash
# client
cd client && npm install

# server
cd server && npm install
```

### 2. Environment variables

```bash
# client
cp client/.env.example client/.env

# server
cp server/.env.example server/.env
# → fill in MONGODB_URI and JWT_SECRET
```

### 3. Run locally

```bash
# In one terminal
cd server && npm run dev    # http://localhost:5000

# In another
cd client && npm run dev    # http://localhost:3000
```

### 4. API Docs

With the server running: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

## Deployment

### Frontend → Vercel
1. Import the `client/` directory (or set root to `client`)
2. Set build command: `npm run build`, output: `dist`
3. Add env var `VITE_API_BASE_URL` pointing to your Render backend URL

### Backend → Render
1. Create a new **Web Service**, point to `server/`
2. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `NODE_ENV=production`
3. `render.yaml` is included for blueprint deploys

---

## API Endpoints (summary)

| Method | Path                          | Auth     | Description                  |
|--------|-------------------------------|----------|------------------------------|
| POST   | /api/auth/register            | —        | Register                     |
| POST   | /api/auth/login               | —        | Login → JWT                  |
| GET    | /api/auth/me                  | JWT      | Current user                 |
| GET    | /api/jobs                     | —        | List/search jobs             |
| POST   | /api/jobs                     | employer | Create job                   |
| GET    | /api/jobs/:id                 | —        | Job detail                   |
| DELETE | /api/jobs/:id                 | employer | Delete own job               |
| POST   | /api/jobs/:id/apply           | seeker   | Apply to job                 |
| GET    | /api/applications/mine        | seeker   | My applications              |
| GET    | /api/applications/job/:jobId  | employer | Applicants for a job         |
| PATCH  | /api/applications/:id/status  | employer | Update application status    |

Full interactive docs at `/api/docs` (Swagger UI).

---

## Roles

| Role      | Capabilities                                         |
|-----------|------------------------------------------------------|
| jobseeker | Browse/search jobs, apply, view own applications     |
| employer  | Post/delete own jobs, view applicants, update status |
| admin     | All employer capabilities across all jobs            |
