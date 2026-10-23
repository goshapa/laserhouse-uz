/**
 * Laser House — реестр подарочных сертификатов в Google Таблице.
 * Бот @LaserHouseuzbot обращается сюда как к веб-приложению.
 *
 * Установка:
 *  1. Создайте Google Таблицу → Расширения → Apps Script → вставьте этот код целиком.
 *  2. Впишите SECRET (тот же, что в переменной SHEETS_SECRET у бота).
 *  3. Развернуть → Новое развёртывание → Тип «Веб-приложение»,
 *     «Запуск от имени»: Я, «У кого есть доступ»: Все → Развернуть → разрешить доступ.
 *  4. Ссылку веб-приложения (…/exec) пропишите боту в SHEETS_URL.
 *
 * Без верного SECRET скрипт ничего не отдаёт и не меняет.
 */
const SECRET = 'PASTE_SECRET_HERE';
const SHEET_NAME = 'Сертификаты';
const HEAD = [
  'Код', 'Номинал', 'Остаток', 'Статус', 'Покупатель', 'Телефон', 'Получатель',
  'Формат', 'Студия', 'Выдан', 'Действует до', 'Кто выдал', 'История', 'Telegram ID покупателя', 'Заказ'
];
const COL = { code: 0, nominal: 1, balance: 2, status: 3, buyer: 4, phone: 5, recipient: 6, format: 7, branch: 8, issued: 9, expires: 10, issuedBy: 11, history: 12, buyerTg: 13, order: 14 };

function doGet() {
  return out({ ok: true, result: 'Laser House certificates' });
}

function doPost(e) {
  let req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return out({ ok: false, error: 'bad json' });
  }
  if (!req || req.secret !== SECRET || SECRET === 'PASTE_SECRET_HERE') return out({ ok: false, error: 'forbidden' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // операции идут по очереди — два админа не испортят остаток
  try {
    return out({ ok: true, result: handle(req) });
  } catch (err) {
    return out({ ok: false, error: String((err && err.message) || err) });
  } finally {
    lock.releaseLock();
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold');
  }
  return sh;
}

function readRows(sh) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, HEAD.length).getValues();
}

function iso(v) {
  return v instanceof Date ? v.toISOString() : String(v || '');
}

function toObj(r, i) {
  return {
    row: i + 2,
    code: String(r[COL.code]),
    nominal: r[COL.nominal],
    balance: r[COL.balance],
    status: String(r[COL.status]),
    buyer: String(r[COL.buyer]),
    phone: String(r[COL.phone]),
    recipient: String(r[COL.recipient]),
    format: String(r[COL.format]),
    branch: String(r[COL.branch]),
    issued: iso(r[COL.issued]),
    expires: iso(r[COL.expires]),
    issuedBy: String(r[COL.issuedBy]),
    history: String(r[COL.history]),
    buyerTg: String(r[COL.buyerTg]),
    order: String(r[COL.order])
  };
}

function findBy(sh, col, value) {
  const want = String(value).toUpperCase();
  const rows = readRows(sh);
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][col]).toUpperCase() === want) return toObj(rows[i], i);
  }
  return null;
}

function handle(req) {
  const sh = getSheet();
  switch (req.action) {
    case 'ping':
      return 'pong';

    case 'get':
      return findBy(sh, COL.code, req.code);

    case 'create': {
      const c = req.cert;
      if (c.order) {
        const existing = findBy(sh, COL.order, c.order);
        if (existing) return { existing: existing };
      }
      if (findBy(sh, COL.code, c.code)) return { duplicate: true };
      sh.appendRow([
        c.code, c.nominal, c.balance, c.status, c.buyer,
        c.phone ? "'" + c.phone : '', c.recipient || '', c.format, c.branch || '',
        new Date(c.issued), new Date(c.expires), c.issuedBy, c.history,
        c.buyerTg ? "'" + c.buyerTg : '', c.order || ''
      ]);
      return { created: findBy(sh, COL.code, c.code) };
    }

    case 'update': {
      const c = findBy(sh, COL.code, req.code);
      if (!c) return null;
      // защита от одновременных правок: меняем, только если статус и остаток не изменились
      if (req.expectStatus && c.status !== req.expectStatus) return { conflict: c };
      if (req.expectBalance !== undefined && String(c.balance) !== String(req.expectBalance)) return { conflict: c };
      if (req.balance !== undefined) sh.getRange(c.row, COL.balance + 1).setValue(req.balance);
      if (req.status) sh.getRange(c.row, COL.status + 1).setValue(req.status);
      if (req.historyLine) sh.getRange(c.row, COL.history + 1).setValue((c.history ? c.history + '\n' : '') + req.historyLine);
      return { updated: findBy(sh, COL.code, req.code) };
    }

    case 'list':
      return readRows(sh).map(toObj).slice(-(req.limit || 10)).reverse();

    case 'byBuyer':
      return readRows(sh).map(toObj).filter(function (c) { return c.buyerTg === String(req.tg); }).reverse();

    default:
      throw new Error('unknown action ' + req.action);
  }
}
