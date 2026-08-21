const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');
const resolve = (relativePath) => path.join(root, relativePath);

for (const directory of [
  'private-data/assets/audio',
  'private-data/assets/branding',
  'private-data/assets/players',
  'private-data/attendance',
  'private-data/lineups',
  'private-data/outputs',
  'private-data/src',
]) {
  fs.mkdirSync(resolve(directory), {recursive: true});
}

const required = [
  'private-data/src/player-registry.ts',
  'private-data/src/weekly-lineup.ts',
  'private-data/src/final-summary-preview.ts',
  'private-data/assets/audio/lineup-theme-trimmed.mp3',
  'private-data/assets/branding/group-icon.png',
];

const missing = required.filter((relativePath) => !fs.existsSync(resolve(relativePath)));
if (missing.length > 0) {
  console.error('Private setup is incomplete. Create these files first:');
  for (const relativePath of missing) console.error(`  - ${relativePath}`);
  console.error('\nSee PRIVATE_DATA.md for the required structure.');
  process.exit(1);
}

const links = [
  ['src/data/player-registry.ts', '../../private-data/src/player-registry.ts'],
  ['src/data/weekly-lineup.ts', '../../private-data/src/weekly-lineup.ts'],
  ['src/data/final-summary-preview.ts', '../../private-data/src/final-summary-preview.ts'],
  ['public/private', '../private-data/assets'],
  ['lineups', 'private-data/lineups'],
];

for (const [linkPath, target] of links) {
  const absoluteLink = resolve(linkPath);
  fs.mkdirSync(path.dirname(absoluteLink), {recursive: true});

  let existing;
  try {
    existing = fs.lstatSync(absoluteLink);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  if (existing?.isSymbolicLink()) {
    if (fs.readlinkSync(absoluteLink) === target) continue;
    fs.unlinkSync(absoluteLink);
  } else if (existing) {
    console.error(`Refusing to replace non-symlink path: ${linkPath}`);
    process.exit(1);
  }

  fs.symlinkSync(target, absoluteLink);
  console.log(`Linked ${linkPath} -> ${target}`);
}

const syncResult = spawnSync(
  process.execPath,
  [resolve('scripts/run-weekly-lineup.cjs'), 'sync-player-folders'],
  {cwd: root, stdio: 'inherit'},
);
if (syncResult.error) throw syncResult.error;
if (syncResult.status !== 0) process.exit(syncResult.status ?? 1);

console.log('Private data paths are ready.');
