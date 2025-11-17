# Script para fazer commit e push
# Uso: .\commit-and-push.ps1 [MENSAGEM_DO_COMMIT] [TOKEN]

param(
    [string]$CommitMessage = "chore: atualizar configuração do repositório",
    [string]$Token = ""
)

Write-Host "📋 Verificando status do Git..." -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "📦 Adicionando arquivos..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "💾 Criando commit..." -ForegroundColor Cyan
git commit -m $CommitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nenhuma alteração para commitar ou commit já existe." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 Verificando remote..." -ForegroundColor Cyan
git remote -v

if ($Token) {
    Write-Host ""
    Write-Host "🔐 Configurando remote com token..." -ForegroundColor Cyan
    git remote set-url origin "https://$Token@github.com/robsonpaulista/aerocost.git"
}

Write-Host ""
Write-Host "📤 Fazendo push..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Repositório: https://github.com/robsonpaulista/aerocost" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Se precisar de autenticação:" -ForegroundColor Yellow
    Write-Host "   1. Crie um token: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host "   2. Execute: .\commit-and-push.ps1 -CommitMessage 'sua mensagem' -Token SEU_TOKEN" -ForegroundColor Gray
}

