@echo off
cd /d %~dp0
cd Ver1.0.0\backend
start "Backend" python main.py
cd ..\..

cd Ver1.0.0\frontend
start "Frontend" npm run dev
cd ..\..

start http://localhost:5173
