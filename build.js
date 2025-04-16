const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC_DIR = 'src';
const OUT_DIR = 'docs';
const assetMap = {};

// Recursive copy + hash processor
const processDir = (srcPath, outPath) => {
  fs.mkdirSync(outPath, { recursive: true });

  const entries = fs.readdirSync(srcPath, { withFileTypes: true });

  for (const entry of entries) {
    const srcFile = path.join(srcPath, entry.name);
    const outFile = path.join(outPath, entry.name);

    if (entry.isDirectory()) {
      processDir(srcFile, outFile);
    } else {
      const ext = path.extname(entry.name);
      if (ext === '.js' || ext === '.css') {
        const content = fs.readFileSync(srcFile);
        const hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
        const base = path.basename(entry.name, ext);
        const hashedName = `${base}.${hash}${ext}`;
        const outHashedPath = path.join(outPath, hashedName);

        fs.writeFileSync(outHashedPath, content);

        // Save relative mapping
        const relPath = path.relative(SRC_DIR, srcFile).replace(/\\/g, '/');
        const hashedRelPath = path.relative(SRC_DIR, path.join(outPath, hashedName)).replace(/\\/g, '/');
        assetMap[relPath] = hashedRelPath;
      } else {
        // Copy other files directly
        fs.copyFileSync(srcFile, outFile);
      }
    }
  }
};

// Clear output dir
fs.rmSync(OUT_DIR, { recursive: true, force: true });

// Process src folder
processDir(SRC_DIR, OUT_DIR);

// Update HTML files
const replaceRefsInHtml = (filePath) => {
  let html = fs.readFileSync(filePath, 'utf-8');
  for (const [orig, hashed] of Object.entries(assetMap)) {
    html = html.replace(new RegExp(orig, 'g'), hashed);
  }
  fs.writeFileSync(filePath, html);
};

const walkAndProcessHtml = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAndProcessHtml(fullPath);
    } else if (entry.name.endsWith('.html')) {
      replaceRefsInHtml(fullPath);
    }
  }
};

walkAndProcessHtml(OUT_DIR);

console.log('✅ Build complete. Files cache-busted and copied to docs/');
