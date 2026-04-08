# Owkaz — Claude Code Guide

## Project Overview
Nigeria's premier residential real estate marketplace. Full-stack monorepo.

## Stack
- **Backend**: NestJS + TypeORM + PostgreSQL, JWT auth (access 15m / refresh 7d)
- **Frontend**: React 19 + Vite + Redux Toolkit (RTK Query) + React Hook Form + Zod + Tailwind CSS

## Directory Structure
```
owkaz/
├── backend/   # NestJS API on port 3000
└── frontend/  # React/Vite SPA on port 5173 (proxied to :3000)
```

## Running the Project
```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

## Key Patterns

### Backend
- All modules live in `backend/src/<module>/` with `controller`, `service`, `module`, `entity`, and `dto/` files
- DTOs use `class-validator` decorators; always add `@ApiProperty` for Swagger docs
- Guards: `JwtAuthGuard` for auth, `RolesGuard` + `@Roles()` for role-based access
- Use `@CurrentUser()` decorator to get the authenticated user in controllers
- `synchronize: true` is on — TypeORM auto-migrates. Safe for dev, disable in prod.
- API docs: `http://localhost:3000/api/docs`

### Frontend
- API calls via RTK Query — add endpoints to `frontend/src/features/auth/authApi.ts` or the relevant feature API file
- Auth tokens stored in Redux + localStorage; auto-injected as `Authorization: Bearer`
- Forms: React Hook Form + Zod schemas
- Routing: React Router v7, routes defined in `frontend/src/App.tsx`
- Protected routes: wrap with `<ProtectedRoute>` and optionally pass `allowedRoles`
- UI components: `Input`, `Button` in `frontend/src/components/ui/`

### Auth Flow
1. Register/Login → backend issues `accessToken` (15m) + `refreshToken` (7d)
2. Refresh token hash stored in DB (`users.refreshTokenHash`)
3. On 401, frontend auto-calls `/auth/refresh` for new tokens

## User Roles
`admin` | `agent` | `owner` | `buyer`

## User Status
`active` | `suspended` | `pending`

## Environment Variables (Backend)
Copy `.env.example` to `.env`. Required:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN` (default: 15m)
- `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` (default: 7d)
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`
- `FRONTEND_URL` (default: http://localhost:5173)
- `PORT` (default: 3000)
