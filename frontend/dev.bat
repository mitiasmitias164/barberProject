@echo off
echo [SRE] Limpando portas 5173 (Frontend) e 8000 (Backend/API)...

:: Kill Listeners on 5173
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo Matando PID %%a na porta 5173...
    taskkill /f /pid %%a
)

:: Kill Listeners on 8000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo Matando PID %%a na porta 8000...
    taskkill /f /pid %%a
)

echo.
echo [SRE] Portas limpas. Iniciando Frontend...
npm run dev
