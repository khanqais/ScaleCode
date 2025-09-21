

Write-Host "🚀 Starting Vercel Deployment for ScaleCode..." -ForegroundColor Green


if (-not (Test-Path "frontend/package.json")) {
    Write-Host " Error: Please run this script from the ScaleCode project root directory" -ForegroundColor Red
    exit 1
}


Write-Host "Installing dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install


$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}


Write-Host "Deploying to Vercel..." -ForegroundColor Green
vercel

Write-Host "Deployment initiated! Check your Vercel dashboard for status." -ForegroundColor Green
Write-Host "Don't forget to set your environment variables in Vercel dashboard!" -ForegroundColor Cyan
Write-Host "See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan

Set-Location ..