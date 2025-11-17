# Script para fazer push com token do GitHub
# Uso: .\push.ps1 SEU_TOKEN_AQUI

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

Write-Host "🔐 Configurando remote com token..." -ForegroundColor Cyan

# Configurar remote com token
git remote set-url origin "https://$Token@github.com/robsonpaulista/aerocost.git"

Write-Host "✅ Remote configurado!" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Fazendo push..." -ForegroundColor Cyan

# Fazer push
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: O token está na URL do remote." -ForegroundColor Yellow
    Write-Host "   Para remover o token da URL depois, execute:" -ForegroundColor Yellow
    Write-Host "   git remote set-url origin https://github.com/robsonpaulista/aerocost.git" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push. Verifique o token e tente novamente." -ForegroundColor Red
}

