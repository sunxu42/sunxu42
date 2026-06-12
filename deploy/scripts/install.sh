#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-app}"
APP_ROOT="/opt/${APP_NAME}"
CURRENT_LINK="${APP_ROOT}/current"
RELEASE_DIR="${1:-}"

if [[ -z "${RELEASE_DIR}" ]]; then
  echo "Usage: $0 /opt/app/releases/<version>"
  exit 1
fi

mkdir -p "/etc/${APP_NAME}" "/var/lib/${APP_NAME}" "${APP_ROOT}"

if [[ ! -f "/etc/${APP_NAME}/${APP_NAME}.env" ]]; then
  echo "Please create /etc/${APP_NAME}/${APP_NAME}.env before install."
  exit 1
fi

if command -v uv >/dev/null 2>&1; then
  uv venv "${APP_ROOT}/.venv"
  UV_PROJECT_ENVIRONMENT="${APP_ROOT}/.venv" uv sync --frozen --no-default-groups --directory "${RELEASE_DIR}/backend"
else
  python3 -m venv "${APP_ROOT}/.venv"
  "${APP_ROOT}/.venv/bin/pip" install --upgrade pip
  "${APP_ROOT}/.venv/bin/pip" install "${RELEASE_DIR}/backend"
fi

ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"
echo "Install finished. Current release -> ${RELEASE_DIR}"
