/* Laser House — маленькое хранилище для ИИ-агента: история диалогов, пауза после ответа человека,
   защита от повторной доставки вебхуков.
   Если подключён Upstash Redis (Vercel → Storage → Upstash), данные живут в нём:
     KV_REST_API_URL / KV_REST_API_TOKEN  или  UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
   Без него — память процесса: работает, но история теряется при холодном старте функции. */
'use strict';

const mem = new Map(); // key -> { v, exp }

function redisConf() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

async function redis(cmd) {
  const c = redisConf();
  const res = await fetch(c.url, {
    method: 'POST',
    headers: { authorization: `Bearer ${c.token}`, 'content-type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  const json = await res.json();
  if (json.error) throw new Error('redis: ' + json.error);
  return json.result;
}

function memGet(key) {
  const e = mem.get(key);
  if (!e) return null;
  if (e.exp && e.exp < Date.now()) { mem.delete(key); return null; }
  return e.v;
}

async function get(key) {
  if (!redisConf()) return memGet(key);
  const v = await redis(['GET', key]);
  return v == null ? null : JSON.parse(v);
}

async function set(key, value, ttlSec) {
  if (!redisConf()) { mem.set(key, { v: value, exp: ttlSec ? Date.now() + ttlSec * 1000 : 0 }); return; }
  await redis(ttlSec ? ['SET', key, JSON.stringify(value), 'EX', ttlSec] : ['SET', key, JSON.stringify(value)]);
}

async function del(key) {
  if (!redisConf()) { mem.delete(key); return; }
  await redis(['DEL', key]);
}

/* true — ключ занят впервые (обрабатываем), false — уже видели (повтор вебхука) */
async function once(key, ttlSec) {
  if (!redisConf()) {
    if (memGet(key)) return false;
    mem.set(key, { v: 1, exp: Date.now() + ttlSec * 1000 });
    return true;
  }
  return (await redis(['SET', key, '1', 'NX', 'EX', ttlSec])) === 'OK';
}

module.exports = { get, set, del, once, persistent: () => !!redisConf() };
