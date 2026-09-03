# =============================================================================
# Sarpras Monorepo - Optimized Multi-stage Dockerfile (Full Non-AVX Support)
# Optimized for caching using Bun (build) and Node 22 Alpine (run)
# =============================================================================

# Stage 1: Install dependencies
FROM oven/bun:1-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package definitions and lockfiles first for better caching
COPY package.json bun.lock ./
COPY src/apps/sarpras/package.json ./src/apps/sarpras/package.json

# Install dependencies using bun install
RUN bun install --frozen-lockfile

# Stage 2: Build Sarpras
FROM oven/bun:1-alpine AS sarpras-builder
WORKDIR /app
COPY --from=deps /app ./
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Stage 3: Production runner (minimal image)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Sarpras standalone output to isolated sarpras directory
COPY --from=sarpras-builder --chown=nextjs:nodejs /app/src/apps/sarpras/public ./sarpras/src/apps/sarpras/public
COPY --from=sarpras-builder --chown=nextjs:nodejs /app/src/apps/sarpras/.next/standalone ./sarpras/
COPY --from=sarpras-builder --chown=nextjs:nodejs /app/src/apps/sarpras/.next/static ./sarpras/src/apps/sarpras/.next/static

# Copy and set the start script
COPY --from=sarpras-builder --chown=nextjs:nodejs /app/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3000

CMD ["sh", "./start.sh"]
