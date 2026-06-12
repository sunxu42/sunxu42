#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-$(date +%Y%m%d-%H%M%S)}"
RELEASE_DIR="release/${VERSION}"

rm -rf "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}"

echo "Building frontend..."
(cd frontend && npm run build)
cp -r frontend/dist "${RELEASE_DIR}/frontend"

echo "Packing backend..."
mkdir -p "${RELEASE_DIR}/backend"
cp -r backend/app "${RELEASE_DIR}/backend/app"
cp backend/pyproject.toml "${RELEASE_DIR}/backend/pyproject.toml"
cp backend/uv.lock "${RELEASE_DIR}/backend/uv.lock"
cp backend/README.md "${RELEASE_DIR}/backend/README.md"

echo "Packing deploy files..."
cp -r deploy "${RELEASE_DIR}/deploy"
echo "${VERSION}" > "${RELEASE_DIR}/VERSION"

echo "Build done: ${RELEASE_DIR}"
