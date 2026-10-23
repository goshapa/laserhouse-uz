/* Laser House — подарочные сертификаты.
   Реестр — Google Таблица со скриптом google-apps-script/Code.gs (веб-приложение).
   Переменные: SHEETS_URL — ссылка веб-приложения (…/exec), SHEETS_SECRET — общий секрет со скриптом.
   Файл с «_» в начале Vercel не превращает в отдельную функцию — это модуль для api/bot.js.

   Базы данных у бота нет: ход мастера «Создать сертификат» хранится прямо в сообщениях бота —
   в скрытой ссылке ⚙️ (JSON в параметре lh). Ответ админа на вопрос бота приходит с reply_to_message,
   нажатие кнопки — с самим сообщением, так бот и восстанавливает состояние. */
'use strict';

const crypto = require('crypto');

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // без 0/O/1/I — код не путают на слух
const CODE_RE = /\bLH[\s-]?([2-9A-HJ-NP-Z]{4})[\s-]?([2-9A-HJ-NP-Z]{4})\b/i;
const AMOUNTS = { 1: 500000, 2: 1000000, 3: 2000000, 4: 3000000 };
const STATE_URL = 'https://t.me/LaserHouseuzbot?start=menu&lh=';
const ST = { active: 'Активен', used: 'Использован', void: 'Аннулирован' };
const validMonths = () => Number(process.env.CERT_VALID_MONTHS || 12);

const TXT = {
  ru: {
    card_title: '🎁 <b>Подарочный сертификат Laser House</b>',
    code: 'Код', nominal: 'Номинал', service: 'Процедура', balance: 'Остаток', until: 'Действует до', for: 'Для',
    how_e: 'Чтобы воспользоваться сертификатом, назовите или покажите этот код администратору при записи или в студии. Сертификат можно подарить — просто перешлите это сообщение.',
    how_p: 'Печатный сертификат с этим кодом ждёт вас в студии {branch}. Код можно назвать администратору и при записи.',
    mine_title: '🎁 <b>Мои сертификаты</b>', mine_empty: 'У вас пока нет сертификатов.', b_order: '🎁 Заказать сертификат',
    st_active: 'активен', st_used: 'использован', st_void: 'аннулирован', st_expired: 'срок истёк',
    sum: 'сум'
  },
  uz: {
    card_title: '🎁 <b>Laser House sovg‘a sertifikati</b>',
    code: 'Kod', nominal: 'Nominal', service: 'Muolaja', balance: 'Qoldiq', until: 'Amal qilish muddati', for: 'Kim uchun',
    how_e: 'Sertifikatdan foydalanish uchun yozilishda yoki studiyada ushbu kodni administratorga ayting yoki ko‘rsating. Sertifikatni sovg‘a qilish mumkin — shunchaki ushbu xabarni yuboring.',
    how_p: 'Ushbu kodli bosma sertifikat sizni {branch} studiyasida kutmoqda. Kodni yozilishda administratorga ham aytishingiz mumkin.',
    mine_title: '🎁 <b>Mening sertifikatlarim</b>', mine_empty: 'Sizda hozircha sertifikat yo‘q.', b_order: '🎁 Sertifikat buyurtma qilish',
    st_active: 'faol', st_used: 'ishlatilgan', st_void: 'bekor qilingan', st_expired: 'muddati tugagan',
    sum: 'so‘m'
  }
};

module.exports = function createCerts(d) {
  // d: { tg, esc, money, btn, adminChats, userLink, branchName, homeRow }
  const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k]);
  const isAdmin = (id) => d.adminChats().includes(String(id));
  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('ru-RU', { timeZone: 'Asia/Tashkent' }) : '—');
  const today = () => fmtDate(new Date().toISOString());
  const sumText = (n, lang = 'ru') => `${d.money(Number(n))} ${TXT[lang].sum}`;
  const adminName = (from) => from.first_name || String(from.id);

  /* ---------- Google Таблица ---------- */
  const sheetsReady = () => Boolean(process.env.SHEETS_URL && process.env.SHEETS_SECRET);

  async function sheets(action, payload = {}) {
    if (!sheetsReady()) throw new Error('таблица сертификатов не подключена');
    const res = await fetch(process.env.SHEETS_URL, {
      method: 'POST',
      headers: { 'content-type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: process.env.SHEETS_SECRET, action, ...payload }),
      redirect: 'follow' // Apps Script отвечает через редирект на googleusercontent.com
    });
    const json = await res.json().catch(() => ({ ok: false, error: `ответ ${res.status} не JSON` }));
    if (!json.ok) throw new Error(json.error || 'ошибка таблицы');
    return json.result;
  }

  /* ---------- скрытое состояние в сообщении ---------- */
  const stateLink = (state) => `<a href="${STATE_URL}${Buffer.from(JSON.stringify(state)).toString('base64url')}">⚙️</a>`;
  function readState(message) {
    const e = ((message && (message.entities || message.caption_entities)) || [])
      .find((x) => x.type === 'text_link' && x.url && x.url.startsWith(STATE_URL));
    if (!e) return null;
    try { return JSON.parse(Buffer.from(e.url.slice(STATE_URL.length), 'base64url').toString()); } catch (_) { return null; }
  }

  /* ---------- коды и статусы ---------- */
  function genCode() {
    const c = Array.from(crypto.randomBytes(8), (x) => ALPHABET[x % ALPHABET.length]).join('');
    return `LH-${c.slice(0, 4)}-${c.slice(4)}`;
  }
  function parseCode(text) {
    const m = (text || '').toUpperCase().match(CODE_RE);
    return m ? `LH-${m[1]}-${m[2]}` : null;
  }
  const isAmount = (c) => typeof c.nominal === 'number' || /^\d+$/.test(String(c.nominal));
  function statusOf(c) {
    if (c.status === ST.void) return 'void';
    if (c.status === ST.used) return 'used';
    if (c.expires && new Date(c.expires) < new Date()) return 'expired';
    return 'active';
  }
  const ICON = { active: '🟢', used: '⚪', void: '⛔', expired: '⌛' };
  const nominalLine = (c, lang) => (isAmount(c)
    ? `${TXT[lang].nominal}: <b>${sumText(c.nominal, lang)}</b>`
    : `${TXT[lang].service}: <b>${d.esc(c.nominal)}</b>`);

  async function sendTo(chat_id, text, reply_markup) {
    return d.tg('sendMessage', { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true, ...(reply_markup ? { reply_markup } : {}) });
  }
  async function editOrSend(ctx, text, reply_markup) {
    if (ctx.messageId) {
      const r = await d.tg('editMessageText', { chat_id: ctx.chatId, message_id: ctx.messageId, text, parse_mode: 'HTML', disable_web_page_preview: true, reply_markup });
      if (r.ok || /not modified/.test(r.description || '')) return r;
    }
    return sendTo(ctx.chatId, text, reply_markup);
  }

  /* ---------- заказ клиента → админам ---------- */
  async function notifyOrder(from, order, text) {
    const chats = d.adminChats();
    if (!chats.length) { console.warn('[certs] ADMIN_CHAT_ID is not set, order:\n' + text); return; }
    if (!sheetsReady()) {
      await Promise.all(chats.map((id) => sendTo(id, text + '\n\n<i>Таблица сертификатов не подключена — выдайте сертификат вручную.</i>')));
      return;
    }
    const state = {
      m: 'o', o: crypto.randomBytes(4).toString('hex'), n: order.n, f: order.f, b: order.b,
      t: from.id, l: order.lang, pn: [from.first_name, from.last_name].filter(Boolean).join(' ')
    };
    const kb = { inline_keyboard: [[d.btn('✅ Оплачено — создать сертификат', 'W:start')]] };
    await Promise.all(chats.map((id) => sendTo(id, `${text} ${stateLink(state)}`, kb)));
  }

  /* ---------- мастер «Создать сертификат» ---------- */
  function nextStep(w) {
    if (w.n == null && !w.s) return w.k === 'amount' || w.k === 'service' ? w.k : 'nominal';
    if (!w.f) return 'format';
    if (w.f === 'p' && !w.b) return 'branch';
    if (w.bn === undefined) return 'name';
    if (w.ph === undefined) return 'phone';
    if (w.rc === undefined) return 'rc';
    return 'confirm';
  }

  function draftLines(w) {
    const lines = [];
    if (w.n != null) lines.push(`Номинал: <b>${sumText(w.n)}</b>`);
    if (w.s) lines.push(`Процедура: <b>${d.esc(w.s)}</b>`);
    if (w.f) lines.push(`Формат: <b>${w.f === 'p' ? 'печатный' : 'электронный'}</b>${w.f === 'p' && w.b ? ', ' + d.esc(d.branchName(w.b, 'ru')) : ''}`);
    if (w.bn !== undefined) lines.push(`Покупатель: <b>${d.esc(w.bn || '—')}</b>`);
    if (w.ph !== undefined) lines.push(`Телефон: <b>${d.esc(w.ph || '—')}</b>`);
    if (w.rc !== undefined) lines.push(`Получатель: <b>${d.esc(w.rc || '—')}</b>`);
    if (w.t) lines.push('<i>Клиент из бота — карточка придёт ему автоматически.</i>');
    return lines.length ? '\n\n' + lines.join('\n') : '';
  }

  async function renderWizard(ctx, w, viaButton) {
    const step = nextStep(w);
    const head = '🎁 <b>Новый сертификат</b>';
    const cancel = d.btn('✖ Отмена', 'W:cancel');
    const prompt = (question, placeholder) => {
      const st = { ...w, k: step };
      return sendTo(ctx.chatId, `${head}${draftLines(w)}\n\n${question} ${stateLink(st)}`, { force_reply: true, input_field_placeholder: placeholder });
    };
    const buttons = (question, rows) => {
      const text = `${head}${draftLines(w)}\n\n${question} ${stateLink(w)}`;
      const kb = { inline_keyboard: [...rows, [cancel]] };
      return viaButton ? editOrSend(ctx, text, kb) : sendTo(ctx.chatId, text, kb);
    };

    switch (step) {
      case 'nominal':
        return buttons('<b>Номинал сертификата:</b>', [
          [d.btn('500 000', 'W:n:1'), d.btn('1 000 000', 'W:n:2')],
          [d.btn('2 000 000', 'W:n:3'), d.btn('3 000 000', 'W:n:4')],
          [d.btn('✍️ Своя сумма', 'W:n:amount'), d.btn('💆 На процедуру', 'W:n:service')]
        ]);
      case 'amount':
        return prompt('Напишите <b>сумму</b> цифрами, например <code>1500000</code>.', '1500000');
      case 'service':
        return prompt('Опишите <b>процедуру</b>, например <code>Бикини глубокое, 3 процедуры</code>.', 'Бикини глубокое, 3 процедуры');
      case 'format':
        return buttons('<b>Формат:</b>', [[d.btn('📲 Электронный', 'W:f:e'), d.btn('🎀 Печатный', 'W:f:p')]]);
      case 'branch':
        return buttons('<b>В какой студии заберут печатный сертификат?</b>', [1, 2, 3].map((n) => [d.btn(d.branchName(n, 'ru'), `W:b:${n}`)]));
      case 'name':
        return prompt(w.pn
          ? `<b>Имя покупателя</b> — напишите имя или «-», чтобы оставить «${d.esc(w.pn)}».`
          : 'Напишите <b>имя покупателя</b>.', 'Имя');
      case 'phone':
        return prompt('<b>Телефон покупателя</b>, например <code>+998 90 123-45-67</code>, или «-», чтобы пропустить.', '+998 ...');
      case 'rc':
        return prompt('<b>Кому сертификат</b> — имя получателя, или «-», если не указывать.', 'Имя получателя или -');
      default:
        return buttons('<b>Всё верно?</b>', [[d.btn('✅ Создать сертификат', 'W:ok')]]);
    }
  }

  async function wizardInput(ctx, w, text) {
    const t = text.trim();
    const skip = t === '-' || t === '—' || /^пропустить$/i.test(t);
    const digits = t.replace(/[\s.,]/g, '');
    switch (w.k) {
      case 'amount':
        if (!/^\d+$/.test(digits) || Number(digits) < 10000) {
          await sendTo(ctx.chatId, 'Нужна сумма цифрами, не меньше 10 000. Попробуйте ещё раз — ответьте на вопрос выше.');
          return;
        }
        w.n = Number(digits);
        break;
      case 'service':
        if (t.length < 2) { await sendTo(ctx.chatId, 'Опишите процедуру словами — ответьте на вопрос выше.'); return; }
        w.s = t.slice(0, 120);
        break;
      case 'name': w.bn = skip ? (w.pn || '') : t.slice(0, 60); break;
      case 'phone':
        if (!skip && t.replace(/\D/g, '').length < 9) {
          await sendTo(ctx.chatId, 'Похоже, номер неполный. Напишите телефон целиком или «-», чтобы пропустить.');
          return;
        }
        w.ph = skip ? '' : t.slice(0, 30);
        break;
      case 'rc': w.rc = skip ? '' : t.slice(0, 60); break;
      default: return;
    }
    delete w.k;
    await renderWizard(ctx, w, false);
  }

  async function createFromWizard(ctx, w) {
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + validMonths());
    const cert = {
      code: '', nominal: w.n != null ? w.n : w.s, balance: w.n != null ? w.n : '—', status: ST.active,
      buyer: w.bn || '', phone: w.ph || '', recipient: w.rc || '',
      format: w.f === 'p' ? 'Печатный' : 'Электронный', branch: w.f === 'p' ? d.branchName(w.b, 'ru') : '',
      issued: now.toISOString(), expires: expires.toISOString(), issuedBy: adminName(ctx.from),
      history: `${today()} — выдан (${adminName(ctx.from)})`, buyerTg: w.t ? String(w.t) : '', order: w.o || ''
    };
    let result = null;
    for (let i = 0; i < 5; i++) {
      cert.code = genCode();
      result = await sheets('create', { cert });
      if (!result.duplicate) break;
    }
    if (result.existing) {
      await editOrSend(ctx, `ℹ️ По этому заказу сертификат уже создан: <code>${result.existing.code}</code> (${d.esc(result.existing.issuedBy)}).`, { inline_keyboard: [[d.btn('Открыть', `R:${result.existing.code}:view`)]] });
      return;
    }
    const c = result.created;
    const lang = w.l === 'uz' ? 'uz' : 'ru';
    const card = clientCard(c, lang, w.b);
    let sentToClient = false;
    if (c.buyerTg) sentToClient = (await sendTo(c.buyerTg, card)).ok;
    await editOrSend(ctx, `✅ <b>Сертификат создан</b> и записан в таблицу: <code>${c.code}</code>${draftLines({ ...w, t: undefined })}\n\n${sentToClient ? 'Карточка отправлена клиенту в бот.' : 'Перешлите клиенту карточку ниже 👇'}`,
      { inline_keyboard: [[d.btn('Открыть сертификат', `R:${c.code}:view`)]] });
    await sendTo(ctx.chatId, card);
  }

  function clientCard(c, lang, branchId) {
    const t = TXT[lang];
    const how = c.format === 'Печатный'
      ? fill(t.how_p, { branch: d.esc(branchId ? d.branchName(branchId, lang) : c.branch) })
      : t.how_e;
    const forLine = c.recipient ? `\n${t.for}: <b>${d.esc(c.recipient)}</b>` : '';
    return `${t.card_title}\n\n${t.code}: <code>${c.code}</code>\n${nominalLine(c, lang)}${forLine}\n${t.until}: <b>${fmtDate(c.expires)}</b>\n\n${how}`;
  }

  /* ---------- карточка для админа и погашение ---------- */
  function adminCard(c) {
    const st = statusOf(c);
    const lines = [
      `🎁 <b>Сертификат</b> <code>${c.code}</code>`,
      `Статус: ${ICON[st]} <b>${TXT.ru['st_' + st]}</b>`,
      nominalLine(c, 'ru')
    ];
    if (isAmount(c)) lines.push(`Остаток: <b>${sumText(c.balance)}</b>`);
    lines.push(`Действует до: <b>${fmtDate(c.expires)}</b>`);
    lines.push(`Покупатель: ${d.esc(c.buyer || '—')}${c.phone ? ', ' + d.esc(c.phone) : ''}`);
    if (c.recipient) lines.push(`Получатель: ${d.esc(c.recipient)}`);
    lines.push(`Формат: ${d.esc(c.format)}${c.branch ? ', ' + d.esc(c.branch) : ''}`);
    if (c.history) lines.push('', '<b>История</b>', ...c.history.split('\n').slice(-8).map((h) => '• ' + d.esc(h)));
    return lines.join('\n');
  }
  function adminKeyboard(c) {
    const rows = [];
    if (statusOf(c) === 'active') {
      rows.push(isAmount(c)
        ? [d.btn('✅ Погасить полностью', `R:${c.code}:all`), d.btn('➖ Списать часть', `R:${c.code}:part`)]
        : [d.btn('✅ Погасить', `R:${c.code}:all`)]);
      rows.push([d.btn('⛔ Аннулировать', `R:${c.code}:void`)]);
    }
    rows.push([d.btn('🔄 Обновить', `R:${c.code}:view`), d.btn('📋 Последние', 'A:list')]);
    return { inline_keyboard: rows };
  }

  async function showCard(ctx, code, edit) {
    const c = await sheets('get', { code });
    if (!c) return sendTo(ctx.chatId, `❌ Сертификат <code>${d.esc(code)}</code> не найден в таблице. Без записи в таблице он недействителен.`);
    return edit ? editOrSend(ctx, adminCard(c), adminKeyboard(c)) : sendTo(ctx.chatId, adminCard(c), adminKeyboard(c));
  }

  async function redeem(ctx, code, action, amount) {
    const c = await sheets('get', { code });
    if (!c) return { error: 'Сертификат не найден.' };
    if (statusOf(c) !== 'active') return { error: `Сертификат ${TXT.ru['st_' + statusOf(c)]} — операция невозможна.` };
    const by = adminName(ctx.from);
    const upd = { code, expectStatus: ST.active, expectBalance: c.balance };
    let note;
    if (action === 'part') {
      const bal = Number(c.balance);
      if (!(amount > 0)) return { error: 'Укажите сумму больше нуля.' };
      if (amount > bal) return { error: `Сумма больше остатка (${sumText(bal)}).` };
      upd.balance = bal - amount;
      if (upd.balance === 0) upd.status = ST.used;
      upd.historyLine = `${today()} — списано ${sumText(amount)}, остаток ${sumText(upd.balance)} (${by})`;
      note = upd.balance === 0
        ? `Сертификат <code>${code}</code> использован. Спасибо, что выбрали Laser House! 🤍`
        : `Сертификат <code>${code}</code>: списано <b>${sumText(amount)}</b>. Остаток: <b>${sumText(upd.balance)}</b>.`;
    } else if (action === 'all') {
      if (isAmount(c)) upd.balance = 0;
      upd.status = ST.used;
      upd.historyLine = `${today()} — погашен полностью${isAmount(c) ? ', списано ' + sumText(c.balance) : ''} (${by})`;
      note = `Сертификат <code>${code}</code> использован. Спасибо, что выбрали Laser House! 🤍`;
    } else {
      upd.status = ST.void;
      upd.historyLine = `${today()} — аннулирован (${by})`;
      note = `Сертификат <code>${code}</code> аннулирован. Если это ошибка — напишите администратору.`;
    }
    const r = await sheets('update', upd);
    if (!r) return { error: 'Сертификат не найден.' };
    if (r.conflict) return { error: 'Сертификат только что изменил другой администратор — откройте его заново.' };
    if (c.buyerTg) await sendTo(c.buyerTg, note);
    return { cert: r.updated };
  }

  async function listRecent(ctx) {
    const list = await sheets('list', { limit: 12 });
    if (!list.length) return sendTo(ctx.chatId, 'В таблице пока нет сертификатов.', { inline_keyboard: [[d.btn('➕ Создать сертификат', 'W:new')]] });
    const lines = ['📋 <b>Последние сертификаты</b>', ''];
    list.forEach((c) => {
      const st = statusOf(c);
      const val = isAmount(c) ? `${sumText(c.balance)} из ${sumText(c.nominal)}` : d.esc(c.nominal);
      lines.push(`${ICON[st]} <code>${c.code}</code> — ${val} · ${d.esc(c.buyer || '—')} · до ${fmtDate(c.expires)}`);
    });
    const rows = list.map((c) => [d.btn(`${ICON[statusOf(c)]} ${c.code}`, `R:${c.code}:view`)]);
    rows.push([d.btn('➕ Создать сертификат', 'W:new')]);
    return sendTo(ctx.chatId, lines.join('\n'), { inline_keyboard: rows });
  }

  async function adminHelp(ctx) {
    const db = sheetsReady() ? '🟢 Таблица сертификатов подключена.' : '🔴 Таблица сертификатов не подключена.';
    return sendTo(ctx.chatId,
      `🛠 <b>Сертификаты — для администраторов</b>\n\n${db}\n\n` +
      '• <b>Создать</b> — кнопка ниже или /create. Бот спросит номинал, формат, покупателя, телефон и получателя, создаст код и запишет строку в таблицу.\n' +
      '• Заказ клиента из бота приходит с кнопкой «Оплачено — создать сертификат» — данные подставятся сами.\n' +
      '• <b>Проверить или погасить</b> — просто отправьте боту код, например <code>LH-7K3M-Q9TX</code>.\n' +
      '• /certs — последние сертификаты.',
      { inline_keyboard: [[d.btn('➕ Создать сертификат', 'W:new'), d.btn('📋 Последние', 'A:list')]] });
  }

  /* ---------- текст от админа ---------- */
  async function handleAdminText(ctx, text, msg) {
    if (!isAdmin(ctx.from.id)) return false;
    try {
      if (/^\/(admin|certhelp)\b/.test(text)) { await adminHelp(ctx); return true; }
      if (!sheetsReady()) {
        if (/^\/(create|certs)\b/.test(text)) { await adminHelp(ctx); return true; }
        return false;
      }
      if (/^\/create\b/.test(text)) { await renderWizard(ctx, { m: 'w' }, false); return true; }
      if (/^\/certs\b/.test(text)) { await listRecent(ctx); return true; }

      const st = readState(msg && msg.reply_to_message);
      if (st && st.m === 'w' && st.k && !text.startsWith('/')) { await wizardInput(ctx, st, text); return true; }
      if (st && st.m === 'p' && !text.startsWith('/')) {
        const digits = text.replace(/[\s.,]/g, '');
        if (!/^\d+$/.test(digits)) { await sendTo(ctx.chatId, 'Нужна сумма цифрами, например 300000 — ответьте на вопрос выше.'); return true; }
        const r = await redeem(ctx, st.c, 'part', Number(digits));
        if (r.error) await sendTo(ctx.chatId, '⚠️ ' + r.error);
        await showCard(ctx, st.c, false);
        return true;
      }

      const code = parseCode(text);
      if (code && (!text.startsWith('/') || /^\/cert\b/.test(text))) { await showCard(ctx, code, false); return true; }
    } catch (e) {
      console.error('[certs]', e);
      await sendTo(ctx.chatId, '⚠️ Таблица сертификатов недоступна: ' + d.esc(e.message));
      return true;
    }
    return false;
  }

  /* ---------- кнопки админа ---------- */
  async function handleCallback(ctx, data) {
    if (!isAdmin(ctx.from.id)) return { alert: 'Только для администраторов' };
    const [kind, arg, act] = data.split(':');
    try {
      if (kind === 'A') {
        if (arg === 'list' && sheetsReady()) await listRecent(ctx);
        else await adminHelp(ctx);
        return null;
      }
      if (!sheetsReady()) return { alert: 'Таблица сертификатов не подключена' };

      if (kind === 'W') {
        if (arg === 'new') { await renderWizard(ctx, { m: 'w' }, false); return null; }
        const st = readState(ctx.message);
        if (!st) return { alert: 'Не удалось прочитать данные — начните заново: /create' };
        if (arg === 'start') {
          // из заказа клиента: подставляем номинал, формат, студию и покупателя
          const w = { m: 'w', o: st.o, t: st.t, l: st.l, pn: st.pn, f: st.f, b: st.b && st.b !== '-' ? st.b : undefined };
          if (AMOUNTS[st.n]) w.n = AMOUNTS[st.n];
          else w.k = String(st.n) === '5' ? 'service' : 'amount';
          await renderWizard(ctx, w, false);
          return { alert: 'Заполните сертификат' };
        }
        const w = { ...st };
        if (arg === 'cancel') { await editOrSend(ctx, '✖ Создание сертификата отменено.', { inline_keyboard: [] }); return null; }
        if (arg === 'n') {
          if (AMOUNTS[act]) w.n = AMOUNTS[act];
          else w.k = act === 'service' ? 'service' : 'amount';
        }
        if (arg === 'f') w.f = act === 'p' ? 'p' : 'e';
        if (arg === 'b') w.b = act;
        if (arg === 'ok') {
          if (nextStep(w) !== 'confirm') return { alert: 'Заполните все шаги' };
          await createFromWizard(ctx, w);
          return { alert: 'Сертификат создан' };
        }
        // текстовые шаги отправляются новым сообщением — убираем кнопки у текущего
        const step = nextStep(w);
        if (['amount', 'service', 'name', 'phone', 'rc'].includes(step)) {
          await d.tg('editMessageReplyMarkup', { chat_id: ctx.chatId, message_id: ctx.messageId, reply_markup: { inline_keyboard: [] } });
        }
        await renderWizard(ctx, w, true);
        return null;
      }

      if (kind === 'R') {
        const code = parseCode(arg);
        if (!code) return { alert: 'Неверный код' };
        if (act === 'view') { await showCard(ctx, code, true); return null; }
        if (act === 'part') {
          await sendTo(ctx.chatId, `➖ Сколько списать с сертификата <code>${code}</code>? Напишите сумму цифрами. ${stateLink({ m: 'p', c: code })}`,
            { force_reply: true, input_field_placeholder: '300000' });
          return null;
        }
        if (act === 'all' || act === 'void') {
          await d.tg('editMessageReplyMarkup', {
            chat_id: ctx.chatId, message_id: ctx.messageId,
            reply_markup: { inline_keyboard: [[d.btn(act === 'all' ? '✅ Да, погасить' : '⛔ Да, аннулировать', `R:${code}:${act}!`), d.btn('Отмена', `R:${code}:view`)]] }
          });
          return { alert: act === 'all' ? 'Подтвердите погашение' : 'Подтвердите аннулирование' };
        }
        if (act === 'all!' || act === 'void!') {
          const r = await redeem(ctx, code, act.slice(0, -1));
          await showCard(ctx, code, true);
          return { alert: r.error || (act === 'all!' ? 'Сертификат погашен' : 'Сертификат аннулирован') };
        }
      }
    } catch (e) {
      console.error('[certs]', e);
      await sendTo(ctx.chatId, '⚠️ Таблица сертификатов недоступна: ' + d.esc(e.message));
      return { alert: 'Ошибка таблицы' };
    }
    return null;
  }

  /* ---------- «Мои сертификаты» для клиента ---------- */
  async function showMine(ctx, l, show) {
    const lang = l === 'u' ? 'uz' : 'ru';
    const t = TXT[lang];
    let list = [];
    if (sheetsReady()) {
      try { list = await sheets('byBuyer', { tg: ctx.from.id }); } catch (e) { console.error('[certs]', e); }
    }
    const rows = [[d.btn(t.b_order, `C:${l}`)], d.homeRow(l)];
    if (!list.length) return show(ctx, `${t.mine_title}\n\n${t.mine_empty}`, rows);
    const lines = list.map((c) => {
      const st = statusOf(c);
      const val = isAmount(c)
        ? (Number(c.balance) === Number(c.nominal) ? sumText(c.nominal, lang) : `${t.balance.toLowerCase()} ${sumText(c.balance, lang)} / ${sumText(c.nominal, lang)}`)
        : d.esc(c.nominal);
      return `${ICON[st]} <code>${c.code}</code>\n${val} · ${t['st_' + st]} · ${t.until.toLowerCase()} ${fmtDate(c.expires)}`;
    });
    return show(ctx, `${t.mine_title}\n\n${lines.join('\n\n')}`, rows);
  }

  return { notifyOrder, handleAdminText, handleCallback, showMine, adminHelp, isAdmin, sheetsReady, parseCode, _sheets: sheets };
};
