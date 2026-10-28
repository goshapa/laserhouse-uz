/* Laser House — ИИ-администратор в Instagram Direct (Instagram API with Instagram Login).
   Вебхук: https://laserhouse.uz/api/ig  (поле подписки: messages)

   Переменные окружения:
     IG_ACCESS_TOKEN  — долгоживущий токен Instagram-аккаунта (Meta App → Instagram → API setup → Generate token)
     IG_APP_SECRET    — секрет приложения Instagram (им подписаны вебхуки)
     IG_VERIFY_TOKEN  — любая строка; та же вписывается в Meta при настройке вебхука
     IG_API_VERSION   — версия Graph API, по умолчанию v23.0 */
'use strict';

const crypto = require('crypto');
const store = require('./_store');
const { agent, notifyAdmins, esc } = require('./bot')._internal;

const api = (p) => `https://graph.instagram.com/${process.env.IG_API_VERSION || 'v23.0'}/${p}`;

async function ig(pathPart, body) {
  const res = await fetch(api(pathPart), {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${process.env.IG_ACCESS_TOKEN}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  if (json.error) console.error(`[ig] ${pathPart}: ${json.error.message}`);
  return json;
}

/* подпись считается по сырому телу, поэтому читаем поток, не трогая req.body (его геттер разбирает JSON) */
async function readRaw(req) {
  const raw = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
  if (raw) return raw;
  const b = req.body;
  return Buffer.isBuffer(b) ? b.toString('utf8') : typeof b === 'string' ? b : '';
}

function signatureOk(raw, header) {
  const secret = process.env.IG_APP_SECRET;
  if (!secret || !header) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(header));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function clientLabel(igsid) {
  const p = await ig(`${igsid}?fields=name,username`);
  const name = esc(p.name || 'Клиент');
  return p.username ? `${name} (<a href="https://instagram.com/${esc(p.username)}">@${esc(p.username)}</a>)` : name;
}

async function handleEvent(ev) {
  const m = ev.message;
  if (!m || m.is_deleted) return;
  if (!(await store.once(`ig:m:${m.mid}`, 24 * 3600).catch(() => true))) return; // повтор вебхука

  if (m.is_echo) {
    // наш собственный ответ — пропускаем; иначе это администратор ответил сам → ИИ молчит в этом чате
    if (await store.get(`ig:own:${m.mid}`)) return;
    return agent.pause('ig', ev.recipient.id);
  }

  const text = (m.text || '').trim();
  if (!text || !agent.enabled() || await agent.isPaused('ig', ev.sender.id)) return;

  const who = { channel: 'ig', chatId: ev.sender.id, label: await clientLabel(ev.sender.id) };
  const answer = await agent.reply(who, text);
  if (!answer) return;
  const sent = await ig('me/messages', { recipient: { id: ev.sender.id }, message: { text: answer.slice(0, 1000) } });
  if (sent.message_id) await store.set(`ig:own:${sent.message_id}`, 1, 24 * 3600);
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const q = req.query || {};
    if (q['hub.mode'] === 'subscribe' && process.env.IG_VERIFY_TOKEN && q['hub.verify_token'] === process.env.IG_VERIFY_TOKEN) {
      return res.status(200).send(q['hub.challenge']);
    }
    return res.status(200).send('Laser House Instagram webhook');
  }
  if (req.method !== 'POST') return res.status(405).end();

  const raw = await readRaw(req);
  if (!signatureOk(raw, req.headers['x-hub-signature-256'])) return res.status(401).end();

  let body = {};
  try { body = JSON.parse(raw); } catch (e) { return res.status(400).end(); }

  try {
    for (const entry of body.entry || []) {
      // форма события без текста переписки — видно в логах Vercel, что именно прислала Meta
      console.log('[ig] entry', JSON.stringify({
        object: body.object,
        keys: Object.keys(entry),
        changes: (entry.changes || []).map((c) => c.field),
        messaging: (entry.messaging || []).map((ev) => ({
          keys: Object.keys(ev),
          message: ev.message && { text: !!ev.message.text, echo: !!ev.message.is_echo, attachments: !!ev.message.attachments }
        }))
      }));
      for (const ev of entry.messaging || []) await handleEvent(ev);
    }
  } catch (e) {
    console.error('[ig] update failed', e);
    await notifyAdmins('⚠️ ИИ-администратор Instagram не смог ответить клиенту — проверьте Директ.').catch(() => {});
  }
  return res.status(200).json({ ok: true });
};

module.exports.config = { api: { bodyParser: false } };
