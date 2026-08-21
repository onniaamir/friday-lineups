const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const dateIndex = process.argv.indexOf('--date');
const date = dateIndex >= 0 ? process.argv[dateIndex + 1] : undefined;

if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  throw new Error('Usage: npm run render:weekly -- --date YYYY-MM-DD');
}

const run = (command, args) => {
  const result = spawnSync(command, args, {cwd: projectRoot, stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};

const master = path.join(projectRoot, 'out/sunday-lineups.mp4');
const whatsapp = path.join(projectRoot, `out/friday-lineups-${date}-whatsapp.mp4`);

run('npx', ['tsc', '--noEmit']);
run('npm', ['run', 'render']);
run('ffmpeg', [
  '-y', '-i', master,
  '-map', '0:v:0', '-map', '0:a:0', '-map_metadata', '-1',
  '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
  '-profile:v', 'high', '-level:v', '4.0', '-pix_fmt', 'yuv420p',
  '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000',
  whatsapp,
]);
run('ffmpeg', ['-v', 'error', '-i', whatsapp, '-f', 'null', '-']);

if (!fs.existsSync(whatsapp)) throw new Error(`Expected output was not created: ${whatsapp}`);
console.log(`WhatsApp video ready: ${whatsapp}`);
