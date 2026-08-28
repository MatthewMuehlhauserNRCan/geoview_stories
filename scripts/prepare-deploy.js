const fs = require('fs');
const path = require('path');

// Helper to recursively copy directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper to copy file
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

console.log('Preparing deployment folder...');

// Clean and create deploy directory
const deployDir = path.join(__dirname, '..', 'deploy');
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// Copy dist folder (built library)
console.log('Copying dist/...');
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  copyDir(distDir, path.join(deployDir, 'dist'));
} else {
  console.warn('Warning: dist/ folder not found. Run "npm run build" first.');
}

// Copy demo folder
console.log('Copying demo/...');
const demoDir = path.join(__dirname, '..', 'demo');
if (fs.existsSync(demoDir)) {
  copyDir(demoDir, path.join(deployDir, 'demo'));
} else {
  console.warn('Warning: demo/ folder not found.');
}

// Copy public files to root
console.log('Copying public files...');
const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  for (const file of publicFiles) {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(deployDir, file);
    
    if (fs.statSync(srcPath).isFile()) {
      copyFile(srcPath, destPath);
    }
  }
}

console.log('✅ Deployment folder prepared successfully!');
console.log(`📁 Location: ${deployDir}`);
console.log('\nContents:');
console.log('  - index.html (documentation)');
console.log('  - dist/geoview-story.js (library)');
console.log('  - demo/index.html (demo page)');
console.log('  - demo/configs/ (demo configs)');
console.log('  - demo/images/ (demo assets)');
console.log('\nRun "npm run serve-deploy" to preview the deployment locally.');
