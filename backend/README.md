# app-backend

FastAPI + SQLite backend. Dependencies are managed with [uv](https://docs.astral.sh/uv/).

## Prerequisites

Install uv: https://docs.astral.sh/uv/getting-started/installation/

## Setup

```bash
cd backend
uv sync
```

This creates `.venv` and installs locked dependencies (including dev tools).

## Run

```bash
uv run uvicorn app.main:app --reload --port 8000
```

## Common commands

```bash
uv add <package>          # add a runtime dependency
uv add --group dev <pkg>  # add a dev dependency
uv lock                   # refresh lock file after manual pyproject edits
uv sync                   # install from lock file
```
