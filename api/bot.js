/* Laser House — Telegram-бот.
   Работает как Vercel-функция по вебхуку: https://<домен>/api/bot
   Базы данных нет: шаги записи и заказа сертификата хранятся прямо в callback_data кнопок,
   готовые заявки сразу уходят в чат администраторов (ADMIN_CHAT_ID).

   Переменные окружения:
     TELEGRAM_BOT_TOKEN — токен от @BotFather
     WEBHOOK_SECRET     — любая длинная случайная строка (защищает вебхук и /api/bot?setup=…)
     ADMIN_CHAT_ID      — куда падают заявки: id группы или личные id админов через запятую
                          (узнать: команда /chatid; админ должен сначала нажать /start у бота)

   Диплинки с сайта: t.me/<бот>?start=book | book_1 | book_2 | book_3 | cert | prices | branches */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

/* ---------- контент сайта (цены, FAQ, памятка) — один источник правды ---------- */
function loadSiteData() {
  const ctx = {};
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'data.js'), 'utf8'), ctx);
  return ctx.LH;
}
const LH = loadSiteData();

const SITE = 'https://laserhouse.vercel.app';
const ADMIN_CONTACT = 'https://t.me/laserhouse_uz';

const BRANCHES = {
  1: {
    city: 't', phone: '+998 94 000-00-48',
    booking: 'https://n1237691.alteg.io/company/1169982/personal/menu',
    map: 'https://yandex.uz/maps/?text=' + encodeURIComponent('Ташкент, улица Буюк Ипак Йули, 13'),
    ru: { name: 'Ц-1', addr: 'ул. Буюк Ипак Йули, 13', land: 'кафе Bibigon' },
    uz: { name: 'S-1', addr: 'Buyuk Ipak Yo‘li ko‘chasi, 13', land: 'Bibigon kafesi' }
  },
  2: {
    city: 't', phone: '+998 94 000-00-48',
    booking: 'https://n1237691.alteg.io/company/760550/personal/menu',
    map: 'https://yandex.uz/maps/?text=' + encodeURIComponent('Ташкент, улица Нукус, 72/2'),
    ru: { name: 'Нукус', addr: 'ул. Нукус, 72/2, Мирабадский район', land: 'напротив Посольства России' },
    uz: { name: 'Nukus', addr: 'Nukus ko‘chasi, 72/2, Mirobod tumani', land: 'Rossiya elchixonasi qarshisida' }
  },
  3: {
    city: 's', phone: '+998 50 040-80-88',
    booking: null,
    map: 'https://yandex.uz/maps/?text=' + encodeURIComponent('Самарканд, улица Буюк Ипак Йули, 25'),
    ru: { name: 'Самарканд', addr: 'ул. Буюк Ипак Йули, 25', land: 'школа №14' },
    uz: { name: 'Samarqand', addr: 'Buyuk Ipak Yo‘li ko‘chasi, 25', land: '14-maktab' }
  }
};

const NOMINALS = {
  1: { ru: '500 000 сум', uz: '500 000 so‘m' },
  2: { ru: '1 000 000 сум', uz: '1 000 000 so‘m' },
  3: { ru: '2 000 000 сум', uz: '2 000 000 so‘m' },
  4: { ru: '3 000 000 сум', uz: '3 000 000 so‘m' },
  5: { ru: 'На конкретную зону', uz: 'Muayyan zona uchun' },
  6: { ru: 'Другая сумма', uz: 'Boshqa summa' }
};

/* ---------- тексты ---------- */
const T = {
  ru: {
    menu: '<b>Laser House</b> — сеть студий лазерной эпиляции в Ташкенте и Самарканде.\n\nCandela (США) · DEKA (Италия) · HairBoss X-Fest (Германия) — все аппараты последних моделей.\n\nЧем могу помочь?',
    b_book: '📅 Записаться на процедуру', b_prices: '💎 Цены', b_cert: '🎁 Подарочный сертификат',
    b_branches: '📍 Филиалы и контакты', b_lasers: '⚡ Наши аппараты', b_prep: '📋 Подготовка',
    b_faq: '❓ Частые вопросы', b_admin: '💬 Написать администратору', b_lang: '🇺🇿 O‘zbek tili',
    b_menu: '🏠 Главное меню', b_back: '← Назад', b_site: '🌐 Открыть сайт',

    book_city: '📅 <b>Запись на процедуру</b>\n\nВ каком городе вам удобно?',
    city_t: 'Ташкент', city_s: 'Самарканд',
    book_branch: '📅 <b>Запись</b>\n\nВыберите студию:',
    book_sex: '📅 <b>Запись</b>\n\nДля кого процедура?', sex_w: 'Для неё', sex_m: 'Для него',
    book_dev: '📅 <b>Запись</b>\n\nНа каком аппарате?',
    dev_a: 'Candela (США)', dev_k: 'DEKA Motus PRO (Италия)', dev_h: 'HairBoss X-Fest (Германия)', dev_x: 'Не знаю — подберёт мастер',
    book_zones: '📅 <b>Запись</b>\n\nВыберите раздел и отметьте нужные зоны — можно в нескольких разделах. Затем нажмите «Готово».',
    book_zones_sel: 'Выбрано: <b>{n}</b> · ≈ <b>{sum}</b> за процедуру',
    book_section: '📅 <b>Запись · {name}</b>\n\nОтметьте зоны:',
    b_sections: '← К разделам', consult: '💬 Нужна консультация', f_total: 'Стоимость', per_proc: 'за процедуру',
    zones_done: 'Готово →', zones_need: 'Отметьте хотя бы одну зону',
    book_when: '📅 <b>Запись</b>\n\nКогда вам удобно прийти?',
    when_1: 'Сегодня', when_2: 'Завтра', when_3: 'В ближайшие дни', when_4: 'Подберите время сами',
    b_online: '🗓 Выбрать время онлайн',
    book_check: '📅 <b>Проверьте заявку</b>',
    f_branch: 'Студия', f_for: 'Для кого', f_dev: 'Аппарат', f_zones: 'Зоны', f_when: 'Когда',
    b_send: '✅ Отправить заявку', b_restart: '✏️ Заполнить заново',
    book_done: '✅ <b>Заявка отправлена!</b>\n\nАдминистратор свяжется с вами в ближайшее время и подтвердит день и время. Мы работаем каждый день с 10:00 до 21:00.',

    cert_intro: '🎁 <b>Подарочный сертификат Laser House</b>\n\nКрасивый способ сказать «я о тебе забочусь».\n\nВыберите номинал:',
    cert_format: '🎁 <b>Сертификат</b>\n\nКакой формат удобнее?',
    f_e: '📲 Электронный — пришлём в Telegram', f_p: '🎀 Печатный — заберу в студии',
    cert_pickup: '🎁 <b>Сертификат</b>\n\nВ какой студии заберёте?',
    cert_check: '🎁 <b>Проверьте заказ</b>', f_nominal: 'Номинал', f_format: 'Формат', f_pickup: 'Студия',
    fmt_e: 'Электронный', fmt_p: 'Печатный',
    cert_done: '✅ <b>Заказ принят!</b>\n\nАдминистратор свяжется с вами, чтобы уточнить детали и оплату.',

    ask_phone: 'Оставьте номер телефона — так администратор свяжется с вами быстрее 👇',
    b_phone: '📱 Отправить номер', b_no_phone: 'Не нужно',
    phone_thanks: 'Спасибо! Номер передан администратору.',
    no_phone_ok: 'Хорошо, администратор напишет вам здесь, в Telegram.',

    prices_pick: '💎 <b>Цены</b>\n\nКакой прайс показать?',
    p_wa: 'Для неё · Candela / DEKA', p_wh: 'Для неё · HairBoss', p_ma: 'Для него · Candela',
    prices_note: '<i>Цены за одну процедуру. Курс — 6–10 процедур с интервалом 4–6 недель.</i>',
    sale_note: '<i>Цены указаны с учётом скидки.</i>',
    t_wa: 'Для неё · DEKA / Candela (александрит)', t_wh: 'Для неё · HairBoss X-Fest (диод)', t_ma: 'Для него · Candela (александрит)',
    sum: 'сум',

    branches: '📍 <b>Наши студии</b>\n\nКаждый день с 10:00 до 21:00.',
    tashkent: 'Ташкент', samarkand: 'Самарканд', landmark: 'Ориентир', route: '🗺 Маршрут', online: '🗓 Онлайн-запись',

    lasers: '⚡ <b>Три лазера. Ноль компромиссов.</b>\n\nВсе аппараты — последних моделей, лучшие в своём классе.\n\n<b>I. Candela GentleLase Pro-U</b> · США\nЗолотой стандарт лазерной эпиляции. Идеален для светлой кожи и тёмных волос, первые результаты — уже после первой процедуры. Современное охлаждение.\n\n<b>II. DEKA Motus PRO</b> · Италия\nМногофункциональная платформа: александритовый и неодимовый лазеры. Технология Moveo и современное охлаждение делают процедуру мягкой и комфортной.\n\n<b>III. HairBoss X-Fest</b> · Германия\nКомфортный и универсальный диод: подходит для всех типов кожи, работает круглый год. Современное охлаждение — лишь лёгкое тепло и покалывание.\n\nКакой аппарат подойдёт именно вам, мастер подскажет на консультации.',

    prep_pick: '📋 <b>Памятка к лазерной эпиляции</b>\n\nВыберите этап:', b_contra: '⛔ Противопоказания',
    contra: '⛔ <b>Противопоказания</b>\n\nПротивопоказание — повод проконсультироваться с врачом перед процедурой.\n\n',
    faq_pick: '❓ <b>Частые вопросы</b>',

    text_fwd: 'Спасибо! Я передал ваше сообщение администратору — он ответит здесь, в Telegram.',
    group_only: 'Я работаю в личных сообщениях. Для настройки: /chatid'
  },
  uz: {
    menu: '<b>Laser House</b> — Toshkent va Samarqanddagi lazer epilyatsiyasi studiyalari tarmog‘i.\n\nCandela (AQSH) · DEKA (Italiya) · HairBoss X-Fest (Germaniya) — barcha apparatlar so‘nggi modellar.\n\nQanday yordam bera olaman?',
    b_book: '📅 Muolajaga yozilish', b_prices: '💎 Narxlar', b_cert: '🎁 Sovg‘a sertifikati',
    b_branches: '📍 Filiallar va kontaktlar', b_lasers: '⚡ Apparatlarimiz', b_prep: '📋 Tayyorgarlik',
    b_faq: '❓ Ko‘p beriladigan savollar', b_admin: '💬 Administratorga yozish', b_lang: '🇷🇺 Русский язык',
    b_menu: '🏠 Bosh menyu', b_back: '← Orqaga', b_site: '🌐 Saytni ochish',

    book_city: '📅 <b>Muolajaga yozilish</b>\n\nQaysi shaharda qulay?',
    city_t: 'Toshkent', city_s: 'Samarqand',
    book_branch: '📅 <b>Yozilish</b>\n\nStudiyani tanlang:',
    book_sex: '📅 <b>Yozilish</b>\n\nMuolaja kim uchun?', sex_w: 'Ayol uchun', sex_m: 'Erkak uchun',
    book_dev: '📅 <b>Yozilish</b>\n\nQaysi apparatda?',
    dev_a: 'Candela (AQSH)', dev_k: 'DEKA Motus PRO (Italiya)', dev_h: 'HairBoss X-Fest (Germaniya)', dev_x: 'Bilmayman — usta tanlaydi',
    book_zones: '📅 <b>Yozilish</b>\n\nBo‘limni tanlang va kerakli zonalarni belgilang — bir nechta bo‘limda ham mumkin. So‘ng «Tayyor»ni bosing.',
    book_zones_sel: 'Tanlandi: <b>{n}</b> · ≈ <b>{sum}</b> bir muolaja uchun',
    book_section: '📅 <b>Yozilish · {name}</b>\n\nZonalarni belgilang:',
    b_sections: '← Bo‘limlarga', consult: '💬 Konsultatsiya kerak', f_total: 'Narxi', per_proc: 'bir muolaja uchun',
    zones_done: 'Tayyor →', zones_need: 'Kamida bitta zonani belgilang',
    book_when: '📅 <b>Yozilish</b>\n\nQachon kelish qulay?',
    when_1: 'Bugun', when_2: 'Ertaga', when_3: 'Yaqin kunlarda', when_4: 'Vaqtni o‘zingiz tanlang',
    b_online: '🗓 Vaqtni onlayn tanlash',
    book_check: '📅 <b>Arizani tekshiring</b>',
    f_branch: 'Studiya', f_for: 'Kim uchun', f_dev: 'Apparat', f_zones: 'Zonalar', f_when: 'Qachon',
    b_send: '✅ Arizani yuborish', b_restart: '✏️ Qaytadan to‘ldirish',
    book_done: '✅ <b>Ariza yuborildi!</b>\n\nAdministrator tez orada siz bilan bog‘lanib, kun va vaqtni tasdiqlaydi. Har kuni 10:00 dan 21:00 gacha ishlaymiz.',

    cert_intro: '🎁 <b>Laser House sovg‘a sertifikati</b>\n\n«Men sen haqingda qayg‘uraman» deyishning chiroyli usuli.\n\nNominalni tanlang:',
    cert_format: '🎁 <b>Sertifikat</b>\n\nQaysi format qulay?',
    f_e: '📲 Elektron — Telegram’da yuboramiz', f_p: '🎀 Bosma — studiyadan olib ketaman',
    cert_pickup: '🎁 <b>Sertifikat</b>\n\nQaysi studiyadan olib ketasiz?',
    cert_check: '🎁 <b>Buyurtmani tekshiring</b>', f_nominal: 'Nominal', f_format: 'Format', f_pickup: 'Studiya',
    fmt_e: 'Elektron', fmt_p: 'Bosma',
    cert_done: '✅ <b>Buyurtma qabul qilindi!</b>\n\nAdministrator tafsilotlar va to‘lovni aniqlashtirish uchun siz bilan bog‘lanadi.',

    ask_phone: 'Telefon raqamingizni qoldiring — administrator siz bilan tezroq bog‘lanadi 👇',
    b_phone: '📱 Raqamni yuborish', b_no_phone: 'Kerak emas',
    phone_thanks: 'Rahmat! Raqam administratorga yuborildi.',
    no_phone_ok: 'Yaxshi, administrator sizga shu yerda, Telegram’da yozadi.',

    prices_pick: '💎 <b>Narxlar</b>\n\nQaysi narxnomani ko‘rsatay?',
    p_wa: 'Ayollar · Candela / DEKA', p_wh: 'Ayollar · HairBoss', p_ma: 'Erkaklar · Candela',
    prices_note: '<i>Narxlar bir muolaja uchun. Kurs — 4–6 hafta oraliq bilan 6–10 muolaja.</i>',
    sale_note: '<i>Narxlar chegirma bilan ko‘rsatilgan.</i>',
    t_wa: 'Ayollar · DEKA / Candela (aleksandrit)', t_wh: 'Ayollar · HairBoss X-Fest (diod)', t_ma: 'Erkaklar · Candela (aleksandrit)',
    sum: 'so‘m',

    branches: '📍 <b>Studiyalarimiz</b>\n\nHar kuni 10:00 dan 21:00 gacha.',
    tashkent: 'Toshkent', samarkand: 'Samarqand', landmark: 'Mo‘ljal', route: '🗺 Yo‘nalish', online: '🗓 Onlayn yozilish',

    lasers: '⚡ <b>Uchta lazer. Nol murosa.</b>\n\nBarcha apparatlar — so‘nggi modellar, o‘z sinfining eng yaxshilari.\n\n<b>I. Candela GentleLase Pro-U</b> · AQSH\nLazer epilyatsiyasining oltin standarti. Och rangli teri va qora tuklar uchun ideal, birinchi natija birinchi muolajadan keyinoq. Zamonaviy sovutish.\n\n<b>II. DEKA Motus PRO</b> · Italiya\nKo‘p funksiyali platforma: aleksandrit va neodim lazerlari. Moveo texnologiyasi va zamonaviy sovutish muolajani yumshoq va qulay qiladi.\n\n<b>III. HairBoss X-Fest</b> · Germaniya\nQulay va universal diod: barcha teri turlariga mos, yil davomida ishlaydi. Zamonaviy sovutish — faqat yengil iliqlik va sanchish.\n\nSizga qaysi apparat mosligini usta konsultatsiyada aytadi.',

    prep_pick: '📋 <b>Lazer epilyatsiyasi bo‘yicha eslatma</b>\n\nBosqichni tanlang:', b_contra: '⛔ Qarshi ko‘rsatmalar',
    contra: '⛔ <b>Qarshi ko‘rsatmalar</b>\n\nQarshi ko‘rsatma — muolajadan oldin shifokor bilan maslahatlashish uchun sabab.\n\n',
    faq_pick: '❓ <b>Ko‘p beriladigan savollar</b>',

    text_fwd: 'Rahmat! Xabaringizni administratorga yubordim — u shu yerda, Telegram’da javob beradi.',
    group_only: 'Men shaxsiy xabarlarda ishlayman. Sozlash uchun: /chatid'
  }
};

/* ---------- утилиты ---------- */
const L = (code) => (code === 'u' ? 'uz' : 'ru');
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const money = (n) => n.toLocaleString('ru-RU').replace(/ /g, ' ');
const btn = (text, data) => ({ text, callback_data: data });
const url = (text, href) => ({ text, url: href });
const tpl = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => vars[k]);

async function tg(method, body) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => ({ ok: false, description: 'bad json' }));
  if (!json.ok) console.error(`[tg] ${method}: ${json.description}`);
  return json;
}

/* Показать экран: в ответ на кнопку — редактируем сообщение, иначе — новое */
async function show(ctx, text, rows) {
  const payload = { text, parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: { inline_keyboard: rows } };
  if (ctx.messageId) {
    const r = await tg('editMessageText', { chat_id: ctx.chatId, message_id: ctx.messageId, ...payload });
    if (r.ok || /not modified/.test(r.description || '')) return;
  }
  await tg('sendMessage', { chat_id: ctx.chatId, ...payload });
}

function userLink(from) {
  const name = esc([from.first_name, from.last_name].filter(Boolean).join(' ') || 'Клиент');
  return `<a href="tg://user?id=${from.id}">${name}</a>` + (from.username ? ` (@${esc(from.username)})` : '');
}

const adminChats = () => (process.env.ADMIN_CHAT_ID || '').split(/[\s,;]+/).filter(Boolean);

async function notifyAdmins(text) {
  const chats = adminChats();
  if (!chats.length) { console.warn('[bot] ADMIN_CHAT_ID is not set, lead:\n' + text); return; }
  await Promise.all(chats.map((chat_id) => tg('sendMessage', { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true })));
}

async function askPhone(ctx) {
  const t = T[ctx.lang];
  await tg('sendMessage', {
    chat_id: ctx.chatId,
    text: t.ask_phone,
    reply_markup: {
      keyboard: [[{ text: t.b_phone, request_contact: true }], [{ text: t.b_no_phone }]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
}

/* ---------- главное меню ---------- */
function menuRows(l) {
  const t = T[L(l)];
  return [
    [btn(t.b_book, `B:${l}`)],
    [btn(t.b_prices, `m:${l}:prices`), btn(t.b_cert, `C:${l}`)],
    [btn(t.b_branches, `m:${l}:branches`), btn(t.b_lasers, `m:${l}:lasers`)],
    [btn(t.b_prep, `m:${l}:prep`), btn(t.b_faq, `m:${l}:faq`)],
    [url(t.b_admin, ADMIN_CONTACT)],
    [btn(t.b_lang, `m:${l === 'u' ? 'r' : 'u'}:menu`), url(t.b_site, SITE)]
  ];
}
const homeRow = (l) => [btn(T[L(l)].b_menu, `m:${l}:menu`)];

/* ---------- запись ----------
   Состояние: l.c.b.x.d.m.q.g.k.w
   l язык (r/u), c город (t/s), b студия (1/2/3), x для кого (w/m), d аппарат (a/k/h/x),
   m зоны — битовая маска по индексам строк прайса (hex), q нужна консультация (0/1),
   g открытый раздел зон (индекс или -), k зоны выбраны (0/1), w когда (1–4) */
const BOOK_FIELDS = ['l', 'c', 'b', 'x', 'd', 'm', 'q', 'g', 'k', 'w'];

function parseBook(str) {
  const parts = (str || '').split('.');
  const s = {};
  BOOK_FIELDS.forEach((f, i) => { s[f] = parts[i] || '-'; });
  if (s.m === '-') s.m = '0';
  if (s.q === '-') s.q = '0';
  if (s.k === '-') s.k = '0';
  // авто-шаги: в Самарканде одна студия, мужчинам — только Candela
  if (s.c === 's') s.b = '3';
  if (s.x === 'm') s.d = 'a';
  return s;
}
const packBook = (s) => BOOK_FIELDS.map((f) => s[f]).join('.');
const bookCb = (s, act) => `B:${packBook(s)}${act ? ':' + act : ''}`;

// маска до 32 зон: работаем через >>> 0, чтобы 32-й бит не делал число отрицательным
const maskOf = (s) => parseInt(s.m, 16) || 0;
const hasBit = (m, i) => ((m >>> i) & 1) === 1;
const flipBit = (m, i) => ((m ^ (1 << i)) >>> 0).toString(16);

function bookBack(s) {
  const p = { ...s };
  const resetZones = () => { p.m = '0'; p.q = '0'; p.g = '-'; };
  if (p.w !== '-') p.w = '-';
  else if (p.k === '1') p.k = '0';
  else if (p.g !== '-') p.g = '-';
  else if (p.d !== '-' && p.x !== 'm') { p.d = '-'; resetZones(); }
  else if (p.x !== '-') { p.x = '-'; p.d = '-'; resetZones(); }
  else if (p.b !== '-' && p.c !== 's') p.b = '-';
  else { p.c = '-'; p.b = '-'; }
  return p;
}

/* Прайс под выбранные «для кого» и аппарат: DEKA/Candela/«не знаю» — лист александрита, HairBoss — диод */
function bookPrices(s) {
  return LH.prices[s.x === 'm' ? 'men' : 'women'][s.d === 'h' ? 'diode' : 'alex'];
}

/* Разделы прайса в порядке листа студии; idx — индексы строк прайса */
function bookSections(s) {
  const list = bookPrices(s);
  const sheet = list.some((r) => r[4]);
  const groups = sheet ? LH.sheetGroups : LH.groups.filter((g) => g.id !== 'all');
  return groups
    .map((g) => ({
      ru: g.ru, uz: g.uz,
      idx: list.map((r, i) => ((sheet ? r[4] : LH.zones[r[0]].g) === g.id ? i : -1)).filter((i) => i >= 0)
    }))
    .filter((g) => g.idx.length);
}

function selectedZones(s) {
  const m = maskOf(s);
  return bookPrices(s).filter((_, i) => hasBit(m, i));
}

const zonesTotal = (s) => selectedZones(s).reduce((sum, r) => sum + r[2], 0);
const plain = (label) => label.replace(/^\S+\s/, ''); // без эмодзи в начале

function zonesText(s, lang) {
  const names = selectedZones(s).map((r) => LH.zones[r[0]][lang]);
  if (s.q === '1') names.push(plain(T[lang].consult));
  return names.join(', ');
}

function bookSummary(s, lang) {
  const t = T[lang];
  const br = BRANCHES[s.b][lang];
  const city = BRANCHES[s.b].city === 's' ? t.city_s : t.city_t;
  const total = zonesTotal(s);
  return [
    `${t.f_branch}: <b>${city} · ${esc(br.name)}</b>, ${esc(br.addr)}`,
    `${t.f_for}: <b>${s.x === 'm' ? t.sex_m : t.sex_w}</b>`,
    `${t.f_dev}: <b>${t['dev_' + s.d]}</b>`,
    `${t.f_zones}: <b>${esc(zonesText(s, lang))}</b>`,
    total ? `${t.f_total}: <b>≈ ${money(total)} ${t.sum}</b> ${t.per_proc}` : null,
    `${t.f_when}: <b>${t['when_' + s.w]}</b>`
  ].filter(Boolean).join('\n');
}

function zonesScreen(ctx, s, t) {
  const sections = bookSections(s);
  const list = bookPrices(s);
  const m = maskOf(s);
  const picked = selectedZones(s).length + (s.q === '1' ? 1 : 0);
  const status = picked ? '\n\n' + tpl(t.book_zones_sel, { n: picked, sum: `${money(zonesTotal(s))} ${t.sum}` }) : '';
  const done = btn(t.zones_done, bookCb({ ...s, g: '-' }, 'ok'));

  // открыт раздел — все его зоны из прайса с ценами
  const open = s.g !== '-' ? sections[Number(s.g)] : null;
  if (open) {
    const rows = open.idx.map((i) => {
      const [key, , price] = list[i];
      return [btn(`${hasBit(m, i) ? '✅' : '▫️'} ${LH.zones[key][ctx.lang]} · ${money(price)}`, bookCb(s, 't' + i))];
    });
    rows.push([btn(t.b_sections, bookCb({ ...s, g: '-' })), done]);
    rows.push(homeRow(s.l));
    return show(ctx, tpl(t.book_section, { name: esc(open[ctx.lang]) }) + status, rows);
  }

  // основные разделы по два в ряд; раздел из одной зоны («Всё тело») отмечается сразу
  const entries = sections.map((sec, gi) => ({ sec, gi }));
  const sectionBtn = ({ sec, gi }) => {
    if (sec.idx.length === 1) {
      const i = sec.idx[0];
      return btn(`${hasBit(m, i) ? '✅' : '▫️'} ${LH.zones[list[i][0]][ctx.lang]} · ${money(list[i][2])}`, bookCb(s, 't' + i));
    }
    const n = sec.idx.filter((i) => hasBit(m, i)).length;
    return btn(n ? `✅ ${sec[ctx.lang]} · ${n} ›` : `${sec[ctx.lang]} ›`, bookCb({ ...s, g: String(gi) }));
  };
  const multi = entries.filter((e) => e.sec.idx.length > 1);
  const rows = [];
  for (let i = 0; i < multi.length; i += 2) rows.push(multi.slice(i, i + 2).map(sectionBtn));
  entries.filter((e) => e.sec.idx.length === 1).forEach((e) => rows.push([sectionBtn(e)]));
  rows.push([btn(`${s.q === '1' ? '✅' : '▫️'} ${plain(t.consult)}`, bookCb(s, 'q'))]);
  rows.push([done]);
  rows.push([btn(t.b_back, bookCb(s, 'back')), ...homeRow(s.l)]);
  return show(ctx, t.book_zones + status, rows);
}

async function handleBook(ctx, data) {
  const [, st, act] = data.split(':');
  let s = parseBook(st);
  ctx.lang = L(s.l);
  const t = T[ctx.lang];

  if (act === 'back') s = bookBack(s);
  if (act === 'restart') s = parseBook(s.l);
  if (act && /^t\d+$/.test(act)) s.m = flipBit(maskOf(s), Number(act.slice(1)));
  if (act === 'q') s.q = s.q === '1' ? '0' : '1';
  if (act === 'ok') {
    if (!maskOf(s) && s.q !== '1') return { alert: t.zones_need };
    s.k = '1';
    s.g = '-';
  }
  if (act === 'send') return sendBooking(ctx, s);

  const back = btn(t.b_back, bookCb(s, 'back'));
  const nav = (rows) => [...rows, [back, ...homeRow(s.l)]];

  if (s.c === '-') {
    return show(ctx, t.book_city, [
      [btn(t.city_t, bookCb({ ...s, c: 't' })), btn(t.city_s, bookCb({ ...s, c: 's', b: '3' }))],
      homeRow(s.l)
    ]);
  }
  if (s.b === '-') {
    return show(ctx, t.book_branch, nav([1, 2].map((n) => {
      const br = BRANCHES[n][ctx.lang];
      return [btn(`${br.name} · ${br.addr}`, bookCb({ ...s, b: String(n) }))];
    })));
  }
  if (s.x === '-') {
    return show(ctx, t.book_sex, nav([[btn(t.sex_w, bookCb({ ...s, x: 'w' })), btn(t.sex_m, bookCb({ ...s, x: 'm', d: 'a' }))]]));
  }
  if (s.d === '-') {
    return show(ctx, t.book_dev, nav(['a', 'k', 'h', 'x'].map((d) => [btn(t['dev_' + d], bookCb({ ...s, d }))])));
  }
  if (s.k !== '1') return zonesScreen(ctx, s, t);
  if (s.w === '-') {
    const rows = [
      [btn(t.when_1, bookCb({ ...s, w: '1' })), btn(t.when_2, bookCb({ ...s, w: '2' }))],
      [btn(t.when_3, bookCb({ ...s, w: '3' })), btn(t.when_4, bookCb({ ...s, w: '4' }))]
    ];
    if (BRANCHES[s.b].booking) rows.push([url(t.b_online, BRANCHES[s.b].booking)]);
    return show(ctx, t.book_when, nav(rows));
  }
  return show(ctx, `${t.book_check}\n\n${bookSummary(s, ctx.lang)}`, [
    [btn(t.b_send, bookCb(s, 'send'))],
    [btn(t.b_restart, bookCb(s, 'restart')), back],
    homeRow(s.l)
  ]);
}

async function sendBooking(ctx, s) {
  const t = T[ctx.lang];
  await notifyAdmins(`🆕 <b>Заявка на запись</b>\n\nКлиент: ${userLink(ctx.from)}\n${bookSummary(s, 'ru')}\nЯзык: ${ctx.lang === 'uz' ? 'узбекский' : 'русский'}`);
  await show(ctx, `${t.book_done}\n\n${bookSummary(s, ctx.lang)}`, [homeRow(s.l)]);
  await askPhone(ctx);
}

/* ---------- сертификат ----------
   Состояние: l.n.f.b — язык, номинал (1–6), формат (e/p), студия для печатного (1/2/3) */
function parseCert(str) {
  const [l = 'r', n = '-', f = '-', b = '-'] = (str || '').split('.');
  return { l, n, f, b };
}
const certCb = (s, act) => `C:${[s.l, s.n, s.f, s.b].join('.')}${act ? ':' + act : ''}`;

function certSummary(s, lang) {
  const t = T[lang];
  const lines = [
    `${t.f_nominal}: <b>${NOMINALS[s.n][lang]}</b>`,
    `${t.f_format}: <b>${s.f === 'e' ? t.fmt_e : t.fmt_p}</b>`
  ];
  if (s.f === 'p') {
    const br = BRANCHES[s.b][lang];
    lines.push(`${t.f_pickup}: <b>${esc(br.name)}</b>, ${esc(br.addr)}`);
  }
  return lines.join('\n');
}

async function handleCert(ctx, data) {
  const [, st, act] = data.split(':');
  let s = parseCert(st);
  ctx.lang = L(s.l);
  const t = T[ctx.lang];

  if (act === 'back') {
    if (s.b !== '-') s.b = '-';
    else if (s.f !== '-') s.f = '-';
    else s.n = '-';
  }
  if (act === 'send') {
    await notifyAdmins(`🎁 <b>Заказ сертификата</b>\n\nКлиент: ${userLink(ctx.from)}\n${certSummary(s, 'ru')}\nЯзык: ${ctx.lang === 'uz' ? 'узбекский' : 'русский'}`);
    await show(ctx, `${t.cert_done}\n\n${certSummary(s, ctx.lang)}`, [homeRow(s.l)]);
    return askPhone(ctx);
  }

  const back = btn(t.b_back, certCb(s, 'back'));
  const nav = (rows) => [...rows, [back, ...homeRow(s.l)]];

  if (s.n === '-') {
    return show(ctx, t.cert_intro, [
      [btn(NOMINALS[1][ctx.lang], certCb({ ...s, n: '1' })), btn(NOMINALS[2][ctx.lang], certCb({ ...s, n: '2' }))],
      [btn(NOMINALS[3][ctx.lang], certCb({ ...s, n: '3' })), btn(NOMINALS[4][ctx.lang], certCb({ ...s, n: '4' }))],
      [btn(NOMINALS[5][ctx.lang], certCb({ ...s, n: '5' })), btn(NOMINALS[6][ctx.lang], certCb({ ...s, n: '6' }))],
      homeRow(s.l)
    ]);
  }
  if (s.f === '-') {
    return show(ctx, t.cert_format, nav([[btn(t.f_e, certCb({ ...s, f: 'e' }))], [btn(t.f_p, certCb({ ...s, f: 'p' }))]]));
  }
  if (s.f === 'p' && s.b === '-') {
    return show(ctx, t.cert_pickup, nav([1, 2, 3].map((n) => {
      const br = BRANCHES[n][ctx.lang];
      return [btn(`${br.name} · ${br.addr}`, certCb({ ...s, b: String(n) }))];
    })));
  }
  return show(ctx, `${t.cert_check}\n\n${certSummary(s, ctx.lang)}`, [
    [btn(t.b_send, certCb(s, 'send'))],
    [back, ...homeRow(s.l)]
  ]);
}

/* ---------- справочные экраны ---------- */
function priceText(kind, lang) {
  const t = T[lang];
  const [sex, dev] = { wa: ['women', 'alex'], wh: ['women', 'diode'], ma: ['men', 'alex'] }[kind];
  const list = LH.prices[sex][dev];
  const out = [`💎 <b>${t['t_' + kind]}</b>`];
  let group = null;
  const groupName = (row) => {
    if (row[4]) return (LH.sheetGroups.find((g) => g.id === row[4]) || {})[lang];
    return (LH.groups.find((g) => g.id === LH.zones[row[0]].g) || {})[lang];
  };
  const rows = dev === 'diode'
    ? list.slice().sort((a, b) => LH.groups.findIndex((g) => g.id === LH.zones[a[0]].g) - LH.groups.findIndex((g) => g.id === LH.zones[b[0]].g))
    : list;
  rows.forEach((row) => {
    const g = groupName(row);
    if (g !== group) { out.push(`\n<b>${esc(g).toUpperCase()}</b>`); group = g; }
    const [key, , price, old] = row;
    out.push(`${esc(LH.zones[key][lang])} — ${old ? `<s>${money(old)}</s> ` : ''}<b>${money(price)}</b>`);
  });
  out.push('', rows.some((r) => r[3]) ? t.sale_note : '', t.prices_note);
  return out.filter((x, i, a) => !(x === '' && a[i - 1] === '')).join('\n');
}

async function handleMenu(ctx, data) {
  const [, l, screen, arg] = data.split(':');
  ctx.lang = L(l);
  const t = T[ctx.lang];
  const back = (to) => btn(t.b_back, `m:${l}:${to}`);

  switch (screen) {
    case 'prices':
      if (arg) {
        return show(ctx, priceText(arg, ctx.lang), [[btn(t.b_book, `B:${l}`)], [back('prices'), ...homeRow(l)]]);
      }
      return show(ctx, t.prices_pick, [
        [btn(t.p_wa, `m:${l}:prices:wa`)], [btn(t.p_wh, `m:${l}:prices:wh`)], [btn(t.p_ma, `m:${l}:prices:ma`)],
        homeRow(l)
      ]);

    case 'branches': {
      const lines = [t.branches];
      const rows = [];
      [1, 2, 3].forEach((n) => {
        const b = BRANCHES[n];
        const br = b[ctx.lang];
        lines.push(`\n📍 <b>${b.city === 's' ? t.samarkand : t.tashkent} · ${esc(br.name)}</b>\n${esc(br.addr)}\n${t.landmark}: ${esc(br.land)}\n📞 ${b.phone}`);
        const r = [url(`${t.route} · ${br.name}`, b.map)];
        if (b.booking) r.push(url(`${t.online} · ${br.name}`, b.booking));
        rows.push(r);
      });
      rows.push([btn(t.b_book, `B:${l}`)], homeRow(l));
      return show(ctx, lines.join('\n'), rows);
    }

    case 'lasers':
      return show(ctx, t.lasers, [[btn(t.b_book, `B:${l}`)], [btn(t.b_prices, `m:${l}:prices`)], homeRow(l)]);

    case 'prep':
      if (arg === 'contra') {
        return show(ctx, t.contra + LH.contra[ctx.lang].map((x) => '• ' + esc(x)).join('\n'), [[back('prep'), ...homeRow(l)]]);
      }
      if (arg != null) {
        const p = LH.prep[Number(arg)];
        return show(ctx, `📋 <b>${esc(p[ctx.lang])}</b>\n\n${p.items[ctx.lang].map((x) => '• ' + esc(x)).join('\n')}`, [[back('prep'), ...homeRow(l)]]);
      }
      return show(ctx, t.prep_pick, [
        ...LH.prep.map((p, i) => [btn(p[ctx.lang], `m:${l}:prep:${i}`)]),
        [btn(t.b_contra, `m:${l}:prep:contra`)],
        homeRow(l)
      ]);

    case 'faq':
      if (arg != null) {
        const f = LH.faq[Number(arg)];
        return show(ctx, `❓ <b>${esc(f.q[ctx.lang])}</b>\n\n${esc(f.a[ctx.lang])}`, [[back('faq'), ...homeRow(l)]]);
      }
      return show(ctx, t.faq_pick, [...LH.faq.map((f, i) => [btn(f.q[ctx.lang], `m:${l}:faq:${i}`)]), homeRow(l)]);

    default:
      return show(ctx, t.menu, menuRows(l));
  }
}

/* ---------- входящие сообщения ---------- */
async function handleMessage(msg) {
  const ctx = { chatId: msg.chat.id, from: msg.from || {}, lang: msg.from && msg.from.language_code === 'uz' ? 'uz' : 'ru' };
  const l = ctx.lang === 'uz' ? 'u' : 'r';
  const text = (msg.text || '').trim();

  if (/^\/chatid\b/.test(text)) {
    return tg('sendMessage', { chat_id: ctx.chatId, text: `chat_id: <code>${msg.chat.id}</code>`, parse_mode: 'HTML' });
  }
  if (msg.chat.type !== 'private') return null; // в группе админов бот молчит

  const t = T[ctx.lang];
  const removeKb = { remove_keyboard: true };

  if (msg.contact) {
    await notifyAdmins(`📱 <b>Номер телефона</b>\n\nКлиент: ${userLink(ctx.from)}\nТелефон: <b>${esc(msg.contact.phone_number)}</b>`);
    await tg('sendMessage', { chat_id: ctx.chatId, text: t.phone_thanks, reply_markup: removeKb });
    return show(ctx, t.menu, menuRows(l));
  }
  if (text === T.ru.b_no_phone || text === T.uz.b_no_phone) {
    await tg('sendMessage', { chat_id: ctx.chatId, text: t.no_phone_ok, reply_markup: removeKb });
    return show(ctx, t.menu, menuRows(l));
  }

  const start = text.match(/^\/start(?:@\w+)?(?:\s+(\S+))?/);
  const cmd = start ? (start[1] || '') : (text.match(/^\/(\w+)/) || [])[1];
  if (cmd != null) {
    const book = cmd.match(/^book(?:_([123]))?$/);
    if (book) {
      const b = book[1];
      return handleBook(ctx, `B:${l}${b ? `.${BRANCHES[b].city}.${b}` : ''}`);
    }
    if (cmd === 'cert' || cmd === 'certificate') return handleCert(ctx, `C:${l}`);
    if (cmd === 'prices') return handleMenu(ctx, `m:${l}:prices`);
    if (cmd === 'branches') return handleMenu(ctx, `m:${l}:branches`);
    return handleMenu(ctx, `m:${l}:menu`);
  }

  // свободный текст — пересылаем администраторам
  if (text) {
    await notifyAdmins(`💬 <b>Сообщение от клиента</b>\n\nКлиент: ${userLink(ctx.from)}\n\n${esc(text)}`);
    await tg('sendMessage', { chat_id: ctx.chatId, text: t.text_fwd });
  }
  return show(ctx, t.menu, menuRows(l));
}

async function handleCallback(cq) {
  const ctx = { chatId: cq.message.chat.id, messageId: cq.message.message_id, from: cq.from, lang: 'ru' };
  const data = cq.data || '';
  let res;
  try {
    if (data.startsWith('B:')) res = await handleBook(ctx, data);
    else if (data.startsWith('C:')) res = await handleCert(ctx, data);
    else res = await handleMenu(ctx, data.startsWith('m:') ? data : 'm:r:menu');
  } finally {
    await tg('answerCallbackQuery', res && res.alert
      ? { callback_query_id: cq.id, text: res.alert, show_alert: false }
      : { callback_query_id: cq.id });
  }
}

/* ---------- настройка: GET /api/bot?setup=<WEBHOOK_SECRET> ---------- */
async function setup(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const secret = process.env.WEBHOOK_SECRET;
  const results = {};
  const me = await tg('getMe', {});
  results.bot = me.ok ? { username: me.result.username, name: me.result.first_name } : me;
  results.webhook = await tg('setWebhook', {
    url: `https://${host}/api/bot`,
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true
  });
  for (const [lang, code] of [['ru', undefined], ['uz', 'uz']]) {
    const t = T[lang];
    const extra = code ? { language_code: code } : {};
    results['commands_' + lang] = await tg('setMyCommands', {
      commands: [
        { command: 'start', description: lang === 'uz' ? 'Bosh menyu' : 'Главное меню' },
        { command: 'book', description: t.b_book.replace(/^\S+\s/, '') },
        { command: 'prices', description: t.b_prices.replace(/^\S+\s/, '') },
        { command: 'cert', description: t.b_cert.replace(/^\S+\s/, '') },
        { command: 'branches', description: t.b_branches.replace(/^\S+\s/, '') }
      ],
      ...extra
    });
    results['description_' + lang] = await tg('setMyDescription', {
      description: lang === 'uz'
        ? 'Laser House — Toshkent va Samarqanddagi lazer epilyatsiyasi studiyalari. Candela, DEKA, HairBoss. Yozilish, narxlar, sovg‘a sertifikatlari.'
        : 'Laser House — студии лазерной эпиляции в Ташкенте и Самарканде. Candela, DEKA, HairBoss. Запись, цены, подарочные сертификаты.',
      ...extra
    });
    results['short_' + lang] = await tg('setMyShortDescription', {
      short_description: lang === 'uz' ? 'Lazer epilyatsiyasiga yozilish · Toshkent · Samarqand' : 'Запись на лазерную эпиляцию · Ташкент · Самарканд',
      ...extra
    });
  }
  const info = await tg('getWebhookInfo', {});
  results.webhook_info = info.ok
    ? { url: info.result.url, pending: info.result.pending_update_count, last_error: info.result.last_error_message || null }
    : info;
  // доступность админов без отправки сообщений: getChat работает, только если админ уже писал боту
  results.admins = {};
  for (const id of adminChats()) {
    const c = await tg('getChat', { chat_id: id });
    results.admins[id] = c.ok ? `ok: ${[c.result.first_name, c.result.last_name, c.result.title].filter(Boolean).join(' ')}` : c.description;
  }
  return results;
}

/* ---------- точка входа Vercel ---------- */
module.exports = async (req, res) => {
  const secret = process.env.WEBHOOK_SECRET;

  if (req.method === 'GET') {
    if (secret && req.query && req.query.setup === secret) {
      return res.status(200).json(await setup(req));
    }
    // проверка связи с админами без перенастройки вебхука; &test=1 — отправить тестовую заявку
    if (secret && req.query && req.query.check === secret) {
      const out = {};
      for (const id of adminChats()) {
        const c = await tg('getChat', { chat_id: id });
        out[id] = { reachable: c.ok ? [c.result.first_name, c.result.last_name].filter(Boolean).join(' ') : c.description };
        if (c.ok && req.query.test === '1') {
          const m = await tg('sendMessage', {
            chat_id: id,
            parse_mode: 'HTML',
            text: '🧪 <b>Тестовая заявка — проверка связи</b>\n\nТак будут приходить заявки на запись и заказы сертификатов из бота @LaserHouseuzbot. Ничего делать не нужно.'
          });
          out[id].test_sent = m.ok ? 'ok' : m.description;
        }
      }
      return res.status(200).json(out);
    }
    return res.status(200).send('Laser House bot is running');
  }
  if (req.method !== 'POST') return res.status(405).end();
  if (!secret || req.headers['x-telegram-bot-api-secret-token'] !== secret) return res.status(401).end();

  const update = req.body || {};
  try {
    if (update.callback_query) await handleCallback(update.callback_query);
    else if (update.message) await handleMessage(update.message);
  } catch (e) {
    console.error('[bot] update failed', e);
  }
  // всегда 200, иначе Telegram будет повторять апдейт
  return res.status(200).json({ ok: true });
};

module.exports._internal = { handleMessage, handleCallback, parseBook, bookBack, priceText, T };
