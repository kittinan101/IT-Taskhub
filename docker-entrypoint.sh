#!/bin/sh
set -e

echo "=== Database Migration ==="
prisma migrate deploy

echo "=== Starting Application ==="
exec node server.js
