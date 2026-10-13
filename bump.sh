#!/bin/sh
# Bumps the offline cache version, in sw.js and in every script tag of index.html together, so installed copies fetch the new scripts.
# Run before committing a change to any script; the pre-commit hook refuses a script change without it.
set -e
cd "$(dirname "$0")"
n=$(sed -n "s/^const CACHE = 'last-bell-v\([0-9]*\)';/\1/p" sw.js)
[ -n "$n" ] || { echo "bump.sh: no CACHE line in sw.js"; exit 1; }
m=$((n + 1))
sed -i '' "s/last-bell-v$n'/last-bell-v$m'/; s/?v=$n\b/?v=$m/g" sw.js
sed -i '' "s/?v=$n\b/?v=$m/g" index.html
echo "cache v$n -> v$m ($(grep -c "?v=$m" index.html) script tags in index.html, $(grep -c "?v=$m" sw.js) in sw.js)"
