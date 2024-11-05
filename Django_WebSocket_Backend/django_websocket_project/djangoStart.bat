@echo off
REM Set Django settings module environment variable
set DJANGO_SETTINGS_MODULE=django_websocket_project.settings

REM Start the Daphne server
daphne django_websocket_project.asgi:application
