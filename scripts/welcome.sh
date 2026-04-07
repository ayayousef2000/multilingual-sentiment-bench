set -euo pipefail

WORKSPACE=/workspace

# ── Safety: mark workspace as safe for git ───────────────────────────────────
git config --global --add safe.directory "$WORKSPACE" 2>/dev/null || true

# ── Auto-create .env from example if it doesn't exist ────────────────────────
if [ ! -f "$WORKSPACE/.env" ] && [ -f "$WORKSPACE/.env.example" ]; then
  cp "$WORKSPACE/.env.example" "$WORKSPACE/.env"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀  react-template — dev container ready"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Tier 3: fully initialised project ────────────────────────────────────────
if [ -f "$WORKSPACE/pnpm-lock.yaml" ] && [ -f "$WORKSPACE/vite.config.ts" ]; then
  echo ""
  echo "  ✅  Project detected — ready to code"
  echo ""
  echo "  ❯ Git aliases:  gs · ga · gc · gp"
  echo "  📖  https://github.com/ayayousef2000/react-template"

# ── Tier 2: hooks installed, framework not yet scaffolded ────────────────────
elif [ -f "$WORKSPACE/pnpm-lock.yaml" ]; then
  echo ""
  echo "  ✅  Husky + commitlint ready"
  echo "  ℹ️   Framework not yet scaffolded"
  echo ""
  echo "  ┌─ Next step ─────────────────────────────────────────────────────┐"
  echo "  │  Scaffold your project, then run pnpm install                   │"
  echo "  └─────────────────────────────────────────────────────────────────┘"
  echo ""
  echo "  ❯ Git aliases:  gs · ga · gc · gp"
  echo "  📖  https://github.com/ayayousef2000/react-template"

# ── Tier 1: fresh template, nothing installed ────────────────────────────────
else
  echo ""
  echo "  👋  Fresh template — nothing installed yet"
  echo ""
  echo "  ┌─ Step 1: Install git hooks ─────────────────────────────────────┐"
  echo "  │  pnpm install                                                   │"
  echo "  │  (installs Husky + commitlint and registers all git hooks)      │"
  echo "  └─────────────────────────────────────────────────────────────────┘"
  echo ""
  echo "  ┌─ Step 2: Scaffold your project ────────────────────────────────┐"
  echo "  │  Run your framework's init command, then pnpm install           │"
  echo "  └─────────────────────────────────────────────────────────────────┘"
  echo ""
  echo "  ┌─ Step 3: Start developing ──────────────────────────────────────┐"
  echo "  │  pnpm dev                                                       │"
  echo "  └─────────────────────────────────────────────────────────────────┘"
  echo ""
  echo "  📖  https://github.com/ayayousef2000/react-template"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
