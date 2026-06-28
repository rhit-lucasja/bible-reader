FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g turbo
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune @bible-reader/web --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=pruner /app/out/full/ .

ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client before building
RUN cd packages/db && npx prisma generate

RUN npm run build --workspace=apps/web

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system -gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]