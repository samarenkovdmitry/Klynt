// Runs `next dev` with the Russian-market overrides from .env.ru
// layered on top of .env.local. Shell env beats .env files in Next.js.
const { config } = require('dotenv');
const { resolve } = require('path');
const { spawn } = require('child_process');

const { parsed: ru } = config({ path: resolve(process.cwd(), '.env.ru') });
if (!ru) {
  console.error('Missing .env.ru — see .env.example / scripts/dev-ru.js');
  process.exit(1);
}

const child = spawn('npx', ['next', 'dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, ...ru },
});
child.on('exit', (code) => process.exit(code ?? 0));
