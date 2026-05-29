# Stage 1: Dependencies (all deps, including dev for build)
FROM node:25-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build
FROM node:25-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.json next.config.ts auth.ts postcss.config.mjs ./
COPY --from=deps /app/node_modules ./node_modules
COPY app/ ./app/
COPY lib/ ./lib/
COPY components/ ./components/
COPY prisma/ ./prisma/
COPY public/ ./public/

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma requires libssl on Alpine
RUN apk add --no-cache openssl

RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:25-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma requires libssl on Alpine
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install Prisma CLI (matching project version) for migrations at startup
RUN npm install prisma@5.22.0 --no-save

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
# Copy generated Prisma client (from builder's prisma generate)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && chown nextjs:nodejs /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
