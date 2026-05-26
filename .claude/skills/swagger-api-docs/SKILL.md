# Swagger API Docs Skill

## Purpose
Keep free Swagger/OpenAPI documentation accurate and useful.

## Owned Areas
- `server/src/swagger/swagger.js`
- Route files in `server/src/routes/*`
- Controller request/response examples where useful

## Requirements
- Swagger UI should be available at `/api/docs` or documented actual route.
- Document auth routes, job routes, application routes, upload routes, and admin routes.
- Include request body schemas.
- Include response examples.
- Include JWT bearer auth setup.
- Mark role requirements in endpoint descriptions.

## Verification
- Start server.
- Open Swagger docs URL.
- Confirm routes render without spec errors.
- Try at least one public endpoint from Swagger.
