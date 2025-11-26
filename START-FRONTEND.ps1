# Frontend Inditas - PowerShell
# Mentes: START-FRONTEND.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Frontend Inditas" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location frontend

Write-Host "Node.js verzio:" -ForegroundColor Cyan
node --version
npm --version
Write-Host ""

Write-Host "Fuggosegek telepitese..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "HIBA: npm install nem sikerult!" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Frontend sikeresen telepitve!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend elerheto: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "NE zard be ezt az ablakot!" -ForegroundColor Yellow
Write-Host ""

npm run dev

pause
