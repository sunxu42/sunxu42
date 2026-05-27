#!/usr/bin/env bash
set -euo pipefail

sudo systemctl restart app-backend
sudo nginx -t
sudo systemctl reload nginx
echo "Restart done."
