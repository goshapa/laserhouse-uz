/* Laser House — вход в панель /ai. Паролей нет: админ пишет боту /panel и получает одноразовую ссылку,
   ссылка меняется на сессию в HttpOnly-cookie. В Redis лежат только хэши токенов. */
'use strict';

const crypto = require('crypto');
const store = require('./_store');

const LOGIN_TTL = 600;             // 10 минут
const SESSION_TTL = 14 * 24 * 3600; // 2 недели
const COOKIE = 'lh_panel';

const hash = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');
const newToken = () => crypto.randomBytes(32).toString('base64url');
const loginKey = (h) => `panel:login:${h}`;
const sessionKey = (h) => `panel:sess:${h}`;

async function issueLogin(admin) {
  const token = newToken();
  await store.set(loginKey(hash(token)), admin, LOGIN_TTL);
  return token;
}

/* ссылка срабатывает один раз: once атомарно отсекает повторное открытие */
async function redeemLogin(token) {
  if (typeof token !== 'string' || token.length > 100) return null;
  const h = hash(token);
  const admin = await store.get(loginKey(h));
  if (!admin || !(await store.once(`panel:used:${h}`, LOGIN_TTL))) return null;
  await store.del(loginKey(h));
  const sess = newToken();
  await store.set(sessionKey(hash(sess)), admin, SESSION_TTL);
  return { admin, cookie: cookieHeader(sess, SESSION_TTL) };
}

const cookieHeader = (value, maxAge) => `${COOKIE}=${value}; Path=/api/ai; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

function readCookie(req) {
  const m = String(req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([\\w-]+)`));
  return m ? m[1] : null;
}

async function current(req) {
  const sess = readCookie(req);
  return sess ? store.get(sessionKey(hash(sess))) : null;
}

async function logout(req) {
  const sess = readCookie(req);
  if (sess) await store.del(sessionKey(hash(sess)));
  return cookieHeader('', 0);
}

module.exports = { issueLogin, redeemLogin, current, logout };
