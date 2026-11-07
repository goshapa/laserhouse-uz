/* Laser House — ИИ-администратор в Instagram Direct (Instagram API with Unified Login или with Instagram Login).
   Вебхук: https://laserhouse.uz/api/ig  (поле подписки: messages)

   Переменные окружения:
     IG_ACCOUNT_ID    — ID Instagram-аккаунта. Задан — работаем через Unified Login (graph.facebook.com),
                        не задан — через Instagram Login (graph.instagram.com)
     IG_ACCESS_TOKEN  — токен из Meta App → Instagram API → Generate token
     IG_APP_SECRET    — секрет, которым подписаны вебхуки: при Unified Login «Секрет приложения» из настроек,
                        при Instagram Login «Секрет приложения Instagram»
     IG_VERIFY_TOKEN  — любая строка; та же вписывается в Meta при настройке вебхука
     IG_API_VERSION   — версия Graph API, по умолчанию v26.0 при Unified Login и v23.0 при Instagram Login */
'use strict';

const crypto = require('crypto');
const store = require('./_store');
const { agent, notifyAdmins, esc } = require('./bot')._internal;

const unified = () => !!process.env.IG_ACCOUNT_ID;
const api = (p) => (unified()
  ? `https://graph.facebook.com/${process.env.IG_API_VERSION || 'v26.0'}/${p}`
  : `https://graph.instagram.com/${process.env.IG_API_VERSION || 'v23.0'}/${p}`);
// при Unified Login /me — это системный пользователь, а не аккаунт Instagram
const messagesPath = () => (unified() ? `${process.env.IG_ACCOUNT_ID}/messages` : 'me/messages');

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

const MERGE_WAIT_MS = 6000;

/* Клиент пришёл по рекламе: Instagram присылает её название. Мужская реклама — значит, пишет мужчина */
const MEN_AD = /мужчин|мужск|муж\b|бород|парн|erkak|soqol|\bmen\b|\bmale\b/i;
async function rememberAd(ev) {
  const ref = (ev.message && ev.message.referral) || ev.referral;
  if (!ref) return;
  const ctx = ref.ads_context_data || {};
  const title = String(ctx.ad_title || ref.ad_title || ref.ref || '');
  console.log('[ig] referral', JSON.stringify({ source: ref.source, type: ref.type, ad_id: ref.ad_id, title: title.slice(0, 80) }));
  if (MEN_AD.test(title)) await store.set(`ig:men:${ev.sender.id}`, 1, 30 * 24 * 3600);
}

async function handleEvent(ev) {
  if (!(ev.message && ev.message.is_echo)) await rememberAd(ev).catch((e) => console.error('[ig] referral', e));
  const m = ev.message;
  if (!m || m.is_deleted) return;
  if (!(await store.once(`ig:m:${m.mid}`, 24 * 3600).catch(() => true))) return; // повтор вебхука

  if (m.is_echo) {
    // наш собственный ответ — пропускаем; иначе это администратор ответил сам → ИИ молчит в этом чате.
    // Эхо нашего ответа может прийти раньше, чем мы запомнили его id, поэтому смотрим ещё и метку «отправляю»
    // и перепроверяем через пару секунд.
    const chat = ev.recipient.id;
    const own = async () => !!(await store.get(`ig:own:${m.mid}`)) || !!(await store.get(`ig:sending:${chat}`));
    if (await own()) return;
    await new Promise((r) => setTimeout(r, 2500));
    if (await own()) return;
    return agent.pause('ig', chat);
  }

  const incoming = (m.text || '').trim();
  if (!incoming || !(await agent.active('ig', ev.sender.id))) return;

  // ИИ оставлен для одного аккаунта: остальным не отвечаем совсем. Логин не узнали — тоже молчим
  const only = await agent.igOnly();
  if (only) {
    const p = await ig(`${ev.sender.id}?fields=username`);
    if (String(p.username || '').toLowerCase() !== only) return;
  }

  // клиенты часто пишут несколько сообщений подряд: ждём паузу и отвечаем один раз на всё сразу
  const bufKey = `ig:buf:${ev.sender.id}`;
  const lastKey = `ig:last:${ev.sender.id}`;
  await store.push(bufKey, incoming, 300);
  await store.set(lastKey, m.mid, 300);
  await new Promise((r) => setTimeout(r, MERGE_WAIT_MS));
  if ((await store.get(lastKey)) !== m.mid) return; // пришло ещё сообщение: ответит его обработчик
  const text = (await store.take(bufKey)).join('\n');
  if (!text) return;

  const who = { channel: 'ig', chatId: ev.sender.id, label: await clientLabel(ev.sender.id), menAd: !!(await store.get(`ig:men:${ev.sender.id}`)) };
  const parts = await agent.reply(who, text);
  if (parts == null) return;
  await store.set(`ig:sending:${ev.sender.id}`, 1, 60);
  // лимит Instagram — 1000 байт на сообщение, по-русски это около 500 букв
  const messages = parts.flatMap((p) => (p.photo
    ? [{ attachment: { type: 'image', payload: { url: p.photo } } }]
    : agent.splitText(p.text, 1000).map((t) => ({ text: t }))));
  for (const message of messages) {
    const sent = await ig(messagesPath(), { recipient: { id: ev.sender.id }, message });
    if (sent.message_id) await store.set(`ig:own:${sent.message_id}`, 1, 24 * 3600);
  }
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
          message: ev.message && { text: !!ev.message.text, echo: !!ev.message.is_echo, attachments: !!ev.message.attachments, referral: !!ev.message.referral }
        }))
      }));
      await Promise.all((entry.messaging || []).map(handleEvent)); // параллельно: иначе склейка сообщений из одного вебхука не сработает
    }
  } catch (e) {
    console.error('[ig] update failed', e);
    await notifyAdmins('⚠️ ИИ-администратор Instagram не смог ответить клиенту — проверьте Директ.').catch(() => {});
  }
  return res.status(200).json({ ok: true });
};

module.exports.clientName = async (igsid) => {
  const p = await ig(`${igsid}?fields=name,username`);
  return p.username ? '@' + p.username : p.name || 'Клиент';
};

module.exports.config = { api: { bodyParser: false } };
