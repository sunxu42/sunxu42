#!/usr/bin/env bash
set -euo pipefail

TARGET_RELEASE="${1:-}"
APP_NAME="${APP_NAME:-app}"

if [[ -z "${TARGET_RELEASE}" ]]; then
  echo "Usage: $0 /opt/app/releases/<version>"
  exit 1
fi

ln -sfn "${TARGET_RELEASE}" "/opt/${APP_NAME}/current"
sudo systemctl restart app-backend
sudo systemctl reload nginx
echo "Rollback done -> ${TARGET_RELEASE}"
