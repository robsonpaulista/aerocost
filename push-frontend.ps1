# Script para adicionar e fazer push do frontend
# Uso: .\push-frontend.ps1 [TOKEN]

param(
    [string]$Token = ""
)

Write-Host "🔍 Verificando estrutura do projeto..." -ForegroundColor Cyan

# Verificar se frontend existe
if (-not (Test-Path "frontend")) {
    Write-Host "❌ ERRO: Pasta 'frontend' não encontrada!" -ForegroundColor Red
    Write-Host "   Certifique-se de estar na raiz do projeto." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Pasta 'frontend' encontrada" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Verificando status do Git..." -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "📦 Adicionando arquivos do frontend..." -ForegroundColor Cyan
git add frontend/
git add vercel.json
git add *.md

Write-Host ""
Write-Host "💾 Criando commit..." -ForegroundColor Cyan
git commit -m "feat: adicionar frontend e configuração do Vercel"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nenhuma alteração para commitar." -ForegroundColor Yellow
    Write-Host "   Verificando se já está tudo commitado..." -ForegroundColor Yellow
    git log --oneline -1
} else {
    Write-Host "✅ Commit criado!" -ForegroundColor Green
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
Write-Host "   (Se pedir autenticação, use seu token do GitHub)" -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Verifique no GitHub:" -ForegroundColor Cyan
    Write-Host "   https://github.com/robsonpaulista/aerocost" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Verifique se a pasta 'frontend/' aparece no GitHub" -ForegroundColor Gray
    Write-Host "   2. Vá no Vercel e faça um novo deploy" -ForegroundColor Gray
    Write-Host "   3. Configure Root Directory como 'frontend'" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Erro ao fazer push." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Se precisar de autenticação:" -ForegroundColor Yellow
    Write-Host "   1. Crie um token: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host "   2. Execute: .\push-frontend.ps1 -Token SEU_TOKEN" -ForegroundColor Gray
    Write-Host "   OU" -ForegroundColor Gray
    Write-Host "   3. Execute: git push origin main" -ForegroundColor Gray
    Write-Host "      (use o token como senha quando pedir)" -ForegroundColor Gray
}

