const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const URL_BASE = 'http://127.0.0.1:8765/index.html';
const OUT = 'D:/PaperClip/audit-screenshots';

const userDataDir = require('os').tmpdir() + '/chrome-audit-' + Date.now();
const port = 9334;
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

  async function capture(label, url, w, h, mobile, opts) {
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
    await new Promise(r => setTimeout(r, 2500));

    // Clear localStorage so default menu loads
    await send('Runtime.evaluate', {
      expression: "try{localStorage.removeItem('premium_pizzaria_menu');}catch(e){}; location.reload(); 0",
    });
    await new Promise(r => setTimeout(r, 2500));

    if (opts && opts.clickCategory) {
      // For mobile, open dropdown first
      if (mobile) {
        await send('Runtime.evaluate', {
          expression: "var b=document.getElementById('category-dropdown-toggle'); if(b) b.click(); 0",
        });
        await new Promise(r => setTimeout(r, 400));
        await send('Runtime.evaluate', {
          expression: "var btns=document.querySelectorAll('.category-dropdown-option'); for (var i=0;i<btns.length;i++){ if (btns[i].dataset.category==='" + opts.clickCategory + "') { btns[i].click(); break; } } 0",
        });
      } else {
        await send('Runtime.evaluate', {
          expression: "var btns=document.querySelectorAll('.menu-tabs-desktop [data-category]'); for (var i=0;i<btns.length;i++){ if (btns[i].dataset.category==='" + opts.clickCategory + "') { btns[i].click(); break; } } 0",
        });
      }
      await new Promise(r => setTimeout(r, 800));

      // Scroll cardapio section into view
      await send('Runtime.evaluate', {
        expression: "var el=document.getElementById('menu-tabs'); if (el) el.scrollIntoView({block:'start'}); 0",
      });
      await new Promise(r => setTimeout(r, 600));
    }

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT, label + '.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('wrote', label);
    ws.close();
  }

  try {
    await capture('piauienses-desktop', URL_BASE, 1440, 900, false, { clickCategory: 'piauienses' });
    await capture('piauienses-mobile', URL_BASE, 390, 844, true, { clickCategory: 'piauienses' });
  } finally {
    try { process.kill(-child.pid); } catch(e){}
  }
  process.exit(0);
}

main().catch(e => { console.error('ERR', e); process.exit(1); });
