#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Installs npm dependencies for the root Next.js app and the worker/ sub-project
# so linting, type-checking, and builds work during remote sessions.
set -euo pipefail

# Only run in the remote (Claude Code on the web) environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "[session-start] Installing root dependencies..."
npm install

echo "[session-start] Installing worker dependencies..."
(cd worker && npm install)

echo "[session-start] Dependency installation complete."
