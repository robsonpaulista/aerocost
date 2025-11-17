#!/bin/bash

echo "========================================"
echo "   AeroCost - Iniciando Aplicação"
echo "========================================"
echo ""

echo "[1/2] Iniciando Backend..."
node src/server.js &
BACKEND_PID=$!
sleep 3

echo "[2/2] Iniciando Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "   Aplicação iniciada com sucesso!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:3001 (ou 3000 se disponível)"
echo ""
echo "PIDs: Backend=$BACKEND_PID, Frontend=$FRONTEND_PID"
echo "Pressione Ctrl+C para parar os servidores"
echo ""

wait

