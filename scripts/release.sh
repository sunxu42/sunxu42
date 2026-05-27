#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-$(date +%Y%m%d-%H%M%S)}"
./scripts/build.sh "${VERSION}"
tar -czf "release-${VERSION}.tar.gz" -C release "${VERSION}"
echo "Release archive: release-${VERSION}.tar.gz"
