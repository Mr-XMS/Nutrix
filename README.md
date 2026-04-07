# Nutrix

**NDIS Provider Management Platform** — Purpose-built SaaS for Australian disability service providers.

> ⚠️ Working title. Name subject to change due to existing US trademark on "Nutrix."

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10, TypeScript, Prisma ORM |
| Database | PostgreSQL 15 |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Auth | JWT (access + refresh tokens), Passport.js |
| Payments | Stripe Billing |
| Email | SendGrid |
| Cache | Redis (ioredis) |
| Deployment | Railway |
| CI/CD | GitHub Actions |

## Architecture

Multi-tenant SaaS with organisation-scoped data isolation. Every query is scoped to the authenticated user's `organisationId` via JWT claims.

```
backend/
├── prisma/           # Schema, migrations, seed data
│   └── seed/         # NDIS Support Catalogue seed
└── src/
    ├── auth/         # Register, login, JWT, email verification
    ├── common/       # Prisma service, guards, decorators, pipes
    ├── organisations/
    ├── users/
    ├── participants/  # NDIS participants (CRUD, CSV import, search)
    ├── ndis-plans/    # Plan management, funding periods
    ├── service-agreements/
    ├── shifts/        # Rostering, clock-in/out, recurring shifts
    ├── shift-notes/   # Progress notes, handover notes
    ├── invoices/      # NDIS invoicing, PRODA bulk claim CSV
    ├── incidents/     # Incident register, reportable incidents
    └── audit-log/     # Compliance audit trail
```

## Getting Started

```bash
# Clone
git clone https://github.com/Mr-XMS/Nutrix.git
cd nutrix

# Backend setup
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Frontend setup (separate terminal)
cd frontend
npm install
npm run dev
```

## Key NDIS Concepts

- **Participant**: Person receiving NDIS-funded support
- **NDIS Plan**: Funding allocation with start/end dates and budget categories (Core, Capacity Building, Capital)
- **Funding Period**: 1-month or 3-month budget periods within a plan (introduced Oct 2024)
- **Service Agreement**: Contract between provider and participant specifying services and rates
- **Support Item**: NDIS catalogue entry with item number, description, and price limit
- **PRODA**: Provider Digital Access — NDIA's portal for submitting bulk claims
- **SCHADS Award**: Social, Community, Home Care and Disability Services Award — employment conditions

## License

Proprietary. All rights reserved.
