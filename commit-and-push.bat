@echo off
echo.
echo ========================================
echo   COMMIT E PUSH PARA GITHUB
echo ========================================
echo.

echo [1/5] Verificando status...
git status --short
echo.

echo [2/5] Adicionando arquivos...
git add .
echo.

echo [3/5] Criando commit...
git commit -m "chore: atualizar configuração do repositório"
echo.

echo [4/5] Verificando remote...
git remote -v
echo.

echo [5/5] Fazendo push...
echo.
echo IMPORTANTE: Se pedir autenticação:
echo   - Username: robsonpaulista
echo   - Password: COLE SEU TOKEN (nao sua senha!)
echo   - Criar token: https://github.com/settings/tokens
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCESSO! Push realizado!
    echo ========================================
    echo.
    echo Repositorio: https://github.com/robsonpaulista/aerocost
) else (
    echo.
    echo ========================================
    echo   ERRO no push
    echo ========================================
    echo.
    echo Se precisar de token, execute:
    echo   git remote set-url origin https://SEU_TOKEN@github.com/robsonpaulista/aerocost.git
    echo   git push -u origin main
)

pause

