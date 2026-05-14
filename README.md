# Amanicare API

Privacy-first Next.js API for Amanicare. The backend supports anonymous users, OTP-based sign up/sign in, help requests, resources, wellness articles, and anonymous support chat.

## Requirements

- Node.js 20 or newer
- npm
- MariaDB or MySQL database

## Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

If `.env.example` does not exist yet, create `.env` manually:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"
CONTACT_HASH_PEPPER="replace-with-a-long-random-secret"
CODE_HASH_PEPPER="replace-with-another-long-random-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-private-admin-password"
ADMIN_AUTH_SECRET="replace-with-a-long-random-admin-cookie-secret"
```

`DATABASE_URL` is required by Prisma. The pepper values are used before hashing contact identifiers and OTP codes; set strong values outside local development so stored identifiers cannot be trivially reversed.

`ADMIN_EMAIL` and `ADMIN_PASSWORD` can bootstrap access to the admin dashboard. Once signed in, use `/admin/settings` to create database-backed admin users with roles. `ADMIN_AUTH_SECRET` signs the HTTP-only admin cookie, so use a strong random value in production. Local development allows access without admin credentials if no admin access variables or admin users are set.

`ADMIN_DASHBOARD_KEY` is still supported as a fallback for key-based access. If set, open the dashboard with `http://localhost:3000/admin?key=YOUR_KEY`.

## Install

```bash
npm install
```

The `postinstall` script runs `prisma generate` automatically.

## Prisma

The Prisma schema lives at:

```bash
prisma/schema.prisma
```

The generated Prisma client is written to:

```bash
generated/prisma
```

Useful commands:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run db:seed
```

Use `npm run prisma:migrate` after changing `prisma/schema.prisma` or when setting up a fresh database. This creates and applies a local migration.

For a disposable local testing database, you can sync the schema without creating a migration:

```bash
npm exec -- prisma db push
```

Seed the database after migrations:

```bash
npm run db:seed
```

The seed adds resource categories, localized resources, localized wellness articles, and a mobile app test user. The test session token printed by the seed can be used as a bearer token:

```http
Authorization: Bearer amanicare-mobile-test-token
```

Localized seed content currently includes English (`en`) and Swahili (`sw`) examples.

To validate the schema without applying migrations:

```bash
npm exec prisma validate
```

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

The admin dashboard is available at `http://localhost:3000/admin`. It includes mobile-friendly sidebar navigation with a home dashboard for help request triage and anonymous support chat, plus separate `/admin/resources` and `/admin/articles` pages for resource/category creation and wellness article publishing.

## Checks

```bash
npm run lint
npm run build
```

## API Overview

Android integration details live in [docs/android-api.md](docs/android-api.md).

- `POST /api/auth/request-code` requests an email or phone verification code.
- `POST /api/auth/verify-code` verifies the code, creates or resumes an anonymous user, and creates a session.
- `GET /api/me` returns the current anonymous user.
- `POST /api/quick-exit` revokes the current session cookie.
- `GET/POST /api/help-requests` lists or creates help/report requests.
- `GET /api/resource-categories?locale=en` lists localized resource categories.
- `GET /api/resources?locale=en&category=legal-aid` lists localized resources.
- `GET /api/wellness?locale=en` lists localized wellness articles.
- `GET/POST /api/chat/sessions` lists or creates anonymous chat sessions.
- `GET/POST /api/chat/sessions/:sessionId/messages` lists or sends chat messages.

Content APIs accept a `locale` query parameter such as `en` or `sw`. If a translation is missing, the API falls back to the record's default language.
