#!/bin/sh

# =============================================================================
# Sarpras Monorepo - Production Start Script
# Runs Sarpras app from standalone build with graceful shutdown support
# =============================================================================

echo "Starting Sarpras production server on port ${PORT:-3000}..."
cd /app/sarpras && PORT="${PORT:-3000}" HOSTNAME="0.0.0.0" exec node src/apps/sarpras/server.js
