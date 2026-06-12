$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

$backend = $null
$frontend = $null

function Stop-DevProcesses {
  foreach ($proc in @($frontend, $backend)) {
    if ($proc -and -not $proc.HasExited) {
      Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
  }
}

try {
  Write-Host "Start backend on :8000"
  $backend = Start-Process -FilePath "uv" `
    -ArgumentList @("run", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000") `
    -WorkingDirectory $backendDir `
    -PassThru -NoNewWindow

  Write-Host "Start frontend on :5173"
  # npm on Windows is npm.cmd; Start-Process cannot invoke it directly by name "npm"
  $frontend = Start-Process -FilePath "cmd.exe" `
    -ArgumentList @("/c", "npm", "run", "dev") `
    -WorkingDirectory $frontendDir `
    -PassThru -NoNewWindow

  Wait-Process -Id $backend.Id, $frontend.Id
} finally {
  Stop-DevProcesses
}
