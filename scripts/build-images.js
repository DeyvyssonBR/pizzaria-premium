// Build script: baixa fotos do Unsplash e gera versões WebP otimizadas localmente.
// Roda 1x. As 22 URLs são extraídas de assets/js/script.js (campo `image`).
//
// Uso:
//   npm install
//   node scripts/build-images.js
//
// Saída:
//   assets/img/cardapio/<photo-id>.webp        — 800x600 q75
//   assets/img/cardapio/<photo-id>@2x.webp     — 1200x900 q78
//   assets/img/cardapio/placeholder.webp        — fallback genérico
//   assets/img/hero-fachada-premium.webp        — hero comprimido

const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT_CARDAPIO = path.join(ROOT, 'assets', 'img', 'cardapio');
const OUT_IMG = path.join(ROOT, 'assets', 'img');
const CACHE = path.join(__dirname, '.cache');

fs.mkdirSync(OUT_CARDAPIO, { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });

const PHOTO_IDS = [
  'photo-1513104890138-7c749659a591',
  'photo-1527838832700-50592524df75',
  'photo-1536746803623-cef87080bfc8',
  'photo-1541745537411-b8046dc6d66c',
  'photo-1544025162-d76694265947',
  'photo-1546069901-ba9599a7e63c',
  'photo-1548907040-4d42b52125e0',
  'photo-1562967914-608f82629710',
  'photo-1565299624946-b28f40a0ae38',
  'photo-1566633806327-68e152aaf26d',
  'photo-1573080496219-bb080dd4f877',
  'photo-1574071318508-1cdbab80d002',
  'photo-1576107232684-1279f390859f',
  'photo-1589301760014-d929f3979dbc',
  'photo-1590947132387-155cc02f3212',
  'photo-1594007654729-407eedc4be65',
  'photo-1601924582975-7e6ec6dc1b08',
  'photo-1608039829572-78524f79c4c7',
  'photo-1608270586620-248524c67de9',
  'photo-1608885898957-a599fb18ec3f',
  'photo-1622483767028-3f66f32aef97',
  'photo-1624552184280-9e9631bbeee9',
  'photo-1579751626657-72bc17010498', // CSS bg — section dark
  'photo-1628840042765-356cda07504e', // CSS bg — panel light
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) return resolve(dest);
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 pizz-build/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function processOne(photoId) {
  const url = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1600&q=85`;
  const raw = path.join(CACHE, `${photoId}.jpg`);
  await download(url, raw);

  const out1x = path.join(OUT_CARDAPIO, `${photoId}.webp`);
  const out2x = path.join(OUT_CARDAPIO, `${photoId}@2x.webp`);

  await sharp(raw)
    .resize(800, 600, { fit: 'cover', position: 'center' })
    .webp({ quality: 75, effort: 5 })
    .toFile(out1x);

  await sharp(raw)
    .resize(1200, 900, { fit: 'cover', position: 'center' })
    .webp({ quality: 78, effort: 5 })
    .toFile(out2x);

  const s1 = fs.statSync(out1x).size;
  const s2 = fs.statSync(out2x).size;
  return { photoId, kb1x: Math.round(s1 / 1024), kb2x: Math.round(s2 / 1024) };
}

async function makePlaceholder() {
  const out = path.join(OUT_CARDAPIO, 'placeholder.webp');
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3a1010"/>
          <stop offset="100%" stop-color="#1a0606"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <text x="400" y="290" font-family="Inter, sans-serif" font-size="56" font-weight="800"
            fill="#ffd700" text-anchor="middle">PIZZARIA</text>
      <text x="400" y="360" font-family="Inter, sans-serif" font-size="56" font-weight="800"
            fill="#fff" text-anchor="middle">PREMIUM</text>
      <text x="400" y="420" font-family="Inter, sans-serif" font-size="22" font-weight="500"
            fill="#cfa970" text-anchor="middle" opacity="0.85">Teresina - PI</text>
    </svg>
  `);
  await sharp(svg).webp({ quality: 80 }).toFile(out);
  return { kb: Math.round(fs.statSync(out).size / 1024) };
}

async function makeHero() {
  const inputPng = path.join(OUT_IMG, 'hero-fachada-premium.png');
  const inputJpg = path.join(OUT_IMG, 'hero-fachada-premium.jpg');
  const input = fs.existsSync(inputPng) ? inputPng : (fs.existsSync(inputJpg) ? inputJpg : null);
  if (!input) {
    console.log('[hero] no source file — skipping');
    return null;
  }
  const out = path.join(OUT_IMG, 'hero-fachada-premium.webp');
  await sharp(input)
    .resize(1600, null, { withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(out);
  return { kb: Math.round(fs.statSync(out).size / 1024) };
}

(async () => {
  console.log(`[build] ${PHOTO_IDS.length} photos -> ${OUT_CARDAPIO}`);
  const results = [];
  for (const id of PHOTO_IDS) {
    process.stdout.write(`[build] ${id} ... `);
    try {
      const r = await processOne(id);
      results.push(r);
      console.log(`ok (1x=${r.kb1x}KB 2x=${r.kb2x}KB)`);
    } catch (e) {
      console.log(`FAIL ${e.message}`);
    }
  }
  console.log('[build] placeholder...');
  const p = await makePlaceholder();
  console.log(`[build]   placeholder.webp ${p.kb}KB`);

  console.log('[build] hero...');
  const h = await makeHero();
  if (h) console.log(`[build]   hero-fachada-premium.webp ${h.kb}KB`);

  const totalKB = results.reduce((s, r) => s + r.kb1x, 0);
  console.log(`[build] done. ${results.length}/${PHOTO_IDS.length} ok. Sum 1x: ${totalKB}KB.`);

  console.log('\n[build] URL map (Unsplash -> local):');
  for (const r of results) {
    console.log(`  https://images.unsplash.com/${r.photoId}...  ->  assets/img/cardapio/${r.photoId}.webp`);
  }
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
