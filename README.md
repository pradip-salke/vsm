# VS Medu platform foundation

Greenfield TypeScript monorepo for the approved architecture: Next.js public React site, React/Vite admin, Express REST API and MySQL/Prisma. This is a functional foundation and neutral scaffold, not the Figma-based final site or a complete CMS.

## Requirements

- Node.js 22 LTS or newer supported LTS
- npm 10+
- MySQL 8.0+

## Setup

1. Create a MySQL database and user, then copy `.env.example` to `.env` and set `DATABASE_URL` and a unique `SEED_ADMIN_PASSWORD`.
2. Install and prepare the database:

```sh
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
```

For local schema development use `npm run db:migrate -- --name descriptive_change` after editing the Prisma schema. To apply the checked-in initial migration to a fresh database, use `npm run db:deploy`.

3. Start all three apps with `npm run dev`.

URLs: public site <http://localhost:3000>, admin <http://localhost:5173>, API health <http://localhost:4000/health/live>. Sign in using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from `.env`; change the seeded password before sharing any environment.

## Checks

```sh
npm test
npm run build
npm run db:validate
```

### Production API build prerequisites

Install the complete dependency set from the lockfile in a prepared release directory, including development dependencies needed for TypeScript compilation (`npm ci --include=dev`). Do not run `npm ci` against a live installation until its deployment procedure and rollback have been verified.

From the repository root, `npm run build --workspace=@vsmedu/api` now generates the Prisma client and builds the shared contracts before compiling the API. Prisma generation reads the configured `DATABASE_URL` but does not apply migrations or change database records. The production environment must already be configured. If an active Windows process has locked the Prisma engine, stop that process before regenerating the client.

Run database migrations separately only after identifying the correct database, reviewing pending migrations and verifying a backup. Do not run seed scripts against existing production data.

The API currently provides session login/logout/current-user/password change, RBAC-protected dashboard and starter page CRUD/list, published page/programme reads, enquiry submission, and liveness/readiness endpoints. Modules such as uploads, application submission/review, full editorial workflows, export and redirect administration remain follow-up implementation work.

## Configuration notes

For cross-origin development, API CORS is restricted to `WEB_ORIGIN` and `ADMIN_ORIGIN`. Cookies are HttpOnly, SameSite=Lax and use `COOKIE_SECURE=true` in production. If HTTPS is terminated at a trusted proxy, configure `TRUST_PROXY=true` only when the API cannot be reached through an untrusted direct route. Use a secrets manager in hosted environments; never commit `.env`.

The example Nginx virtual hosts are in `infra/nginx/vsmedu.conf`. Review the hostnames and certificate paths before deployment; the admin vhost serves `apps/admin/dist` and proxies `/api/v1/` to Express.
