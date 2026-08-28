# GitHub Pages Setup Instructions

This document explains how to set up GitHub Pages for your GeoView Story repository.

## Automatic Deployment (Recommended)

The repository is configured with GitHub Actions to automatically deploy to GitHub Pages when you push to the `main` branch.

### First-Time Setup

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will run automatically and deploy your site

3. **Access your site**
   - Your site will be available at: `https://[username].github.io/[repo-name]/`
   - Demo: `https://[username].github.io/[repo-name]/demo/`

### Manual Trigger

You can also manually trigger the deployment:
- Go to **Actions** tab in your GitHub repository
- Click on **Deploy to GitHub Pages** workflow
- Click **Run workflow** → **Run workflow**

## Local Preview

To preview the deployment locally before pushing:

```bash
npm run host
```

This will:
1. Build the library (`npm run build`)
2. Prepare the deployment folder (`npm run prepare-deploy`)
3. Serve the deployment locally on http://localhost:3001

### Manual Steps

If you prefer to run each step individually:

```bash
# Build the library
npm run build

# Prepare deployment folder
npm run prepare-deploy

# Preview deployment
npm run serve-deploy
```

## Deployment Structure

The deployed site has the following structure:

```
/                           # Root (documentation page)
├── index.html             # Library documentation
├── dist/                  # Built library files
│   └── geoview-story.js  # Main library file
└── demo/                  # Demo application
    ├── index.html        # Demo page
    ├── configs/          # Story configurations
    └── images/           # Demo assets
```

## Troubleshooting

### Workflow Fails

If the GitHub Actions workflow fails:
- Check the **Actions** tab for error details
- Ensure all dependencies are in `package.json`
- Verify that `npm run build` works locally

### Demo Not Working

If the demo doesn't work on GitHub Pages:
- Verify paths in `demo/index.html` are correct
- Check browser console for errors
- Ensure `dist/geoview-story.js` exists

### Pages Not Updating

If changes aren't reflected:
- Clear your browser cache
- Wait a few minutes for GitHub to rebuild
- Check the Actions tab to see if the workflow completed

## Custom Domain (Optional)

To use a custom domain:
1. Go to **Settings** → **Pages**
2. Enter your custom domain under **Custom domain**
3. Add a CNAME record in your DNS settings pointing to `[username].github.io`
4. Create a `CNAME` file in the `deploy/` folder with your domain name
   ```bash
   echo "yourdomain.com" > deploy/CNAME
   ```

## Local Development vs Production

- **Local development**: Use `npm run serve` (webpack dev server with hot reload)
- **Production preview**: Use `npm run host` (simulates GitHub Pages deployment)
- **Production deployment**: Push to `main` branch (automatic via GitHub Actions)
