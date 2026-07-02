#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const oldDirs = ['app', 'components', 'constants', 'hooks'];

console.log('🚀 Resetting project to blank state...\n');

oldDirs.forEach((dir) => {
  const dirPath = path.join(root, dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed /${dir}`);
  }
});

console.log('\n✅ Project reset complete. Run `npx expo start` to begin fresh.');
