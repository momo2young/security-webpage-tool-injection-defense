# Wrapper to start suzent from anywhere
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir\..
# Delegate to the Python CLI
uv run suzent @args
