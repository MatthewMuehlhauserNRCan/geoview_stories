# Deploy dist folder to gh-pages branch

Write-Host "Deploying to gh-pages..." -ForegroundColor Green

# Save current branch
$currentBranch = git rev-parse --abbrev-ref HEAD

# Create a temporary directory
$tempDir = New-Item -ItemType Directory -Path (Join-Path $env:TEMP "gh-pages-deploy-$(Get-Random)")
Write-Host "Created temp directory: $tempDir"

try {
    # Copy dist contents to temp directory
    Copy-Item -Path "dist\*" -Destination $tempDir -Recurse -Force
    Write-Host "Copied dist contents to temp directory"
    
    # Go to temp directory
    Push-Location $tempDir
    
    # Initialize git
    git init
    git add -A
    git commit -m "Deploy to GitHub Pages"
    
    # Force push to gh-pages
    git push -f "https://github.com/MatthewMuehlhauserNRCan/geoview_stories.git" main:gh-pages
    
    Write-Host "✅ Deployed successfully!" -ForegroundColor Green
}
finally {
    # Clean up
    Pop-Location
    Remove-Item -Recurse -Force $tempDir
    Write-Host "Cleaned up temp directory"
}
