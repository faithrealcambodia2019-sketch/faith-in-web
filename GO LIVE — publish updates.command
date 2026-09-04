#!/bin/bash
#
# Faith In — publish whatever is ready on main.
#
# Double-click this file. It brings main up to date, merges the fix branch
# if it still has commits of its own, and pushes — which makes Vercel deploy
# faithin.co. Approve the GitHub sign-in if macOS asks for it.
#
cd "$(dirname "$0")" || exit 1

BRANCH=""   # empty: publish whatever is already committed on main

say()  { printf '\n\033[1;35m▸ %s\033[0m\n' "$1"; }
ok()   { printf '\033[0;32m  ✓ %s\033[0m\n' "$1"; }
die()  { printf '\033[0;31m  ✗ %s\033[0m\n\n' "$1"; read -n 1 -s -r -p "Press any key to close."; exit 1; }

say "1/4  Fetching the latest main"
git fetch origin main || die "Could not reach GitHub. Check your internet connection."
ok "Up to date with GitHub"

say "2/4  Switching to main"
git checkout main 2>/dev/null || git checkout -b main origin/main || die "Could not switch to main."
git merge --ff-only origin/main || die "Your main and GitHub's main have both moved. Ask Claude to sort this out."
ok "On main"

say "3/4  Merging the fix branch"
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  git merge --ff-only "$BRANCH" || die "$BRANCH no longer merges cleanly. Open a pull request instead."
fi
COUNT=$(git rev-list --count origin/main..main)
if [ "$COUNT" = "0" ]; then
  printf '\n\033[1;33mNothing new to publish — GitHub already has everything.\033[0m\n\n'
  read -n 1 -s -r -p "Press any key to close this window."
  exit 0
fi
ok "$COUNT commit(s) ready"

say "4/4  Pushing to GitHub"
git push origin main || die "Push failed. If GitHub asked for a login, sign in and run this again."
ok "Pushed — Vercel is building now"

printf '\n\033[1;32mDone.\033[0m Vercel deploys in a minute or two.\n'
printf 'Then hard-refresh the site (Cmd+Shift+R) so the new CSS loads.\n\n'
read -n 1 -s -r -p "Press any key to close this window."
