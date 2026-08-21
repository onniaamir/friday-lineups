const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const failures = [];

let candidates;
try {
  const output = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    {cwd: root, encoding: 'utf8'},
  );
  candidates = output.split('\0').filter(Boolean);
} catch {
  console.error('Public-release checks require this project to be a Git repository.');
  process.exit(1);
}

const prohibitedExact = new Set([
  'src/data/player-registry.ts',
  'src/data/weekly-lineup.ts',
  'src/data/final-summary-preview.ts',
  'public/private',
  'lineups',
]);
const prohibitedPrefixes = [
  '.private-backup/',
  'private-data/',
  'public/private/',
  'public/players/',
  'public/audio/',
  'public/branding/',
  'lineups/',
  'outputs/',
  'examples/',
];

for (const file of candidates) {
  if (prohibitedExact.has(file) || prohibitedPrefixes.some((prefix) => file.startsWith(prefix))) {
    failures.push(`private/generated candidate is visible to Git: ${file}`);
  }
}

const textCandidates = new Map();
for (const file of candidates) {
  const contents = fs.readFileSync(path.join(root, file));
  if (!contents.includes(0)) textCandidates.set(file, contents.toString('utf8'));
}

const secretPatterns = [
  ['AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{30,}\b/g],
  ['GitHub token', /\b(?:github_pat_[0-9A-Za-z_]{20,}|gh[pousr]_[0-9A-Za-z]{20,})\b/g],
  ['OpenAI-style key', /\bsk-[0-9A-Za-z_-]{20,}\b/g],
  ['Slack token', /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g],
  ['npm token', /\bnpm_[0-9A-Za-z]{20,}\b/g],
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
  ['credential assignment', /\b(?:api[_-]?key|client[_-]?secret|password|access[_-]?token|auth[_-]?token)\s*[:=]\s*["'][^"']{6,}["']/gi],
  ['credentials in URL', /https?:\/\/[^/@\s:]+:[^/@\s]+@/g],
];

for (const [file, contents] of textCandidates) {
  for (const [label, pattern] of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(contents)) failures.push(`${label} pattern found in Git-visible file: ${file}`);
  }
  const homeDirectory = process.env.HOME;
  const localUsername = homeDirectory ? path.basename(homeDirectory) : undefined;
  if (
    contents.includes(`file:${'//'}`) ||
    (homeDirectory && contents.includes(`${homeDirectory}/`)) ||
    (localUsername && new RegExp(`\\b${localUsername}\\b`, 'i').test(contents))
  ) {
    failures.push(`local absolute path or username found in Git-visible file: ${file}`);
  }
}

const registryPath = path.join(root, 'src/data/player-registry.ts');
if (fs.existsSync(registryPath)) {
  try {
    const ts = require('typescript');
    require.extensions['.ts'] = (module, filename) => {
      const source = fs.readFileSync(filename, 'utf8');
      const compiled = ts.transpileModule(source, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.CommonJS,
          moduleResolution: ts.ModuleResolutionKind.Node10,
          esModuleInterop: true,
        },
        fileName: filename,
      });
      module._compile(compiled.outputText, filename);
    };
    const {playerRegistry} = require(registryPath);
    const identifiers = new Set();
    for (const profile of Object.values(playerRegistry)) {
      if (profile.id.length >= 4) identifiers.add(profile.id);
      if (profile.displayName.length >= 3) identifiers.add(profile.displayName);
      for (const alias of profile.aliases) {
        if (/\p{Script=Hebrew}/u.test(alias) || alias.trim().length >= 5) identifiers.add(alias.trim());
      }
    }
    for (const [file, contents] of textCandidates) {
      if (file === 'package-lock.json' || file === 'public/fonts/OFL.txt') continue;
      const hasPrivateIdentifier = [...identifiers].some((identifier) => {
        const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'iu').test(contents);
      });
      if (hasPrivateIdentifier) failures.push(`private player identifier found in Git-visible file: ${file}`);
    }
  } catch (error) {
    failures.push(`could not audit Git-visible files against the private registry: ${error.message}`);
  }
}

for (const required of [
  '.gitignore',
  'AGENTS.md',
  'LICENSE',
  'PRIVATE_DATA.md',
  'README.md',
  'scripts/setup-private-data.cjs',
  'skills/generate-friday-lineups/SKILL.md',
]) {
  if (!fs.existsSync(path.join(root, required))) {
    failures.push(`required public file is missing: ${required}`);
  }
}

if (failures.length > 0) {
  console.error(`Public-release check failed:\n\n- ${failures.join('\n- ')}\n`);
  process.exit(1);
}

console.log(`Public-release check passed for ${candidates.length} Git-visible files.`);
console.log('Private files may remain locally because ignored paths are excluded.');
