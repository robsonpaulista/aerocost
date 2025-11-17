# Script para verificar estrutura do repositorio
# Uso: .\verificar-estrutura.ps1

Write-Host "Verificando estrutura do repositorio Git..." -ForegroundColor Cyan
Write-Host ""

# Verificar onde esta o repositorio Git
Write-Host "Diretorio raiz do Git:" -ForegroundColor Yellow
try {
    $gitRoot = git rev-parse --show-toplevel 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   $gitRoot" -ForegroundColor Green
    } else {
        Write-Host "   ERRO: Nao e um repositorio Git ou erro ao encontrar" -ForegroundColor Red
    }
} catch {
    Write-Host "   ERRO: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Diretorio atual:" -ForegroundColor Yellow
Write-Host "   $PWD" -ForegroundColor Gray

Write-Host ""
Write-Host "Verificando se 'frontend' existe localmente:" -ForegroundColor Yellow
if (Test-Path "frontend") {
    Write-Host "   OK: Pasta 'frontend' encontrada!" -ForegroundColor Green
    Write-Host "   Arquivos principais:" -ForegroundColor Cyan
    if (Test-Path "frontend/package.json") {
        Write-Host "      OK: package.json" -ForegroundColor Green
    } else {
        Write-Host "      ERRO: package.json NAO encontrado" -ForegroundColor Red
    }
    if (Test-Path "frontend/app") {
        Write-Host "      OK: app/" -ForegroundColor Green
    } else {
        Write-Host "      ERRO: app/ NAO encontrado" -ForegroundColor Red
    }
    if (Test-Path "frontend/next.config.js") {
        Write-Host "      OK: next.config.js" -ForegroundColor Green
    } else {
        Write-Host "      ERRO: next.config.js NAO encontrado" -ForegroundColor Red
    }
} else {
    Write-Host "   ERRO: Pasta 'frontend' NAO encontrada!" -ForegroundColor Red
    Write-Host "   Certifique-se de estar na raiz do projeto." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Arquivos do frontend no Git:" -ForegroundColor Yellow
try {
    $frontendFiles = git ls-files | Select-String "^frontend/"
    if ($frontendFiles) {
        Write-Host "   OK: Frontend esta no Git!" -ForegroundColor Green
        Write-Host "   Total de arquivos: $($frontendFiles.Count)" -ForegroundColor Cyan
        Write-Host "   Primeiros arquivos:" -ForegroundColor Cyan
        $frontendFiles | Select-Object -First 5 | ForEach-Object {
            Write-Host "      $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ERRO: Nenhum arquivo do frontend esta no Git!" -ForegroundColor Red
        Write-Host "   Execute: git add frontend/" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERRO ao verificar: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Status do Git:" -ForegroundColor Yellow
git status --short | Select-Object -First 10

Write-Host ""
Write-Host "Remote configurado:" -ForegroundColor Yellow
git remote -v

Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "   1. Se frontend nao esta no Git: git add frontend/" -ForegroundColor Gray
Write-Host "   2. Criar commit: git commit -m 'feat: adicionar frontend'" -ForegroundColor Gray
Write-Host "   3. Fazer push: git push origin main" -ForegroundColor Gray
Write-Host "   4. Verificar no GitHub se frontend aparece na raiz" -ForegroundColor Gray
