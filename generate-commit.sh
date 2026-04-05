#!/usr/bin/env bash

DIFF=$(git diff --cached)

if [ -z "$DIFF" ]; then
  echo "No staged changes."
  exit 1
fi

claude generate commit-message <<EOF
Write a high-quality conventional commit message.

Rules:
- Use Conventional Commits format
- Be concise but descriptive
- Include scope if possible
- Mention breaking changes if any

Git diff:
$DIFF
EOF