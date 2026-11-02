import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;
const commands = [
  ['api', 'apps/api', 'node_modules/tsx/dist/cli.mjs', ['watch', 'src/server.ts']],
  ['web', 'apps/web', 'node_modules/next/dist/bin/next', ['dev', '-p', '3000']],
  ['admin', 'apps/admin', 'node_modules/vite/bin/vite.js', ['--host', '0.0.0.0', '--port', '5173']],
];
const children = new Map();
let stopping = false;

function stopAll(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  for (const child of children.values()) child.kill(signal);
}

for (const [name, workingDirectory, executable, args] of commands) {
  const child = spawn(node, [resolve(root, executable), ...args], { cwd: resolve(root, workingDirectory), env: process.env, stdio: 'inherit', shell: false });
  children.set(name, child);
  child.on('error', (error) => { console.error(`[${name}] ${error.message}`); stopAll(); process.exitCode = 1; });
  child.on('exit', (code) => {
    if (!stopping && code !== 0) { console.error(`[${name}] exited with code ${code}`); process.exitCode = code ?? 1; stopAll(); }
  });
}

process.on('SIGINT', () => stopAll('SIGINT'));
process.on('SIGTERM', () => stopAll('SIGTERM'));
