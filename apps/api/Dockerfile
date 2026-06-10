FROM base AS pruner
COPY . .
RUN turbo prune @bible-reader/api --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=pruner /app/out/full/ .
RUN npm run build --workspace=packages/db
RUN npm run build --workspace=apps/api

FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system uid 1001 apiuser

COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/packages/db/src/generated ./packages/db/src/generated

USER apiuser

EXPOSE 3001

CMD ["node", "dist/index.js"]