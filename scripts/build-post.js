const fs = require('fs');
const path = require('path');

const extensionLibsDir = path.join(__dirname, '..', 'dist', 'libs');

if (!fs.existsSync(extensionLibsDir)) {
  fs.mkdirSync(extensionLibsDir, { recursive: true });
}

// Copy Fuse.js (ES Module)
const fuseSrc = path.join(__dirname, '..', 'node_modules', 'fuse.js', 'dist', 'fuse.basic.min.js');
const fuseTarget = path.join(extensionLibsDir, 'fuse.js');

let copiedFuse = false;
const fuseOptions = [
  path.join(__dirname, '..', 'node_modules', 'fuse.js', 'dist', 'fuse.basic.min.js'),
  path.join(__dirname, '..', 'node_modules', 'fuse.js', 'dist', 'fuse.basic.mjs'),
  path.join(__dirname, '..', 'node_modules', 'fuse.js', 'dist', 'fuse.esm.js'),
  path.join(__dirname, '..', 'node_modules', 'fuse.js', 'dist', 'fuse.min.js')
];

for (const option of fuseOptions) {
  if (fs.existsSync(option)) {
    fs.copyFileSync(option, fuseTarget);
    console.log(`✓ Copied fuse.js from ${path.basename(option)} to dist/libs/fuse.js`);
    copiedFuse = true;
    break;
  }
}

if (!copiedFuse) {
  console.error('❌ Could not find fuse.js build file in node_modules.');
}

// Copy PapaParse
const papaSrc = path.join(__dirname, '..', 'node_modules', 'papaparse', 'papaparse.min.js');
const papaTarget = path.join(extensionLibsDir, 'papaparse.js');
if (fs.existsSync(papaSrc)) {
  fs.copyFileSync(papaSrc, papaTarget);
  console.log('✓ Copied papaparse.js to dist/libs/papaparse.js');
} else {
  console.error('❌ Could not find papaparse.js build file in node_modules.');
}
