#!/bin/sh
set -e

echo "=== Database Migration ==="
prisma migrate deploy --schema=./prisma/schema.prisma

echo "=== Starting Application ==="
exec node server.js
