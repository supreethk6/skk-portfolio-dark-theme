#!/usr/bin/env bash
# Author: Supreeth Kumar K (SKK)
#
# Wraps `git commit` to enforce the no-AI-attribution policy and surface the draft
# message for humanizer review before commit. Strips any accidental Claude /
# Anthropic / Co-Authored-By footers.
#
# Usage:
#   ./scripts/humanize-commit.sh "<commit message>"
#   ./scripts/humanize-commit.sh -F path/to/message.txt
#   ./scripts/humanize-commit.sh --amend
#
# Banned strings (case-insensitive) — commit aborts if found:
#   - claude
#   - anthropic
#   - "co-authored-by:"
#   - "generated with"
#   - "ai-assist"

set -euo pipefail

BANNED_PATTERNS=(
  'claude'
  'anthropic'
  'co-authored-by:'
  'generated with'
  'ai-assist'
)

scan_for_banned() {
  local content="$1"
  for pat in "${BANNED_PATTERNS[@]}"; do
    if echo "$content" | grep -iqE "$pat"; then
      echo "ERROR: commit message contains banned phrase: '$pat'" >&2
      echo "Policy: no AI-assist or co-author attribution in commits." >&2
      return 1
    fi
  done
  return 0
}

# Collect the message either from -m / -F or stdin
MSG=""
PASSTHROUGH=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message)
      MSG="$2"
      shift 2
      ;;
    -F|--file)
      MSG="$(cat "$2")"
      shift 2
      ;;
    *)
      PASSTHROUGH+=("$1")
      shift
      ;;
  esac
done

if [[ -z "$MSG" ]]; then
  echo "Usage: $0 -m '<message>' | -F <file> [git-commit-args...]" >&2
  exit 2
fi

if ! scan_for_banned "$MSG"; then
  exit 1
fi

# Echo the cleaned message and commit
echo "------ commit message (post-humanizer scan) ------"
echo "$MSG"
echo "---------------------------------------------------"

if [[ ${#PASSTHROUGH[@]} -gt 0 ]]; then
  git commit -m "$MSG" "${PASSTHROUGH[@]}"
else
  git commit -m "$MSG"
fi
