/* Laser House — API панели управления ИИ-администратором (страница /ai).
   Все действия — POST { action, ... }. Доступ только у админов из ADMIN_CHAT_ID: вход через /panel в боте (api/_session.js). */
'use strict';

const session = require('./_session');
const store = require('./_store');
const { agent, adminChats } = require('./bot')._internal;

/* подписан ли Instagram-аккаунт на сообщения: без подписки Meta ничего не присылает, какой бы ни был переключатель */
async function igSubscription() {
  if (!process.env.IG_ACCESS_TOKEN) return 'unknown';
  try {
    const res = await fetch(`https://graph.instagram.com/${process.env.IG_API_VERSION || 'v23.0'}/me/subscribed_apps`, {
      headers: { authorization: `Bearer ${process.env.IG_ACCESS_TOKEN}` },
      signal: AbortSignal.timeout(3000)
    });
    const json = await res.json();
    if (json.error || !Array.isArray(json.data)) return 'unknown';
    return json.data.some((a) => (a.subscribed_fields || []).includes('messages')) ? 'on' : 'off';
  } catch (e) {
    return 'unknown';
  }
}

async function state(me) {
  return {
    me,
    ...(await agent.panelState()),
    system: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      killSwitch: process.env.AI_ENABLED === '0',
      redis: store.persistent(),
      igSubscription: await igSubscription()
    }
  };
}

const channelOf = (v) => (v === 'ig' ? 'ig' : 'tg');
const badRule = () => Object.assign(new Error('Список правил изменился, например из бота. Обновите страницу.'), { status: 409 });

const ACTIONS = {
  state: (b, me) => state(me),

  async save(b, me) {
    await agent.savePrompts({ values: b.values, baseRev: b.baseRev, by: me.name, note: b.note });
    return state(me);
  },
  async restore(b, me) {
    await agent.restorePrompts({ rev: b.rev, baseRev: b.baseRev, by: me.name });
    return state(me);
  },
  settings: async (b) => ({ settings: await agent.setSettings(b.patch || {}) }),

  async 'paused.list'() {
    const { clientName } = require('./ig');
    const ids = (await agent.pausedIg()).slice(0, 50);
    return { chats: await Promise.all(ids.map(async (id) => ({ id, name: await clientName(id) }))) };
  },
  async 'paused.resume'(b) {
    await agent.resumeIg(String(b.id));
    return { ok: true };
  },

  async 'rule.add'(b, me) {
    const text = String(b.text || '').trim();
    if (!text) throw Object.assign(new Error('Напишите текст правила.'), { status: 400 });
    await agent.kbAdd(text, me.name, b.channel);
    return { rules: await agent.kbList() };
  },
  async 'rule.update'(b) {
    if (b.patch && b.patch.text !== undefined && !String(b.patch.text).trim()) throw Object.assign(new Error('Правило не может быть пустым.'), { status: 400 });
    if (!(await agent.kbUpdate(Number(b.n), b.expected, b.patch || {}))) throw badRule();
    return { rules: await agent.kbList() };
  },
  async 'rule.remove'(b) {
    if (!(await agent.kbRemove(Number(b.n), String(b.expected)))) throw badRule();
    return { rules: await agent.kbList() };
  },

  async test(b) {
    const text = String(b.text || '').trim().slice(0, 4000);
    if (!text) throw Object.assign(new Error('Напишите сообщение.'), { status: 400 });
    if (!process.env.ANTHROPIC_API_KEY) throw Object.assign(new Error('Не задан ключ Claude API.'), { status: 503 });
    const history = (Array.isArray(b.history) ? b.history : [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }))
      .slice(-agent.HISTORY_LIMIT);
    return agent.sandbox({ channel: channelOf(b.channel), history, text, draft: b.draft, priceAgoMin: b.priceAgoMin });
  },
  preview: async (b) => ({ text: await agent.preview({ channel: channelOf(b.channel), draft: b.draft }) })
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();

  // защита от подделки запросов: только со своего сайта (плюс SameSite=Strict у cookie)
  let sameOrigin = false;
  try { sameOrigin = new URL(req.headers.origin).host === req.headers.host; } catch (e) { /* нет или битый Origin */ }
  if (!sameOrigin) return res.status(403).json({ error: 'Запрос не с сайта панели.' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  try {
    if (body.action === 'login') {
      const r = await session.redeemLogin(body.token);
      if (!r || !adminChats().includes(r.admin.id)) return res.status(401).json({ error: 'Ссылка устарела или уже использована. Отправьте боту /panel ещё раз.' });
      res.setHeader('Set-Cookie', r.cookie);
      return res.status(200).json(await state(r.admin));
    }
    if (body.action === 'logout') {
      res.setHeader('Set-Cookie', await session.logout(req));
      return res.status(200).json({ ok: true });
    }

    const me = await session.current(req);
    // админа убрали из ADMIN_CHAT_ID — его сессия больше не действует
    if (!me || !adminChats().includes(me.id)) return res.status(401).json({ error: 'Нужно войти.' });

    if (!Object.prototype.hasOwnProperty.call(ACTIONS, body.action)) return res.status(400).json({ error: 'Неизвестное действие.' });
    return res.status(200).json(await ACTIONS[body.action](body, me));
  } catch (e) {
    if (!e.status) console.error('[panel]', body.action, e);
    return res.status(e.status || 500).json({ error: e.status ? e.message : 'Что-то пошло не так. Попробуйте ещё раз.' });
  }
};
