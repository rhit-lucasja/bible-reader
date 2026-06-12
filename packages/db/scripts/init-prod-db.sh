#!/bin/bash
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  echo "Usage: DATABASE_URL='postgresql://...' ./init-prod-db.sh"
  exit 1
fi

echo "Enabling pgvector extension..."
npx prisma db execute \
  --schema=packages/db/prisma/schema.prisma \
  --stdin <<< 'CREATE EXTENSION IF NOT EXISTS vector;'

echo "Applying migrations..."
npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma

echo "Migrations complete. Database ready."