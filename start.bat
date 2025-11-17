@echo off
echo ========================================
echo    AeroCost - Iniciando Aplicacao
echo ========================================
echo.

echo [1/2] Iniciando Backend...
start "AeroCost Backend" cmd /k "node src/server.js"
timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend...
start "AeroCost Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo    Aplicacao iniciada com sucesso!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3002
echo.
echo Pressione qualquer tecla para fechar...
pause > nul

