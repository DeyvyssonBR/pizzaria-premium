/**
 * Carrega .env.local / .env na raiz do projeto (sem dependência dotenv).
 * Não sobrescreve variáveis já definidas no process.env (ex.: Vercel, sistema).
 */
'use strict';

const fs = require('fs');
const path = require('path');

let loaded = false;

function loadEnv(rootDir) {
  if (loaded) return;
  loaded = true;

  const root = rootDir || path.resolve(__dirname, '..');
  const candidates = ['.env.local', '.env'];

  for (const name of candidates) {
    const fp = path.join(root, name);
    if (!fs.existsSync(fp)) continue;
    try {
      const text = fs.readFileSync(fp, 'utf8');
      text.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eq = trimmed.indexOf('=');
        if (eq <= 0) return;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (key && process.env[key] === undefined) {
          process.env[key] = val;
        }
      });
      break;
    } catch (e) {
      console.warn('[loadEnv] falha ao ler', name, e.message);
    }
  }
}

module.exports = { loadEnv };
