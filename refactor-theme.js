const fs = require('fs');
const path = require('path');

const dirsToScan = ['src', 'components'];

const replacements = [
  { regex: /#e0e5ec/g, replacement: 'var(--nm-bg)' },
  { regex: /#a3b1c6/g, replacement: 'var(--nm-shadow-dark)' },
  { regex: /#ffffff/g, replacement: 'var(--nm-shadow-light)' },
  { regex: /bg-\[#e0e5ec\]/g, replacement: 'bg-[var(--nm-bg)]' }, // Wait, the first regex will turn bg-[#e0e5ec] into bg-[var(--nm-bg)] automatically!
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Perform replacements
      content = content.replace(/bg-\[#e0e5ec\]/g, 'bg-[var(--nm-bg)]');
      content = content.replace(/#e0e5ec/g, 'var(--nm-bg)');
      content = content.replace(/#a3b1c6/g, 'var(--nm-shadow-dark)');
      content = content.replace(/#ffffff/g, 'var(--nm-shadow-light)');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

dirsToScan.forEach(dir => {
  const fullPath = path.join(__dirname, 'studyweb', dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
});
console.log('Theme refactoring complete.');
