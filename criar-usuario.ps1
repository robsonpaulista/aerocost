# Script para criar o primeiro usuário administrador
# Execute: .\criar-usuario.ps1

$body = @{
    name = "Administrador"
    email = "admin@aerocost.com"
    password = "admin123"
    role = "admin"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Post -Body $body -Headers $headers
    Write-Host "✅ Usuário criado com sucesso!" -ForegroundColor Green
    Write-Host "ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "Nome: $($response.name)" -ForegroundColor Cyan
    Write-Host "Email: $($response.email)" -ForegroundColor Cyan
    Write-Host "Role: $($response.role)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro ao criar usuário:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

