const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const URL_BASE = 'http://127.0.0.1:8765/index.html';
const OUT = 'D:/PaperClip/audit-screenshots';

const userDataDir = require('os').tmpdir() + '/chrome-audit-' + Date.now();
const port = 9333;
const args = [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + userDataDir,
  'about:blank',
];
const child = spawn(CHROME, args, { stdio: 'ignore', detached: true });

function get(p) {
  return new Promise((res, rej) => {
    http.get('http://127.0.0.1:' + port + p, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch(e){ res(d); } });
    }).on('error', rej);
  });
}

function wsSend(ws, payload) {
  return new Promise((res) => {
    const id = payload.id;
    const onMsg = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === id) {
        ws.off('message', onMsg);
        res(msg);
      }
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify(payload));
  });
}

async function main() {
  let tabs = null;
  for (let i = 0; i < 50; i++) {
    try { tabs = await get('/json'); if (Array.isArray(tabs)) break; } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }
  if (!Array.isArray(tabs)) throw new Error('chrome did not come up');

  const WebSocket = require('ws');

  async function capture(label, url, w, h, mobile, scrollY) {
    const tabs2 = await get('/json');
    const tab = (Array.isArray(tabs2) ? tabs2 : []).find(t => t.type === 'page') || tabs2[0];
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));
    let id = 0;
    const send = (m,p) => wsSend(ws, { id: ++id, method: m, params: p || {} });

    await send('Emulation.setDeviceMetricsOverride', {
      width: w, height: h, deviceScaleFactor: 1, mobile: mobile,
    });
    if (mobile) {
      await send('Emulation.setUserAgentOverride', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      });
    }
    await send('Page.enable', {});
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 3000));

    if (scrollY) {
      await send('Runtime.evaluate', {
        expression: 'window.scrollTo(0,' + scrollY + '); 0',
      });
      await new Promise(r => setTimeout(r, 500));
    }

    const metrics = await send('Page.getLayoutMetrics', {});
    const cs = (metrics.result && (metrics.result.cssContentSize || metrics.result.contentSize)) || {width: w, height: h};

    let shot;
    if (label.endsWith('-full')) {
      const fullH = Math.min(Math.ceil(cs.height), 12000);
      await send('Emulation.setDeviceMetricsOverride', {
        width: w, height: fullH, deviceScaleFactor: 1, mobile: mobile,
      });
      await new Promise(r => setTimeout(r, 800));
      shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      console.log('wrote', label, 'full-h=', fullH);
    } else {
      shot = await send('Page.captureScreenshot', { format: 'png' });
      console.log('wrote', label);
    }

    fs.writeFileSync(path.join(OUT, label + '.png'), Buffer.from(shot.result.data, 'base64'));
    ws.close();
  }

  try {
    await capture('desktop-hero',     URL_BASE,                 1440, 900, false, 0);
    await capture('desktop-cardapio', URL_BASE + '#cardapio',   1440, 900, false, 0);
    await capture('desktop-full',     URL_BASE,                 1440, 900, false, 0);
    await capture('mobile-hero',      URL_BASE,                 390, 844, true, 0);
    await capture('mobile-cardapio',  URL_BASE + '#cardapio',   390, 844, true, 0);
    await capture('mobile-full',      URL_BASE,                 390, 844, true, 0);
    await capture('mobile-promobar',  URL_BASE,                 390, 844, true, 1100);
    await capture('admin-desktop',    'http://127.0.0.1:8765/admin.html', 1440, 900, false, 0);
  } finally {
    try { process.kill(-child.pid); } catch(e){}
  }
  process.exit(0);
}

main().catch(e => { console.error('ERR', e); process.exit(1); });
