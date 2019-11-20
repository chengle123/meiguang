// @flow
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const dependencies = require('./package.json');

const nodeModulesPath =
  path.join(__dirname, 'node_modules');

if (Object.keys(dependencies || {}).length > 0 && fs.existsSync(nodeModulesPath)) {
  const electronRebuildCmd =
  // './node_modules/.bin/electron-rebuild --parallel --force --types prod,dev,optional --module-dir .';
  './node_modules/.bin/electron-rebuild --parallel --force --module-dir .';

  const cmd = process.platform === 'win32'
    ? electronRebuildCmd.replace(/\//g, '\\')
    : electronRebuildCmd;

  execSync(cmd, {
    cwd: path.join(__dirname)
  });
}