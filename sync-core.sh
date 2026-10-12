#!/bin/sh
# Copies the shared learning engine in from ../learn-core. Change the engine there, never in js/learn-core.js.
set -e
cd "$(dirname "$0")"
cp ../learn-core/learn-core.js js/learn-core.js
grep -o "VERSION = '[^']*'" js/learn-core.js
