// tests/admin-self-service.mjs
//
// Pure logic extracted (parity) from D:/PaperClip/assets/js/admin.js so it
// can be exercised under Vitest in a Node environment. If these tests fail
// after a change to admin.js, the parity file needs to be re-synced.
//
// The function bodies are 1:1 with the production code (same control flow,
// same constants, same edge cases). The browser-only dependency (localStorage)
// is replaced by an injected storage adapter.

// ---------- Constants (parity with admin.js) ----------
export const STORAGE_PREFIX = 'premium_pizzaria_';
export const STORAGE_KEYS = [
  'whatsapp', 'pix_key', 'pix_name', 'pix_city', 'mp_link', 'mp_integration_type',
  'delivery_fee', 'estimated_time',
  'menu', 'orders', 'saved_orders', 'auto_print',
  'promos', 'prizes', 'zones', 'loyalty_cfg',
  'store_cfg', 'delivery_cfg', 'geo_cache',
  'coupons', 'notificacoes', 'accounts',
  'customer', 'session'
];
export const HOURS_KEY = STORAGE_PREFIX + 'store_hours';
export const MESSAGES_KEY = STORAGE_PREFIX + 'auto_messages';
export const ONBOARDING_KEY = STORAGE_PREFIX + 'onboarding_done_v1';
export const AUDIT_LOG_KEY = STORAGE_PREFIX + 'audit_log';
export const AUDIT_LOG_MAX = 200;

export const DEFAULT_HOURS = {
  0: { open: '18:00', close: '23:30', closed: false },
  1: { open: '18:00', close: '22:00', closed: false },
  2: { open: '18:00', close: '23:30', closed: false },
  3: { open: '18:00', close: '23:30', closed: false },
  4: { open: '18:00', close: '23:30', closed: false },
  5: { open: '18:00', close: '23:30', closed: false },
  6: { open: '18:00', close: '23:30', closed: false }
};

export const DEFAULT_MESSAGES = [
  {
    id: 'msg-boas-vindas',
    title: 'Boas-vindas',
    channel: 'whatsapp',
    body: 'Olá {{nome}}, aqui é da Pizzaria Premium! 👋 Recebemos seu pedido #{{pedido}} e já estamos preparando. Qualquer dúvida é só chamar por aqui. 🍕',
    active: true
  },
  {
    id: 'msg-saiu',
    title: 'Pedido saiu para entrega',
    channel: 'whatsapp',
    body: '{{nome}}, seu pedido #{{pedido}} acabou de sair para entrega! 🛵 Previsão de chegada: {{eta}}.',
    active: true
  },
  {
    id: 'msg-pronto-retirada',
    title: 'Pedido pronto para retirada',
    channel: 'whatsapp',
    body: '{{nome}}, seu pedido #{{pedido}} está pronto para retirada no balcão! 🛍️ Pode vir buscar.',
    active: true
  },
  {
    id: 'msg-fora-horario',
    title: 'Fora do horário',
    channel: 'whatsapp',
    body: 'Oi! No momento estamos fora do horário de atendimento. 🕐 Atendemos de {{horario}}. Assim que abrir respondemos por aqui. 🍕',
    active: true
  }
];

export const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// ---------- Util ----------
function readJSON(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function writeJSON(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

function readStr(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw == null ? fallback : raw;
  } catch (e) {
    return fallback;
  }
}

function escapeText(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// ---------- 1. Backup / Restore ----------
export function collectAllStorage(storage) {
  const data = {};
  data.__meta = { exportedAt: new Date().toISOString(), prefix: STORAGE_PREFIX, version: 1 };
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (!k) continue;
    if (k.indexOf(STORAGE_PREFIX) !== 0) continue;
    const raw = storage.getItem(k);
    try {
      data[k] = JSON.parse(raw);
    } catch (e) {
      data[k] = raw;
    }
  }
  return data;
}

// ---------- 2. Store Hours ----------
export function getHours(storage) {
  const stored = readJSON(storage, HOURS_KEY, null);
  if (stored && typeof stored === 'object') {
    const out = {};
    for (let d = 0; d < 7; d++) {
      const h = stored[d] || DEFAULT_HOURS[d];
      const closed = h.closed === true;
      out[d] = {
        open: closed ? '00:00' : (h.open || DEFAULT_HOURS[d].open),
        close: closed ? '00:00' : (h.close || DEFAULT_HOURS[d].close),
        closed
      };
    }
    return out;
  }
  return JSON.parse(JSON.stringify(DEFAULT_HOURS));
}

export function saveHours(hours, storage) {
  writeJSON(storage, HOURS_KEY, hours);
}

// ---------- 3. Auto Messages ----------
export function getMessages(storage) {
  const stored = readJSON(storage, MESSAGES_KEY, null);
  if (Array.isArray(stored) && stored.length) return stored;
  return JSON.parse(JSON.stringify(DEFAULT_MESSAGES));
}

export function saveMessages(list, storage) {
  writeJSON(storage, MESSAGES_KEY, list);
}

export function renderPreview(body) {
  if (!body) return '<em style="color:#888;">(vazio)</em>';
  const sample = body
    .replace(/\{\{nome\}\}/g, 'João')
    .replace(/\{\{pedido\}\}/g, 'PRE-1234')
    .replace(/\{\{eta\}\}/g, '40-60 min')
    .replace(/\{\{horario\}\}/g, '18:00 às 23:30');
  return escapeText(sample);
}

// ---------- 4. Onboarding ----------
export function buildOnboardingSteps() {
  return [
    {
      id: 'horario',
      title: '1. Horário de funcionamento',
      body: 'Defina os dias e horários que sua pizzaria abre. Esse status aparece no site para o cliente ver se está aberto.',
      targetTab: 'tab-horarios',
      doneCheck: (storage) => !!storage.getItem(HOURS_KEY)
    },
    {
      id: 'whatsapp',
      title: '2. WhatsApp de atendimento',
      body: 'Confirme o número (com 55 + DDD + número) que recebe os pedidos. Sem o DDD 86, o cliente não consegue abrir conversa.',
      targetTab: 'tab-config',
      doneCheck: (storage) => {
        const v = readStr(storage, STORAGE_PREFIX + 'whatsapp', '');
        return !!v.match(/^55\d{10,11}$/);
      }
    },
    {
      id: 'pix',
      title: '3. Pix para receber pedidos',
      body: 'Cadastre sua chave Pix, nome do beneficiário (até 25 letras) e cidade (até 15 letras). Gere um QR de teste para confirmar.',
      targetTab: 'tab-config',
      doneCheck: (storage) => !!readStr(storage, STORAGE_PREFIX + 'pix_key', '') && !!readStr(storage, STORAGE_PREFIX + 'pix_name', '')
    },
    {
      id: 'cardapio',
      title: '4. Cardápio',
      body: 'Revise as pizzas, bebidas e combos. Edite preços, fotos e disponibilidade direto pelo painel — não precisa mexer em código.',
      targetTab: 'tab-pizzas',
      doneCheck: (storage) => {
        const menu = readJSON(storage, STORAGE_PREFIX + 'menu', []);
        return Array.isArray(menu) && menu.length >= 5;
      }
    },
    {
      id: 'entrega',
      title: '5. Zonas e taxa de entrega',
      body: 'Configure o CEP da pizzaria, raio máximo e regras de frete. A calculadora do site passa a usar essas regras.',
      targetTab: 'tab-zones',
      doneCheck: (storage) => {
        const cfg = readJSON(storage, STORAGE_PREFIX + 'store_cfg', null);
        return cfg && !!cfg.cep;
      }
    },
    {
      id: 'backup',
      title: '6. Backup do seu trabalho',
      body: 'Exporte um JSON com TODAS as configurações. Se trocar de celular ou limpar o navegador, é só importar de volta.',
      targetTab: 'tab-backup',
      doneCheck: () => false
    }
  ];
}

export function isOnboardingDone(storage) {
  return storage.getItem(ONBOARDING_KEY) === 'true';
}

export function markOnboardingDone(storage) {
  storage.setItem(ONBOARDING_KEY, 'true');
}

export function resetOnboarding(storage) {
  storage.removeItem(ONBOARDING_KEY);
}

// ---------- 5. Audit Log ----------
export function getAuditLog(storage) {
  const stored = readJSON(storage, AUDIT_LOG_KEY, null);
  return Array.isArray(stored) ? stored : [];
}

export function saveAuditLog(storage, list) {
  writeJSON(storage, AUDIT_LOG_KEY, list);
}

export function clearAuditLog(storage) {
  try {
    storage.removeItem(AUDIT_LOG_KEY);
  } catch (e) { /* noop */ }
}

export function logEvent(storage, action, detail, opts) {
  opts = opts || {};
  const entry = {
    ts: typeof opts.now === 'number' ? opts.now : Date.now(),
    actor: opts.actor || 'admin',
    action: String(action || '').slice(0, 80),
    detail: detail == null ? '' : String(detail).slice(0, 240)
  };
  const list = getAuditLog(storage);
  list.push(entry);
  const trimmed = list.length > AUDIT_LOG_MAX ? list.slice(list.length - AUDIT_LOG_MAX) : list;
  try {
    saveAuditLog(storage, trimmed);
  } catch (e) { /* localStorage may throw in some sandboxes */ }
  return entry;
}
