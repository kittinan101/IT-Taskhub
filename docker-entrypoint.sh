#!/bin/sh
set -e

echo "=== Database Migration ==="
npx prisma migrate deploy

echo "=== Starting Application ==="
exec node server.js
