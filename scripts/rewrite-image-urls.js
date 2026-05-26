// Helper de migração: troca URLs do Unsplash em assets/js/script.js
// pelos caminhos locais WebP gerados por build-images.js.
// Idempotente: rodar duas vezes não muda nada.

const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '..', 'assets', 'js', 'script.js');
const CARDAPIO_DIR = path.resolve(__dirname, '..', 'assets', 'img', 'cardapio');

// IDs que NÃO existem mais no Unsplash (verificado via HTTP 404 ao baixar)
// + IDs cujo conteúdo visual é inadequado (céu estrelado em vez de comida)
const PLACEHOLDER_IDS = new Set([
  'photo-1527838832700-50592524df75', // 404 — Budweiser
  'photo-1548907040-4d42b52125e0',     // 404 — Bombom
  'photo-1601924582975-7e6ec6dc1b08',  // 404 — Bacon Especial / Sem bebida
  'photo-1608885898957-a599fb18ec3f',  // 404 — Água c/s gás
  'photo-1536746803623-cef87080bfc8',  // existe mas é céu estrelado (Suco Maracujá)
]);

const PLACEHOLDER = 'assets/img/cardapio/placeholder.webp';

// regex que captura URL completa do Unsplash + photo-id
const RE = /https:\/\/images\.unsplash\.com\/(photo-[a-f0-9-]+)\?[^'"\s]*/g;

let src = fs.readFileSync(FILE, 'utf8');
const before = (src.match(RE) || []).length;

let replaced = 0;
let toPlaceholder = 0;
src = src.replace(RE, (_match, photoId) => {
  replaced++;
  if (PLACEHOLDER_IDS.has(photoId)) {
    toPlaceholder++;
    return PLACEHOLDER;
  }
  const local = `assets/img/cardapio/${photoId}.webp`;
  // Sanity: arquivo precisa existir
  if (!fs.existsSync(path.join(CARDAPIO_DIR, `${photoId}.webp`))) {
    console.warn(`[warn] no local file for ${photoId} — falling back to placeholder`);
    toPlaceholder++;
    return PLACEHOLDER;
  }
  return local;
});

fs.writeFileSync(FILE, src, 'utf8');

const after = (src.match(RE) || []).length;
console.log(`[rewrite] before=${before} replaced=${replaced} (${toPlaceholder} to placeholder) remaining=${after}`);
