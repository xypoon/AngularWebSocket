@echo off
REM Set Django settings module environment variable
set DJANGO_SETTINGS_MODULE=django_websocket_project.settings

REM Check if "tls" argument is provided
if "%1"=="ssl" (
    echo Starting Daphne with TLS...
    daphne -e ssl:443:privateKey=../../cert/localhost.key:certKey=../../cert/localhost.crt django_websocket_project.asgi:application
) else (
    echo Starting Daphne without TLS...
    daphne -e tcp:8000 django_websocket_project.asgi:application
)
