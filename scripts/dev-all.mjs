import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const processes = [
  spawn(npmCommand, ['run', 'dev'], { stdio: 'inherit', shell: process.platform === 'win32' }),
  spawn(npmCommand, ['run', 'server:dev'], { stdio: 'inherit', shell: process.platform === 'win32' }),
];

const stopAll = () => {
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
};

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) process.exitCode = code;
  });
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});
process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});
