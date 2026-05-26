# Testing And CI/CD Skill

## Purpose
Add confidence through tests and GitHub Actions using free tooling.

## Testing Requirements
- Client: Vitest and React Testing Library if tests are added.
- Server: Jest or Node test runner with Supertest if tests are added.
- Keep initial tests focused on auth, jobs, and protected routes.

## CI Requirements
- GitHub Actions workflow runs on push and pull request to `main` and `dev`.
- Install client dependencies.
- Run client lint if present.
- Run client build.
- Install server dependencies.
- Run server lint/tests if present.
- Do not require paid services.

## CD Notes
- Prefer Vercel GitHub auto-deploy for frontend.
- Prefer Render GitHub auto-deploy for backend.
- GitHub Actions can remain CI-only for the assignment unless deploy hooks are added.

## Verification
- Run workflow locally by checking scripts manually.
- Confirm `client npm run build` works.
- Confirm server starts with valid env.
