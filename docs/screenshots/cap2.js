const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
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
      if (msg.id === id) { ws.off('message', onMsg); res(msg); }
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify(payload));
  });
}

async function main() {
  let tabs;
  for (let i=0;i<50;i++){ try{ tabs = await get('/json'); if(Array.isArray(tabs)) break;}catch(e){} await new Promise(r=>setTimeout(r,200)); }
  const WebSocket = require('ws');
  const tab = tabs.find(t=>t.type==='page') || tabs[0];
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r=>ws.on('open',r));
  let id=0;
  const send = (m,p)=>wsSend(ws,{id:++id,method:m,params:p||{}});

  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setUserAgentOverride',{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'});
  await send('Page.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:8765/index.html'});
  await new Promise(r=>setTimeout(r,3500));

  // Add a pizza by clicking first menu card and confirming the modal
  await send('Runtime.evaluate',{expression:`(()=>{const c=document.querySelector('.menu-card, .pizza-card, [data-pizza-card]'); if(c){c.click(); return 'clicked-card';} return 'no-card';})()`});
  await new Promise(r=>setTimeout(r,800));
  let s = await send('Page.captureScreenshot',{format:'png'});
  fs.writeFileSync(path.join(OUT,'mobile-pizza-modal.png'),Buffer.from(s.result.data,'base64'));

  // Try confirm
  await send('Runtime.evaluate',{expression:`(()=>{const m=document.getElementById('pizza-modal-confirm'); if(m){m.click(); return 'confirmed';} return 'no-confirm';})()`});
  await new Promise(r=>setTimeout(r,700));

  // Open cart drawer
  await send('Runtime.evaluate',{expression:`(()=>{const b=document.getElementById('appbar-cart-btn'); if(b){b.click(); return 'opened';} const f=document.getElementById('floating-cart-bar'); if(f){f.click(); return 'opened-floating';} return 'no-cart-btn';})()`});
  await new Promise(r=>setTimeout(r,800));
  s = await send('Page.captureScreenshot',{format:'png'});
  fs.writeFileSync(path.join(OUT,'mobile-cart-step1.png'),Buffer.from(s.result.data,'base64'));

  // Advance to step 2 (auth)
  await send('Runtime.evaluate',{expression:`(()=>{const b=document.getElementById('cart-next-btn-1'); if(b){b.click(); return 'advanced';} return 'no-next';})()`});
  await new Promise(r=>setTimeout(r,700));
  s = await send('Page.captureScreenshot',{format:'png'});
  fs.writeFileSync(path.join(OUT,'mobile-cart-step2-auth.png'),Buffer.from(s.result.data,'base64'));

  // Force advance to delivery step
  await send('Runtime.evaluate',{expression:`(()=>{
    document.querySelectorAll('.cart-step').forEach(el=>el.classList.remove('is-active'));
    const t = document.getElementById('cart-step-delivery'); if(t){t.classList.add('is-active');}
    return 'forced-delivery';
  })()`});
  await new Promise(r=>setTimeout(r,400));
  s = await send('Page.captureScreenshot',{format:'png'});
  fs.writeFileSync(path.join(OUT,'mobile-cart-step3-delivery.png'),Buffer.from(s.result.data,'base64'));

  try{ process.kill(-child.pid);}catch(e){}
  process.exit(0);
}
main().catch(e=>{console.error(e);process.exit(1);});
