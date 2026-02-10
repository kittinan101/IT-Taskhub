# Deployment Standard

GitHub Actions → AWS ECR → Portainer → Cloudflare Tunnel

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   AWS ECR   │────▶│  Portainer  │────▶│ Cloudflare  │
│   Actions   │     │   (Images)  │     │  (Deploy)   │     │   Tunnel    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     push              docker              webhook            domain
```

## Environments

| Env | Branch | ECR Tag | Port | Domain |
|-----|--------|---------|------|--------|
| Dev | `develop` | `:develop` | 3002 | dev.app.example.com |
| UAT | `uat` | `:uat` | 3001 | uat.app.example.com |
| Prod | `main` | `:latest` | 3000 | app.example.com |

---

## 1. GitHub Actions Workflow

### `.github/workflows/deploy.yml`

```yaml
name: Build & Deploy

on:
  push:
    branches: [develop, uat, main]
  pull_request:
    branches: [develop, uat, main]

env:
  AWS_REGION: ap-southeast-1
  ECR_REGISTRY: <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com
  ECR_REPOSITORY: <app-name>

jobs:
  build:
    name: Build & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  push-image:
    name: Push to ECR
    needs: build
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.set-tag.outputs.TAG }}
    steps:
      - uses: actions/checkout@v4
      
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - uses: aws-actions/amazon-ecr-login@v2
      
      - name: Set image tag
        id: set-tag
        run: |
          if [ "${{ github.ref_name }}" == "main" ]; then
            echo "TAG=latest" >> $GITHUB_OUTPUT
          else
            echo "TAG=${{ github.ref_name }}" >> $GITHUB_OUTPUT
          fi
      
      - name: Build and push
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:${{ steps.set-tag.outputs.TAG }} .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:${{ steps.set-tag.outputs.TAG }}

  deploy-dev:
    needs: push-image
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Portainer
        run: |
          curl -X POST "${{ secrets.PORTAINER_WEBHOOK_URL_DEV }}" \
            -H "Content-Type: application/json" --fail --silent

  deploy-uat:
    needs: push-image
    if: github.ref == 'refs/heads/uat'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Portainer
        run: |
          curl -X POST "${{ secrets.PORTAINER_WEBHOOK_URL_UAT }}" \
            -H "Content-Type: application/json" --fail --silent

  deploy-prod:
    needs: push-image
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Portainer
        run: |
          curl -X POST "${{ secrets.PORTAINER_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" --fail --silent
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret |
| `DATABASE_URL` | PostgreSQL URL (for build) |
| `PORTAINER_WEBHOOK_URL_DEV` | Dev deploy webhook |
| `PORTAINER_WEBHOOK_URL_UAT` | UAT deploy webhook |
| `PORTAINER_WEBHOOK_URL` | Prod deploy webhook |

---

## 2. Dockerfile Best Practices

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Entrypoint
COPY --from=builder --chmod=755 /app/docker-entrypoint.sh ./

USER appuser
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
```

### `docker-entrypoint.sh`

```bash
#!/bin/sh
set -e

# Run migrations (if applicable)
if [ -f "node_modules/prisma/build/index.js" ]; then
  echo "Running database migrations..."
  node node_modules/prisma/build/index.js migrate deploy
fi

echo "Starting application..."
exec node server.js
```

---

## 3. Portainer Stack Template

### Stack Compose

```yaml
version: '3.8'

services:
  app:
    image: ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
    ports:
      - "${HOST_PORT}:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${APP_URL}
      - API_KEYS=${API_KEYS}
    networks:
      - nginx-proxy_default
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  nginx-proxy_default:
    external: true
```

### Portainer Setup

1. **Add ECR Registry**
   - Registries → Add registry → Custom
   - URL: `<account-id>.dkr.ecr.<region>.amazonaws.com`
   - Auth: AWS IAM or `aws ecr get-login-password`

2. **Create Stack**
   - Stacks → Add stack
   - Paste compose, set environment variables

3. **Enable Webhook**
   - Stack → Webhook → Enable
   - Copy URL → Add to GitHub Secrets

---

## 4. Cloudflare Tunnel Setup

### Option A: Cloudflared in Same Stack

```yaml
version: '3.8'

services:
  app:
    image: ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
    expose:
      - "3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - internal
    restart: unless-stopped

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - internal
    restart: unless-stopped
    depends_on:
      - app

networks:
  internal:
    driver: bridge
```

### Option B: Standalone Cloudflared (Recommended)

Run one cloudflared container that routes multiple services:

```yaml
# cloudflared-stack.yml
version: '3.8'

services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - nginx-proxy_default
    restart: unless-stopped

networks:
  nginx-proxy_default:
    external: true
```

### Cloudflare Dashboard Setup

1. **Create Tunnel**
   - Zero Trust → Networks → Tunnels → Create
   - Name: `portainer-tunnel`
   - Copy token

2. **Add Public Hostname**
   - Tunnel → Configure → Public Hostname → Add
   
   | Subdomain | Domain | Service |
   |-----------|--------|---------|
   | dev | example.com | http://it-taskhub-dev:3000 |
   | uat | example.com | http://it-taskhub-uat:3000 |
   | app | example.com | http://it-taskhub-prod:3000 |

3. **DNS (Automatic)**
   - Cloudflare auto-creates CNAME records pointing to tunnel

---

## 5. Health Check Endpoint

Add to your app:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 }
    )
  }
}
```

---

## 6. Checklist

### Initial Setup
- [ ] Create ECR repository
- [ ] Create databases (dev/uat/prod)
- [ ] Setup GitHub Secrets
- [ ] Create Portainer stacks (dev/uat/prod)
- [ ] Enable webhooks, add to GitHub Secrets
- [ ] Create Cloudflare Tunnel
- [ ] Add public hostnames

### Per Deploy
- [ ] Push to branch
- [ ] Verify GitHub Actions pass
- [ ] Verify Portainer pulled new image
- [ ] Verify app health endpoint

---

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| ECR auth failed | Refresh `aws ecr get-login-password` |
| Webhook not triggering | Check Portainer webhook enabled |
| Migration failed | Check DATABASE_URL environment var |
| Tunnel not connecting | Verify token, check cloudflared logs |
| 502 Bad Gateway | Container not healthy, check logs |

---

## Quick Commands

```bash
# Push to dev
git checkout develop && git push origin develop

# Promote dev → uat
git checkout uat && git merge develop && git push origin uat

# Promote uat → prod
git checkout main && git merge uat && git push origin main

# Check ECR images
aws ecr describe-images --repository-name <app> --query 'imageDetails[*].imageTags'

# Cloudflare tunnel status
cloudflared tunnel info <tunnel-id>
```
