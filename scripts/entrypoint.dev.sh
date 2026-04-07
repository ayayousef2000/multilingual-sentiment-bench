#!/usr/bin/env bash
# =============================================================================
#  scripts/entrypoint.dev.sh — React / Vite dev container
#
#  Execution contexts this script must survive:
#
#  1. VS Code Dev Containers (primary use-case)
#     VS Code overrides the entrypoint at runtime with its own /bin/sh -c
#     wrapper and passes THIS script as $1, not as a command to exec.
#     Result: $@ is empty when our script body runs.
#     Fix: fall back to `sleep infinity` to keep the container alive.
#
#  2. docker compose up (standalone, no VS Code)
#     compose sets entrypoint = this script, command = sleep infinity.
#     Result: $@ = ("sleep" "infinity") → exec'd correctly.
#
#  3. docker run ... mycommand (CI, one-off tasks)
#     Result: $@ = whatever was passed → exec'd correctly.
#
# =============================================================================
set -euo pipefail

# ── 1. SSH key permissions ────────────────────────────────────────────────────
#  Windows NTFS mounts arrive as 777 — SSH refuses keys that are world-readable.
#  This block is idempotent and silent when no SSH dir is present.
if [[ -d /root/.ssh ]]; then
  chmod 700 /root/.ssh
  find /root/.ssh -type f -name "id_*"  ! -name "*.pub" -exec chmod 600 {} +
  find /root/.ssh -type f -name "*.pub"                  -exec chmod 644 {} +
  find /root/.ssh -type f \( -name "config" -o -name "known_hosts*" \) \
                                                         -exec chmod 600 {} +
  echo "🔑  SSH key permissions fixed"
fi

# ── 2. Handoff ────────────────────────────────────────────────────────────────
#  exec "$@"  : replaces this shell with the requested command (zero overhead,
#               correct PID 1, clean signal forwarding).
#
#  sleep infinity fallback: VS Code devcontainer injection leaves $@ empty;
#               we keep the container alive so VS Code can attach and run
#               postCreateCommand / postStartCommand normally.
if [[ $# -gt 0 ]]; then
  exec "$@"
else
  echo "✅  Entrypoint complete — container ready (VS Code devcontainer mode)"
  exec sleep infinity
fi