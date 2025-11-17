# Script para reorganizar estrutura do repositorio Git
# Uso: .\reorganizar-repositorio.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REORGANIZAR REPOSITORIO GIT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se esta na pasta correta
$currentPath = $PWD.Path
Write-Host "Diretorio atual: $currentPath" -ForegroundColor Yellow

if (-not (Test-Path "frontend")) {
    Write-Host "ERRO: Pasta 'frontend' nao encontrada!" -ForegroundColor Red
    Write-Host "Certifique-se de estar na pasta do projeto." -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: Pasta 'frontend' encontrada" -ForegroundColor Green
Write-Host ""

# Confirmar acao
Write-Host "ATENCAO: Isso vai:" -ForegroundColor Yellow
Write-Host "  1. Remover o repositorio Git atual (.git)" -ForegroundColor Gray
Write-Host "  2. Criar novo repositorio nesta pasta" -ForegroundColor Gray
Write-Host "  3. Fazer push forçado para GitHub (sobrescreve)" -ForegroundColor Gray
Write-Host ""
$confirm = Read-Host "Deseja continuar? (S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Operacao cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Passo 1: Removendo .git antigo..." -ForegroundColor Cyan
Remove-Item -Path .git -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "OK: .git removido" -ForegroundColor Green

Write-Host ""
Write-Host "Passo 2: Inicializando novo repositorio..." -ForegroundColor Cyan
git init
Write-Host "OK: Repositorio inicializado" -ForegroundColor Green

Write-Host ""
Write-Host "Passo 3: Adicionando arquivos..." -ForegroundColor Cyan
git add .
Write-Host "OK: Arquivos adicionados" -ForegroundColor Green

Write-Host ""
Write-Host "Passo 4: Criando commit inicial..." -ForegroundColor Cyan
git commit -m "feat: reorganizar estrutura do repositorio"
Write-Host "OK: Commit criado" -ForegroundColor Green

Write-Host ""
Write-Host "Passo 5: Configurando remote..." -ForegroundColor Cyan
git remote add origin https://github.com/robsonpaulista/aerocost.git
Write-Host "OK: Remote configurado" -ForegroundColor Green

Write-Host ""
Write-Host "Passo 6: Verificando branch..." -ForegroundColor Cyan
$branch = git branch --show-current
if (-not $branch) {
    Write-Host "Criando branch 'main'..." -ForegroundColor Yellow
    git branch -M main
    $branch = "main"
}
Write-Host "Branch atual: $branch" -ForegroundColor Green

Write-Host ""
Write-Host "Passo 7: Fazendo push forçado..." -ForegroundColor Cyan
Write-Host "ATENCAO: Isso vai sobrescrever o GitHub!" -ForegroundColor Yellow
Write-Host ""
$confirmPush = Read-Host "Continuar com push? (S/N)"

if ($confirmPush -eq "S" -or $confirmPush -eq "s") {
    git push -u origin $branch --force
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  SUCESSO!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximos passos:" -ForegroundColor Cyan
        Write-Host "  1. Verifique no GitHub: https://github.com/robsonpaulista/aerocost" -ForegroundColor Gray
        Write-Host "  2. Confirme que 'frontend/' aparece na raiz" -ForegroundColor Gray
        Write-Host "  3. No Vercel, configure Root Directory como: frontend" -ForegroundColor Gray
        Write-Host "  4. Faça novo deploy" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "ERRO ao fazer push." -ForegroundColor Red
        Write-Host "Verifique sua autenticacao do GitHub." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Execute manualmente:" -ForegroundColor Cyan
        Write-Host "  git push -u origin $branch --force" -ForegroundColor Gray
    }
} else {
    Write-Host ""
    Write-Host "Push cancelado." -ForegroundColor Yellow
    Write-Host "Execute manualmente quando estiver pronto:" -ForegroundColor Cyan
    Write-Host "  git push -u origin $branch --force" -ForegroundColor Gray
}

