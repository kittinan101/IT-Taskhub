# IT-Taskhub

Task Tracker + Incident Management สำหรับทีม IT (~20 users)

## Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **Styling:** Tailwind CSS v4
- **ORM:** Prisma + PostgreSQL
- **Auth:** NextAuth.js (credentials)
- **i18n:** next-intl (EN/TH)
- **Container:** Docker
- **CI/CD:** GitHub Actions → AWS ECR → Portainer

## Features

- ✅ Task CRUD + Kanban board
- ✅ Incident Management + External API
- ✅ Dashboard (summary + charts)
- ✅ Team Management
- ✅ File Attachments
- ✅ i18n (EN/TH)

## Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed default users
npm run db:seed

# Start dev server
npm run dev
```

Open http://localhost:3000

### Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| john.pm | admin123 | PM |
| sarah.ba | admin123 | BA |
| alice.dev | admin123 | Developer |
| bob.dev | admin123 | Developer |
| emma.qa | admin123 | QA |

## Environment Variables

```bash
# .env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# For external incident API
API_KEYS="key1,key2,key3"
```

## CI/CD (GitHub Actions)

### Workflow: `.github/workflows/deploy.yml`

**Triggers:**
- Push to `develop`, `uat`, `main`
- Pull requests to those branches

### Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Build &   │───▶│  Push to    │───▶│  Deploy via │
│    Test     │    │    ECR      │    │  Portainer  │
└─────────────┘    └─────────────┘    └─────────────┘
```

1. **Build & Test** — Install, lint, build
2. **Push to ECR** — Build Docker image, push to AWS ECR
3. **Deploy** — Trigger Portainer webhook

### Branch → Tag Mapping

| Branch | ECR Tag | Deploy | Database |
|--------|---------|--------|----------|
| `develop` | `:develop` | Dev environment | `it_taskhub_dev` |
| `uat` | `:uat` | UAT environment | `it_taskhub_uat` |
| `main` | `:latest`, `:prod` | Production | `it_taskhub` |

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS credentials for ECR |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for ECR |
| `DATABASE_URL` | PostgreSQL connection string (for build) |
| `PORTAINER_WEBHOOK_URL` | Production deploy webhook |
| `PORTAINER_WEBHOOK_URL_UAT` | UAT deploy webhook |
| `PORTAINER_WEBHOOK_URL_DEV` | Dev deploy webhook |

### ECR Repository

```
899522950715.dkr.ecr.ap-southeast-1.amazonaws.com/it-taskhub
```

### Environment Database URLs

```bash
# Dev
DATABASE_URL=postgresql://admin1234:***@postgres.holmcloud.net:5433/it_taskhub_dev

# UAT
DATABASE_URL=postgresql://admin1234:***@postgres.holmcloud.net:5433/it_taskhub_uat

# Production
DATABASE_URL=postgresql://admin1234:***@postgres.holmcloud.net:5433/it_taskhub
```

## Docker

### Build locally

```bash
docker build -t it-taskhub .
```

### Run

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="http://localhost:3000" \
  it-taskhub
```

Container runs `prisma migrate deploy` on startup.

## External API

### Create Incident

```bash
curl -X POST https://taskhub.holmcloud.net/api/v1/incidents \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "title": "Database connection timeout",
    "description": "Users experiencing slow queries",
    "system": "user-service",
    "environment": "PRODUCTION",
    "tier": "CRITICAL"
  }'
```

**Response:**
```json
{
  "success": true,
  "incident": {
    "id": "clxxx...",
    "status": "OPEN"
  }
}
```

See `/incidents/api-docs` in app for full documentation.

## Deployment

### Portainer Setup

1. Create stack with Docker Compose or standalone container
2. Set environment variables
3. Create webhook in Portainer
4. Add webhook URL to GitHub Secrets

### Manual Deploy

```bash
# Pull latest image
docker pull 899522950715.dkr.ecr.ap-southeast-1.amazonaws.com/it-taskhub:latest

# Restart container
docker compose up -d
```

## Links

- **Production:** https://taskhub.holmcloud.net
- **Portainer:** https://portainer.holmcloud.net
- **ECR:** `899522950715.dkr.ecr.ap-southeast-1.amazonaws.com/it-taskhub`
