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

python3 -m venv "${APP_ROOT}/.venv"
"${APP_ROOT}/.venv/bin/pip" install --upgrade pip
"${APP_ROOT}/.venv/bin/pip" install -r "${RELEASE_DIR}/backend/requirements.txt"

ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"
echo "Install finished. Current release -> ${RELEASE_DIR}"
