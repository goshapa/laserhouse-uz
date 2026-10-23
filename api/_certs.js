/* Laser House — подарочные сертификаты: выдача, проверка и погашение.
   Хранилище — Upstash Redis по REST (подключается в Vercel → Storage → Upstash for Redis;
   переменные KV_REST_API_URL / KV_REST_API_TOKEN или UPSTASH_REDIS_REST_URL / _TOKEN).
   Файл с «_» в начале Vercel не превращает в отдельную функцию — это модуль для api/bot.js.

   Ключи:
     lh:cert:<CODE>          JSON сертификата
     lh:certs                zset кодов по времени выдачи
     lh:user:<tgId>:certs    set кодов, купленных клиентом
     lh:order:<id>           JSON заказа + id сообщений админам (живёт 60 дней)
     lh:order:<id>:done      код выданного сертификата или REJECTED — защита от двойной выдачи
     lh:pending:<adminId>    ожидание ввода от админа (номинал или сумма списания), 15 минут */
'use strict';

const crypto = require('crypto');

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // без 0/O/1/I, чтобы код не путали на слух
const CODE_RE = /\bLH[\s-]?([2-9A-HJ-NP-Z]{4})[\s-]?([2-9A-HJ-NP-Z]{4})\b/i;
const AMOUNTS = { 1: 500000, 2: 1000000, 3: 2000000, 4: 3000000 };
const ORDER_TTL = 60 * 24 * 3600;
const PENDING_TTL = 15 * 60;
const validMonths = () => Number(process.env.CERT_VALID_MONTHS || 12);

const TXT = {
  ru: {
    card_title: '🎁 <b>Подарочный сертификат Laser House</b>',
    code: 'Код', nominal: 'Номинал', service: 'Процедура', balance: 'Остаток', until: 'Действует до',
    how_e: 'Чтобы воспользоваться сертификатом, назовите или покажите этот код администратору при записи или в студии. Сертификат можно подарить — просто перешлите это сообщение.',
    how_p: 'Печатный сертификат с этим кодом ждёт вас в студии {branch}. Код можно назвать администратору и при записи.',
    mine_title: '🎁 <b>Мои сертификаты</b>', mine_empty: 'У вас пока нет сертификатов.',
    b_order: '🎁 Заказать сертификат',
    st_active: 'активен', st_used: 'использован', st_void: 'аннулирован', st_expired: 'срок истёк',
    n_part: 'Сертификат <code>{code}</code>: списано <b>{amount}</b>. Остаток: <b>{balance}</b>.',
    n_used: 'Сертификат <code>{code}</code> использован. Спасибо, что выбрали Laser House! 🤍',
    n_void: 'Сертификат <code>{code}</code> аннулирован. Если это ошибка — напишите администратору.',
    sum: 'сум'
  },
  uz: {
    card_title: '🎁 <b>Laser House sovg‘a sertifikati</b>',
    code: 'Kod', nominal: 'Nominal', service: 'Muolaja', balance: 'Qoldiq', until: 'Amal qilish muddati',
    how_e: 'Sertifikatdan foydalanish uchun yozilishda yoki studiyada ushbu kodni administratorga ayting yoki ko‘rsating. Sertifikatni sovg‘a qilish mumkin — shunchaki ushbu xabarni yuboring.',
    how_p: 'Ushbu kodli bosma sertifikat sizni {branch} studiyasida kutmoqda. Kodni yozilishda administratorga ham aytishingiz mumkin.',
    mine_title: '🎁 <b>Mening sertifikatlarim</b>', mine_empty: 'Sizda hozircha sertifikat yo‘q.',
    b_order: '🎁 Sertifikat buyurtma qilish',
    st_active: 'faol', st_used: 'ishlatilgan', st_void: 'bekor qilingan', st_expired: 'muddati tugagan',
    n_part: '<code>{code}</code> sertifikati: <b>{amount}</b> yechildi. Qoldiq: <b>{balance}</b>.',
    n_used: '<code>{code}</code> sertifikati ishlatildi. Laser House’ni tanlaganingiz uchun rahmat! 🤍',
    n_void: '<code>{code}</code> sertifikati bekor qilindi. Agar bu xato bo‘lsa — administratorga yozing.',
    sum: 'so‘m'
  }
};

module.exports = function createCerts(d) {
  // d: { tg, esc, money, btn, adminChats, userLink, branchName, homeRow }
  const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k]);
  const isAdmin = (id) => d.adminChats().includes(String(id));
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('ru-RU', { timeZone: 'Asia/Tashkent' });
  const sumText = (n, lang = 'ru') => `${d.money(n)} ${TXT[lang].sum}`;

  /* ---------- Redis ---------- */
  function dbConf() {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    return url && token ? { url, token } : null;
  }
  const dbReady = () => Boolean(dbConf());

  async function redis(...cmd) {
    const c = dbConf();
    if (!c) throw new Error('certificate database is not connected');
    const res = await fetch(c.url, {
      method: 'POST',
      headers: { authorization: `Bearer ${c.token}`, 'content-type': 'application/json' },
      body: JSON.stringify(cmd.map(String))
    });
    const json = await res.json();
    if (json.error) throw new Error('redis: ' + json.error);
    return json.result;
  }
  const getJSON = async (key) => { const v = await redis('GET', key); return v ? JSON.parse(v) : null; };
  const setJSON = (key, val, ...opts) => redis('SET', key, JSON.stringify(val), ...opts);

  /* ---------- коды и записи ---------- */
  function genCode() {
    const b = crypto.randomBytes(8);
    const c = Array.from(b, (x) => ALPHABET[x % ALPHABET.length]).join('');
    return `LH-${c.slice(0, 4)}-${c.slice(4)}`;
  }
  function parseCode(text) {
    const m = (text || '').toUpperCase().match(CODE_RE);
    return m ? `LH-${m[1]}-${m[2]}` : null;
  }

  function statusOf(c) {
    if (c.status === 'void') return 'void';
    if (c.status === 'used') return 'used';
    if (new Date(c.expires) < new Date()) return 'expired';
    return 'active';
  }
  const STATUS_ICON = { active: '🟢', used: '⚪', void: '⛔', expired: '⌛' };

  function nominalLine(c, lang) {
    const t = TXT[lang];
    return c.kind === 'service' ? `${t.service}: <b>${d.esc(c.service)}</b>` : `${t.nominal}: <b>${sumText(c.amount, lang)}</b>`;
  }

  /* ---------- заказ: уведомление админам с кнопками ---------- */
  async function notifyOrder(from, order, text) {
    const chats = d.adminChats();
    if (!chats.length) { console.warn('[certs] ADMIN_CHAT_ID is not set, order:\n' + text); return; }
    if (!dbReady()) {
      await Promise.all(chats.map((chat_id) => d.tg('sendMessage', {
        chat_id, parse_mode: 'HTML', disable_web_page_preview: true,
        text: text + '\n\n<i>База сертификатов не подключена — выдайте сертификат вручную.</i>'
      })));
      return;
    }
    const id = crypto.randomBytes(4).toString('hex');
    const record = {
      id, n: order.n, f: order.f, b: order.b, lang: order.lang,
      client: { id: from.id, first_name: from.first_name || '', last_name: from.last_name || '', username: from.username || '' },
      created: new Date().toISOString(), msgs: []
    };
    const keyboard = { inline_keyboard: [[d.btn('✅ Оплачено — выдать сертификат', `I:${id}`)], [d.btn('✖ Отклонить', `X:${id}`)]] };
    const sent = await Promise.all(chats.map((chat_id) => d.tg('sendMessage', {
      chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: keyboard
    })));
    record.msgs = sent.filter((r) => r && r.ok).map((r) => [r.result.chat.id, r.result.message_id]);
    record.text = text;
    await setJSON(`lh:order:${id}`, record, 'EX', ORDER_TTL);
  }

  async function closeOrderMessages(order, note) {
    await Promise.all((order.msgs || []).map(([chat_id, message_id]) => d.tg('editMessageText', {
      chat_id, message_id, text: `${order.text}\n\n${note}`, parse_mode: 'HTML', disable_web_page_preview: true
    })));
  }

  /* ---------- выдача ---------- */
  async function issue(orderId, admin, nominal) {
    const order = await getJSON(`lh:order:${orderId}`);
    if (!order) return { alert: 'Заказ не найден — возможно, ему больше 60 дней.' };
    const done = await redis('GET', `lh:order:${orderId}:done`);
    if (done) return { alert: done === 'REJECTED' ? 'Заказ уже отклонён.' : `Уже выдан: ${done}` };

    if (!nominal) {
      if (AMOUNTS[order.n]) nominal = { kind: 'amount', amount: AMOUNTS[order.n] };
      else {
        // «на зону» или «другая сумма» — номинал вводит админ
        await setJSON(`lh:pending:${admin.id}`, { action: 'issue', orderId }, 'EX', PENDING_TTL);
        await d.tg('sendMessage', {
          chat_id: admin.id, parse_mode: 'HTML',
          text: `🎁 Укажите номинал для заказа клиента ${d.userLink(order.client)}:\n\n• сумму цифрами, например <code>1500000</code>\n• или процедуру текстом, например <code>Бикини глубокое, 1 процедура</code>\n\nОтмена — /cancel`,
          reply_markup: { force_reply: true, input_field_placeholder: '1500000 или название процедуры' }
        });
        return { alert: 'Укажите номинал в ответном сообщении' };
      }
    }

    // захватываем заказ атомарно: второй админ получит «уже выдан»
    const claimed = await redis('SET', `lh:order:${orderId}:done`, 'ISSUING', 'NX', 'EX', ORDER_TTL);
    if (!claimed) return { alert: 'Заказ уже обрабатывается другим администратором.' };

    let code = null;
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + validMonths());
    const cert = {
      code: '', kind: nominal.kind,
      amount: nominal.kind === 'amount' ? nominal.amount : null,
      balance: nominal.kind === 'amount' ? nominal.amount : null,
      service: nominal.kind === 'service' ? nominal.service : null,
      status: 'active', format: order.f, branch: order.b, lang: order.lang,
      buyer: order.client, order: orderId,
      created: now.toISOString(), expires: expires.toISOString(),
      issuedBy: { id: admin.id, name: admin.first_name || '' },
      history: [{ at: now.toISOString(), action: 'issue', by: admin.first_name || String(admin.id) }]
    };
    for (let i = 0; i < 6 && !code; i++) {
      const c = genCode();
      cert.code = c;
      if (await setJSON(`lh:cert:${c}`, cert, 'NX')) code = c;
    }
    if (!code) { await redis('DEL', `lh:order:${orderId}:done`); return { alert: 'Не удалось создать код, попробуйте ещё раз.' }; }

    await redis('SET', `lh:order:${orderId}:done`, code, 'EX', ORDER_TTL);
    await redis('ZADD', 'lh:certs', now.getTime(), code);
    await redis('SADD', `lh:user:${order.client.id}:certs`, code);

    await sendClientCard(cert);
    await closeOrderMessages(order, `✅ <b>Выдан сертификат</b> <code>${code}</code> · ${d.esc(admin.first_name || '')}`);
    return { alert: `Выдан ${code}`, code };
  }

  function clientCardText(cert) {
    const lang = cert.lang === 'uz' ? 'uz' : 'ru';
    const t = TXT[lang];
    const how = cert.format === 'p' ? fill(t.how_p, { branch: d.esc(d.branchName(cert.branch, lang)) }) : t.how_e;
    return `${t.card_title}\n\n${t.code}: <code>${cert.code}</code>\n${nominalLine(cert, lang)}\n${t.until}: <b>${fmtDate(cert.expires)}</b>\n\n${how}`;
  }

  async function sendClientCard(cert) {
    await d.tg('sendMessage', { chat_id: cert.buyer.id, text: clientCardText(cert), parse_mode: 'HTML' });
  }

  async function reject(orderId, admin) {
    const order = await getJSON(`lh:order:${orderId}`);
    if (!order) return { alert: 'Заказ не найден.' };
    const ok = await redis('SET', `lh:order:${orderId}:done`, 'REJECTED', 'NX', 'EX', ORDER_TTL);
    if (!ok) return { alert: 'Заказ уже обработан.' };
    await closeOrderMessages(order, `✖ <b>Отклонён</b> · ${d.esc(admin.first_name || '')}`);
    return { alert: 'Заказ отклонён' };
  }

  /* ---------- карточка для админа и погашение ---------- */
  function adminCard(c) {
    const st = statusOf(c);
    const lines = [
      `🎁 <b>Сертификат</b> <code>${c.code}</code>`,
      `Статус: ${STATUS_ICON[st]} <b>${TXT.ru['st_' + st]}</b>`,
      nominalLine(c, 'ru')
    ];
    if (c.kind === 'amount') lines.push(`Остаток: <b>${sumText(c.balance)}</b>`);
    lines.push(`Действует до: <b>${fmtDate(c.expires)}</b>`);
    lines.push(`Покупатель: ${d.userLink(c.buyer)}`);
    lines.push(`Формат: ${c.format === 'p' ? 'печатный, ' + d.esc(d.branchName(c.branch, 'ru')) : 'электронный'}`);
    lines.push('', '<b>История</b>');
    c.history.slice(-8).forEach((h) => {
      const what = { issue: 'выдан', part: `списано ${sumText(h.amount || 0)}`, used: 'погашен', void: 'аннулирован' }[h.action];
      lines.push(`• ${fmtDate(h.at)} — ${what} (${d.esc(h.by)})`);
    });
    return lines.join('\n');
  }

  function adminCardKeyboard(c) {
    const rows = [];
    if (statusOf(c) === 'active') {
      rows.push(c.kind === 'amount'
        ? [d.btn('✅ Погасить полностью', `R:${c.code}:all`), d.btn('➖ Списать часть', `R:${c.code}:part`)]
        : [d.btn('✅ Погасить', `R:${c.code}:all`)]);
      rows.push([d.btn('⛔ Аннулировать', `R:${c.code}:void`)]);
    }
    rows.push([d.btn('🔄 Обновить', `R:${c.code}:view`), d.btn('📋 Последние', 'A:list')]);
    return { inline_keyboard: rows };
  }

  async function showAdminCard(ctx, code, edit) {
    const c = await getJSON(`lh:cert:${code}`);
    if (!c) {
      return d.tg('sendMessage', { chat_id: ctx.chatId, parse_mode: 'HTML', text: `❌ Сертификат <code>${d.esc(code)}</code> не найден. Проверьте код — без записи в базе он недействителен.` });
    }
    const payload = { chat_id: ctx.chatId, text: adminCard(c), parse_mode: 'HTML', reply_markup: adminCardKeyboard(c) };
    if (edit && ctx.messageId) {
      const r = await d.tg('editMessageText', { ...payload, message_id: ctx.messageId });
      if (r.ok || /not modified/.test(r.description || '')) return null;
    }
    return d.tg('sendMessage', payload);
  }

  async function applyRedeem(code, admin, action, amount) {
    const c = await getJSON(`lh:cert:${code}`);
    if (!c) return { error: 'Сертификат не найден.' };
    if (statusOf(c) !== 'active') return { error: `Сертификат ${TXT.ru['st_' + statusOf(c)]}, операция невозможна.` };
    const at = new Date().toISOString();
    const by = admin.first_name || String(admin.id);
    const lang = c.lang === 'uz' ? 'uz' : 'ru';
    let note;

    if (action === 'part') {
      if (!(amount > 0)) return { error: 'Укажите сумму больше нуля.' };
      if (amount > c.balance) return { error: `Сумма больше остатка (${sumText(c.balance)}).` };
      c.balance -= amount;
      c.history.push({ at, action: 'part', amount, by });
      if (c.balance === 0) { c.status = 'used'; c.history.push({ at, action: 'used', by }); }
      note = c.balance === 0 ? fill(TXT[lang].n_used, { code }) : fill(TXT[lang].n_part, { code, amount: sumText(amount, lang), balance: sumText(c.balance, lang) });
    } else if (action === 'all') {
      if (c.kind === 'amount' && c.balance > 0) c.history.push({ at, action: 'part', amount: c.balance, by });
      if (c.kind === 'amount') c.balance = 0;
      c.status = 'used';
      c.history.push({ at, action: 'used', by });
      note = fill(TXT[lang].n_used, { code });
    } else if (action === 'void') {
      c.status = 'void';
      c.history.push({ at, action: 'void', by });
      note = fill(TXT[lang].n_void, { code });
    }
    await setJSON(`lh:cert:${code}`, c);
    await d.tg('sendMessage', { chat_id: c.buyer.id, text: note, parse_mode: 'HTML' });
    return { cert: c };
  }

  async function listRecent(ctx) {
    const codes = await redis('ZREVRANGE', 'lh:certs', 0, 14);
    if (!codes || !codes.length) return d.tg('sendMessage', { chat_id: ctx.chatId, text: 'Сертификатов пока нет.' });
    const certs = await Promise.all(codes.map((code) => getJSON(`lh:cert:${code}`)));
    const lines = ['📋 <b>Последние сертификаты</b>', ''];
    const rows = [];
    certs.filter(Boolean).forEach((c) => {
      const st = statusOf(c);
      const val = c.kind === 'amount' ? `${sumText(c.balance)} из ${sumText(c.amount)}` : d.esc(c.service);
      lines.push(`${STATUS_ICON[st]} <code>${c.code}</code> — ${val} · до ${fmtDate(c.expires)}`);
      rows.push([d.btn(`${STATUS_ICON[st]} ${c.code}`, `R:${c.code}:view`)]);
    });
    return d.tg('sendMessage', { chat_id: ctx.chatId, text: lines.join('\n'), parse_mode: 'HTML', reply_markup: { inline_keyboard: rows.slice(0, 15) } });
  }

  async function adminHelp(ctx) {
    const db = dbReady() ? '🟢 База сертификатов подключена.' : '🔴 База сертификатов не подключена.';
    return d.tg('sendMessage', {
      chat_id: ctx.chatId, parse_mode: 'HTML',
      text: `🛠 <b>Сертификаты — для администраторов</b>\n\n${db}\n\n• Заказ приходит с кнопкой «✅ Оплачено — выдать сертификат» — бот создаст код и отправит клиенту.\n• Чтобы проверить или погасить сертификат, просто отправьте боту его код, например <code>LH-7K3M-Q9TX</code>.\n• /certs — последние выданные сертификаты.`,
      reply_markup: { inline_keyboard: [[d.btn('📋 Последние сертификаты', 'A:list')]] }
    });
  }

  /* ---------- входящий текст от админа ---------- */
  async function handleAdminText(ctx, text) {
    if (!isAdmin(ctx.from.id) || !dbReady()) return false;
    if (/^\/cancel\b/.test(text)) {
      await redis('DEL', `lh:pending:${ctx.from.id}`);
      await d.tg('sendMessage', { chat_id: ctx.chatId, text: 'Отменено.' });
      return true;
    }
    if (/^\/certs\b/.test(text)) { await listRecent(ctx); return true; }
    if (/^\/admin\b/.test(text)) { await adminHelp(ctx); return true; }

    if (!text.startsWith('/')) {
      const pending = await getJSON(`lh:pending:${ctx.from.id}`);
      if (pending) {
        const digits = text.replace(/[\s.,]/g, '');
        if (pending.action === 'issue') {
          const nominal = /^\d+$/.test(digits)
            ? { kind: 'amount', amount: Number(digits) }
            : { kind: 'service', service: text.slice(0, 120) };
          if (nominal.kind === 'amount' && nominal.amount < 10000) {
            await d.tg('sendMessage', { chat_id: ctx.chatId, text: 'Сумма слишком маленькая. Укажите номинал в сумах, например 1500000.' });
            return true;
          }
          await redis('DEL', `lh:pending:${ctx.from.id}`);
          const r = await issue(pending.orderId, ctx.from, nominal);
          await d.tg('sendMessage', { chat_id: ctx.chatId, parse_mode: 'HTML', text: r.code ? `✅ Выдан сертификат <code>${r.code}</code>, клиенту отправлен.` : r.alert });
          return true;
        }
        if (pending.action === 'part') {
          if (!/^\d+$/.test(digits)) {
            await d.tg('sendMessage', { chat_id: ctx.chatId, text: 'Укажите сумму цифрами, например 300000. Отмена — /cancel' });
            return true;
          }
          await redis('DEL', `lh:pending:${ctx.from.id}`);
          const r = await applyRedeem(pending.code, ctx.from, 'part', Number(digits));
          if (r.error) await d.tg('sendMessage', { chat_id: ctx.chatId, text: '⚠️ ' + r.error });
          await showAdminCard(ctx, pending.code, false);
          return true;
        }
      }
    }

    const code = parseCode(text.replace(/^\/cert\s*/i, ''));
    if (code && (text.startsWith('/cert') || !text.startsWith('/'))) { await showAdminCard(ctx, code, false); return true; }
    return false;
  }

  /* ---------- кнопки админа ---------- */
  async function handleCallback(ctx, data) {
    if (!isAdmin(ctx.from.id)) return { alert: 'Только для администраторов' };
    if (!dbReady()) return { alert: 'База сертификатов не подключена' };
    const [kind, arg, act] = data.split(':');
    if (kind === 'I') return issue(arg, ctx.from);
    if (kind === 'X') return reject(arg, ctx.from);
    if (kind === 'A') { if (arg === 'list') await listRecent(ctx); else await adminHelp(ctx); return null; }
    if (kind === 'R') {
      const code = parseCode(arg);
      if (!code) return { alert: 'Неверный код' };
      if (act === 'view') { await showAdminCard(ctx, code, true); return null; }
      if (act === 'part') {
        await setJSON(`lh:pending:${ctx.from.id}`, { action: 'part', code }, 'EX', PENDING_TTL);
        await d.tg('sendMessage', {
          chat_id: ctx.chatId, parse_mode: 'HTML',
          text: `➖ Сколько списать с сертификата <code>${code}</code>? Напишите сумму цифрами. Отмена — /cancel`,
          reply_markup: { force_reply: true, input_field_placeholder: '300000' }
        });
        return null;
      }
      if (act === 'all' || act === 'void') {
        const label = act === 'all' ? '✅ Да, погасить' : '⛔ Да, аннулировать';
        await d.tg('editMessageReplyMarkup', {
          chat_id: ctx.chatId, message_id: ctx.messageId,
          reply_markup: { inline_keyboard: [[d.btn(label, `R:${code}:${act}!`), d.btn('Отмена', `R:${code}:view`)]] }
        });
        return { alert: act === 'all' ? 'Подтвердите погашение' : 'Подтвердите аннулирование' };
      }
      if (act === 'all!' || act === 'void!') {
        const r = await applyRedeem(code, ctx.from, act.slice(0, -1));
        await showAdminCard(ctx, code, true);
        return { alert: r.error || (act === 'all!' ? 'Сертификат погашен' : 'Сертификат аннулирован') };
      }
    }
    return null;
  }

  /* ---------- «Мои сертификаты» для клиента ---------- */
  async function showMine(ctx, l, show) {
    const lang = l === 'u' ? 'uz' : 'ru';
    const t = TXT[lang];
    const codes = dbReady() ? (await redis('SMEMBERS', `lh:user:${ctx.from.id}:certs`)) || [] : [];
    const certs = (await Promise.all(codes.map((c) => getJSON(`lh:cert:${c}`)))).filter(Boolean)
      .sort((a, b) => b.created.localeCompare(a.created));
    const rows = [[d.btn(t.b_order, `C:${l}`)], d.homeRow(l)];
    if (!certs.length) return show(ctx, `${t.mine_title}\n\n${t.mine_empty}`, rows);
    const lines = certs.map((c) => {
      const st = statusOf(c);
      const val = c.kind === 'amount'
        ? (c.balance === c.amount ? sumText(c.amount, lang) : `${t.balance.toLowerCase()} ${sumText(c.balance, lang)} / ${sumText(c.amount, lang)}`)
        : d.esc(c.service);
      return `${STATUS_ICON[st]} <code>${c.code}</code>\n${val} · ${t['st_' + st]} · ${t.until.toLowerCase()} ${fmtDate(c.expires)}`;
    });
    return show(ctx, `${t.mine_title}\n\n${lines.join('\n\n')}`, rows);
  }

  return { notifyOrder, handleAdminText, handleCallback, showMine, adminHelp, isAdmin, dbReady, parseCode, _redis: redis };
};
