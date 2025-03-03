@echo off
REM Check if "tls" argument is provided
if "%1"=="ssl" (
    echo Starting Angular with TLS...
      npx ng serve --ssl=true
) else (
    echo Starting Angular without TLS...
      npx ng serve --ssl=false
)
