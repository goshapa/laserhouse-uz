/* Laser House — панель ИИ-администратора (/ai). Данные и проверки — на сервере: api/ai.js */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = $('#app');

  const BOT_URL = 'https://t.me/LaserHouseuzbot';
  const CHANNEL_NAME = { tg: 'Telegram', ig: 'Instagram' };
  const TOOL_NAME = { price_quote: 'Посчитал цену', submit_booking: 'Заявка на запись (не отправлена)', call_admin: 'Позвал администратора (не отправлено)' };

  const BLOCKS = [
    { key: 'character', title: 'Характер', where: 'Telegram и Instagram', lead: 'Как ИИ разговаривает с клиентами: тон, обращение, чего избегать.' },
    { key: 'pricing', title: 'Цены', where: 'Telegram и Instagram', lead: 'Как называть цены. Сами суммы считаются из прайса на сайте: инструмент price_quote не стоит убирать, иначе ИИ начнёт называть цены по памяти.' },
    { key: 'scope', title: 'Границы', where: 'Telegram и Instagram', lead: 'По каким студиям ИИ консультирует и что отвечает про остальные города.' },
    { key: 'tg', title: 'Инструкция для Telegram', where: 'Только Telegram', lead: 'Как вести диалог и запись в личке Telegram. Факты здесь берутся из данных сайта.' },
    { key: 'ig', title: 'Инструкция для Instagram', where: 'Только Instagram', lead: 'Как вести диалог в Директе и как пользоваться скриптом.' }
  ];
  const KEY_NAME = { ...Object.fromEntries(BLOCKS.map((b) => [b.key, b.title])), script: 'Скрипт' };
  const TABS = [['overview', 'Обзор'], ['behavior', 'Поведение'], ['script', 'Скрипт'], ['rules', 'Правила'], ['test', 'Проверка'], ['history', 'История']];

  let S = null;       // состояние с сервера
  let draft = {};     // несохранённые тексты по ключам блоков
  const ui = {
    tab: 'overview', block: 'character', section: 0, search: '', note: '',
    chat: { channel: 'tg', msgs: [], busy: false }
  };

  /* ---------- сервер ---------- */
  async function api(action, data) {
    const res = await fetch('/api/ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, ...data }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && action !== 'login') {
        const expired = !!S;
        S = null;
        renderLogin(expired ? 'Сессия закончилась, войдите заново.' : '');
      }
      throw Object.assign(new Error(json.error || 'Нет связи с сервером. Попробуйте ещё раз.'), { status: res.status });
    }
    return json;
  }
  /* действие с кнопки: ошибка показывается всплывающим сообщением */
  async function act(fn, okText) {
    try {
      const r = await fn();
      if (okText) toast(okText);
      return r;
    } catch (e) {
      if (e.status !== 401) toast(e.message, true);
      return null;
    }
  }

  let toastTimer;
  function toast(text, isErr) {
    const t = $('#toast');
    t.textContent = text;
    t.className = 'p-toast' + (isErr ? ' is-err' : '');
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, isErr ? 6000 : 2800);
  }

  function ask({ title, text, ok = 'Подтвердить', danger }) {
    const d = $('#dialog');
    d.className = 'p-dialog';
    d.innerHTML = `<h3>${esc(title)}</h3><p>${esc(text)}</p><div class="p-actions">
      <button class="btn btn--ghost btn--sm" data-no>Отмена</button>
      <button class="btn ${danger ? 'btn--ghost' : 'btn--primary'} btn--sm" data-yes>${esc(ok)}</button></div>`;
    d.showModal();
    return new Promise((resolve) => {
      const done = (v) => { d.close(); resolve(v); };
      $('[data-no]', d).onclick = () => done(false);
      $('[data-yes]', d).onclick = () => done(true);
      d.oncancel = () => resolve(false);
    });
  }

  const fmtDate = (iso) => new Date(iso).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  const logo = '<a href="https://laserhouse.uz" class="logo" aria-label="Laser House"><svg class="logo__mark" aria-hidden="true"><use href="#i-diamond"/></svg><span class="logo__text"><b>LASER HOUSE</b><small>ии-администратор</small></span></a>';

  /* ---------- черновик ---------- */
  const valueOf = (key) => (key in draft ? draft[key] : S.prompts[key]);
  const dirtyKeys = () => Object.keys(draft).filter((k) => draft[k].trim() !== S.prompts[k]);
  function setDraft(key, value) {
    if (value === S.prompts[key]) delete draft[key]; else draft[key] = value;
    refreshDirty();
  }
  const draftPayload = () => Object.fromEntries(dirtyKeys().map((k) => [k, draft[k]]));

  /* отметки «изменено» и панель сохранения обновляем точечно: перерисовка сбила бы курсор в редакторе */
  function refreshDirty() {
    const keys = dirtyKeys();
    const bar = $('.p-savebar');
    if (bar) {
      bar.classList.toggle('is-open', keys.length > 0);
      $('.p-savebar__text', bar).textContent = keys.length ? `Не сохранено: ${keys.map((k) => KEY_NAME[k]).join(', ')}` : '';
    }
    $$('[data-mark]').forEach((el) => { el.hidden = !keys.includes(el.dataset.mark); });
    const reset = $('[data-reset]');
    if (reset) reset.disabled = valueOf(reset.dataset.reset) === S.defaults[reset.dataset.reset];
    const count = $('[data-count]');
    if (count) count.textContent = `${valueOf(count.dataset.count).length.toLocaleString('ru-RU')} символов`;
  }

  async function save() {
    const values = draftPayload();
    if (!Object.keys(values).length) return;
    const btn = $('[data-save]');
    btn.disabled = true;
    const next = await act(() => api('save', { values, baseRev: S.rev, note: ui.note }), 'Сохранено. ИИ учитывает это со следующего сообщения.');
    btn.disabled = false;
    if (next) { S = next; draft = {}; ui.note = ''; render(); }
  }

  /* ---------- скрипт: разделы по заголовкам ## ---------- */
  const splitScript = (md) => md.split(/^(?=## )/m).filter((s) => s.length);
  const sectionTitle = (s) => { const m = s.match(/^##\s+(.+)/); return m ? m[1].trim() : 'Без заголовка'; };

  /* ---------- вход ---------- */
  function renderLogin(error) {
    app.innerHTML = `<div class="p-login">
      <div class="container p-login__top">${logo}</div>
      <div class="p-login__body"><div class="container">
        <div class="kicker">Панель управления</div>
        <h1>ИИ-<em>администратор</em></h1>
        <p class="p-login__lead">Здесь меняется поведение ИИ: как он общается, по какому скрипту и каким правилам отвечает клиентам. Войти могут только администраторы студии.</p>
        ${error ? `<div class="p-note p-note--warn">${esc(error)}</div>` : ''}
        <ol class="p-steps">
          <li><span>Откройте бота @LaserHouseuzbot</span></li>
          <li><span>Отправьте команду <code>/panel</code></span></li>
          <li><span>Нажмите «Открыть панель» в ответе бота</span></li>
        </ol>
        <a class="btn btn--primary" href="${BOT_URL}" target="_blank" rel="noopener">Открыть бота <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
      </div></div>
    </div>`;
  }

  /* ---------- каркас ---------- */
  function render() {
    app.innerHTML = `<header class="p-header"><div class="container p-header__inner">
        ${logo}
        <nav class="p-nav" aria-label="Разделы панели">${TABS.map(([id, name]) => `<button data-tab="${id}" class="${ui.tab === id ? 'is-active' : ''}" ${ui.tab === id ? 'aria-current="page"' : ''}>${name}</button>`).join('')}</nav>
        <div class="p-who"><span>${esc(S.me.name)}</span><button data-logout>Выйти</button></div>
      </div></header>
      <main class="p-main"><div class="container" id="view"></div></main>
      <div class="p-savebar"><div class="container p-savebar__inner">
        <span class="p-savebar__text"></span>
        <input class="p-input" data-note maxlength="200" placeholder="Что поменяли (необязательно)" aria-label="Комментарий к изменению" value="${esc(ui.note)}">
        <button class="btn btn--ghost btn--sm" data-discard>Отменить</button>
        <button class="btn btn--primary btn--sm" data-save>Сохранить</button>
      </div></div>`;

    $$('[data-tab]').forEach((b) => { b.onclick = () => go(b.dataset.tab); });
    $('[data-logout]').onclick = async () => {
      if (dirtyKeys().length && !(await ask({ title: 'Выйти без сохранения?', text: 'Несохранённые изменения пропадут.', ok: 'Выйти', danger: true }))) return;
      await act(() => api('logout'));
      S = null; draft = {};
      renderLogin();
    };
    $('[data-save]').onclick = save;
    $('[data-note]').oninput = (e) => { ui.note = e.target.value; };
    $('[data-discard]').onclick = async () => {
      if (await ask({ title: 'Отменить изменения?', text: 'Несохранённые правки пропадут.', ok: 'Отменить правки', danger: true })) { draft = {}; render(); }
    };
    VIEWS[ui.tab]($('#view'));
    refreshDirty();
  }

  function go(tab) {
    ui.tab = tab;
    history.replaceState(null, '', '#' + tab);
    window.scrollTo(0, 0);
    render();
  }

  const head = (kicker, title, lead) => `<div class="p-head"><div class="kicker">${kicker}</div><h1 class="h2">${title}</h1>${lead ? `<p>${lead}</p>` : ''}</div>`;

  /* ---------- обзор ---------- */
  function channelCard(ch) {
    const on = S.settings[ch + 'Enabled'];
    const metaOff = ch === 'ig' && S.system.igSubscription === 'off';
    const unknown = ch === 'ig' && S.system.igSubscription === 'unknown';
    const killed = !S.system.claude || S.system.killSwitch;
    let state = on ? 'Отвечает клиентам' : 'Выключен, клиентам отвечают люди';
    let cls = on ? 'is-on' : '';
    if (on && killed) { state = 'Не отвечает: нет ключа Claude или ИИ выключен на сервере'; cls = 'is-warn'; }
    else if (on && metaOff) { state = 'Не получает сообщения'; cls = 'is-warn'; }
    else if (on && unknown) { state = 'Включён, подписка в Meta не проверена'; cls = 'is-warn'; }
    const notes = {
      tg: 'Личка аккаунта @laserhouse_uz через Telegram для бизнеса. Отвечает по данным сайта и вашим правилам.',
      ig: metaOff ? 'Подписка аккаунта на сообщения в Meta выключена, поэтому Директ сюда не приходит, даже если переключатель включён. Подключается отдельно, не из панели.'
        : unknown ? 'Директ @laserhouse_uz. Отвечает по скрипту и вашим правилам. Состояние подписки в Meta сейчас не удалось проверить.'
        : 'Директ @laserhouse_uz. Отвечает по скрипту и вашим правилам.'
    };
    return `<div class="p-channel">
      <div class="p-channel__top"><h2 class="h3">${CHANNEL_NAME[ch]}</h2>
        <button class="p-switch" role="switch" aria-checked="${on}" aria-label="ИИ в ${CHANNEL_NAME[ch]}" data-toggle="${ch}"></button></div>
      <span class="p-channel__state ${cls}"><i></i>${state}</span>
      <p>${notes[ch]}</p>
    </div>`;
  }

  function viewOverview(v) {
    const active = S.rules.filter((r) => !r.off).length;
    const sections = splitScript(S.prompts.script).length;
    v.innerHTML = `${head('Обзор', 'ИИ-<em>администратор</em>', 'Всё, что ИИ говорит клиентам, настраивается здесь. Изменения начинают действовать со следующего сообщения клиента.')}
      ${!S.system.redis ? '<div class="p-note p-note--warn">База Redis не подключена, настройки не сохранятся надолго.</div>' : ''}
      <div class="p-channels">${channelCard('tg')}${channelCard('ig')}</div>
      <dl class="p-facts">
        <div class="p-fact"><dt>Версия настроек</dt><dd>№${S.rev}<small>${S.rev ? `${esc(S.by)}, ${fmtDate(S.at)}` : 'Исходные тексты'}</small></dd></div>
        <div class="p-fact"><dt>Правила</dt><dd>${active}<small>${S.rules.length - active ? `ещё ${S.rules.length - active} выключено` : 'действуют сейчас'}</small></dd></div>
        <div class="p-fact"><dt>Скрипт</dt><dd>${sections}<small>разделов, только для Instagram</small></dd></div>
        <div class="p-fact"><dt>Изменено блоков</dt><dd>${S.overridden.length}<small>из ${Object.keys(S.defaults).length}, остальные исходные</small></dd></div>
      </dl>
      <div class="p-pause">
        <b><strong>Пауза после живого ответа</strong>Если администратор сам ответил клиенту или ИИ позвал администратора, ИИ молчит в этом чате столько часов.</b>
        <input class="p-input" type="number" min="1" max="168" value="${S.settings.pauseHours}" aria-label="Пауза в часах" data-pause>
        <span class="muted">часов</span>
      </div>`;
    $$('[data-toggle]', v).forEach((b) => {
      b.onclick = async () => {
        const key = b.dataset.toggle + 'Enabled';
        const r = await act(() => api('settings', { patch: { [key]: !S.settings[key] } }), S.settings[key] ? `ИИ выключен в ${CHANNEL_NAME[b.dataset.toggle]}` : `ИИ включён в ${CHANNEL_NAME[b.dataset.toggle]}`);
        if (r) { S.settings = r.settings; render(); }
      };
    });
    $('[data-pause]', v).onchange = async (e) => {
      const r = await act(() => api('settings', { patch: { pauseHours: Number(e.target.value) } }), 'Пауза изменена');
      if (r) S.settings = r.settings; else e.target.value = S.settings.pauseHours;
    };
  }

  /* ---------- поведение ---------- */
  function viewBehavior(v) {
    const b = BLOCKS.find((x) => x.key === ui.block);
    v.innerHTML = `${head('Поведение', 'Как ИИ <em>общается</em>', 'Пишите обычными словами, как инструкцию новому сотруднику. Формат ответов и защита инструкции закреплены отдельно, сломать их здесь нельзя.')}
      <div class="p-split">
        <div class="p-side">${BLOCKS.map((x) => `<button class="p-side__item ${x.key === ui.block ? 'is-active' : ''}" data-block="${x.key}">${x.title}<i class="p-mark" data-mark="${x.key}" hidden></i><small>${x.where}</small></button>`).join('')}</div>
        <div>
          <div class="p-editor__head"><h2 class="h3">${b.title}</h2><span class="p-tag">${b.where}</span></div>
          <p class="p-editor__lead">${b.lead}</p>
          <textarea class="p-area p-area--editor" data-editor aria-label="${b.title}" spellcheck="true">${esc(valueOf(b.key))}</textarea>
          <div class="p-editor__foot"><span data-count="${b.key}"></span><button class="p-link" data-reset="${b.key}">Вернуть исходный</button></div>
        </div>
      </div>`;
    $$('[data-block]', v).forEach((x) => { x.onclick = () => { ui.block = x.dataset.block; viewBehavior(v); refreshDirty(); }; });
    $('[data-editor]', v).oninput = (e) => setDraft(b.key, e.target.value);
    $('[data-reset]', v).onclick = () => { setDraft(b.key, S.defaults[b.key]); viewBehavior(v); refreshDirty(); };
  }

  /* ---------- скрипт ---------- */
  function viewScript(v) {
    const sections = splitScript(valueOf('script'));
    if (ui.section >= sections.length) ui.section = Math.max(0, sections.length - 1);
    const q = ui.search.trim().toLowerCase();
    const items = sections.map((s, i) => ({ s, i })).filter(({ s }) => !q || s.toLowerCase().includes(q));
    const igOff = !S.settings.igEnabled || S.system.igSubscription === 'off';
    v.innerHTML = `${head('Скрипт', 'База знаний <em>для Директа</em>', 'Здесь факты, цифры и эталонные ответы. ИИ не копирует их дословно, а берёт как основу и строит разговор сам.')}
      <div class="p-note">Скрипт работает только в Instagram, в Telegram он не передаётся.${igOff ? ' Instagram сейчас не отвечает клиентам, поэтому правки подействуют, когда его подключат. Проверить их можно на вкладке «Проверка».' : ''}</div>
      <div class="p-split">
        <div class="p-side">
          <input class="p-input p-side__search" data-search type="search" placeholder="Поиск по скрипту" aria-label="Поиск по скрипту" value="${esc(ui.search)}">
          ${items.map(({ s, i }) => `<button class="p-side__item ${i === ui.section ? 'is-active' : ''}" data-section="${i}">${esc(sectionTitle(s))}</button>`).join('') || '<p class="muted" style="padding:14px 0;font-size:14px">Ничего не найдено</p>'}
          <button class="p-link p-side__add" data-add>+ Новый раздел</button>
        </div>
        <div>
          <div class="p-editor__head"><h2 class="h3" data-title>${esc(sectionTitle(sections[ui.section] || ''))}</h2><span class="p-tag">Только Instagram<i class="p-mark" data-mark="script" hidden></i></span></div>
          <p class="p-editor__lead">Заголовок раздела начинается с «## », подраздела с «### ». Фото вставляются меткой вроде [[photo:phototypes]].</p>
          <textarea class="p-area p-area--editor" data-editor aria-label="Текст раздела">${esc(sections[ui.section] || '')}</textarea>
          <div class="p-editor__foot"><span data-count="script"></span><span class="p-actions">
            <button class="p-link p-link--danger" data-del ${sections.length < 2 ? 'disabled' : ''}>Удалить раздел</button>
            <button class="p-link" data-reset="script">Вернуть исходный скрипт</button></span></div>
          ${S.openQuestions.length ? `<div class="p-questions"><span class="p-label">Вопросы без ответа студии</span><ul>${S.openQuestions.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
        </div>
      </div>`;

    const rerender = () => { viewScript(v); refreshDirty(); };
    $$('[data-section]', v).forEach((x) => { x.onclick = () => { ui.section = Number(x.dataset.section); rerender(); }; });
    const search = $('[data-search]', v);
    search.oninput = (e) => {
      ui.search = e.target.value;
      rerender();
      const again = $('[data-search]', v);
      again.focus();
      again.setSelectionRange(again.value.length, again.value.length);
    };
    $('[data-editor]', v).oninput = (e) => {
      sections[ui.section] = e.target.value;
      setDraft('script', sections.join(''));
      $('[data-title]', v).textContent = sectionTitle(e.target.value);
      const item = $(`[data-section="${ui.section}"]`, v);
      if (item) item.textContent = sectionTitle(e.target.value);
    };
    $('[data-add]', v).onclick = () => {
      const last = sections.length - 1;
      sections[last] = sections[last].replace(/\s*$/, '\n\n');
      sections.push('## Новый раздел\n\n');
      setDraft('script', sections.join(''));
      ui.section = sections.length - 1;
      ui.search = '';
      rerender();
    };
    $('[data-del]', v).onclick = async () => {
      if (!(await ask({ title: 'Удалить раздел?', text: `«${sectionTitle(sections[ui.section])}». Удаление вступит в силу после сохранения.`, ok: 'Удалить', danger: true }))) return;
      sections.splice(ui.section, 1);
      setDraft('script', sections.join(''));
      rerender();
    };
    $('[data-reset]', v).onclick = async () => {
      if (!(await ask({ title: 'Вернуть исходный скрипт?', text: 'Текст всех разделов заменится версией из файла. Изменение вступит в силу после сохранения.', ok: 'Вернуть' }))) return;
      setDraft('script', S.defaults.script);
      ui.section = 0;
      rerender();
    };
  }

  /* ---------- правила ---------- */
  const channelPill = (r) => (r.channel ? CHANNEL_NAME[r.channel] : 'Оба канала');
  const channelOptions = (cur) => [['', 'Оба канала'], ['tg', 'Только Telegram'], ['ig', 'Только Instagram']]
    .map(([id, name]) => `<option value="${id}" ${id === (cur || '') ? 'selected' : ''}>${name}</option>`).join('');

  function viewRules(v) {
    v.innerHTML = `${head('Правила', 'Быстрые <em>уточнения</em>', 'Короткие правила поверх основной инструкции: новая акция, временное изменение, частая ошибка ИИ. Действуют сразу после добавления. Это тот же список, что и команда /ai_learn в боте.')}
      <div class="p-note">В Telegram правило важнее данных сайта. В Instagram правило только дополняет скрипт: если они расходятся, ИИ послушает скрипт, поэтому там лучше поправить сам скрипт.</div>
      <form class="p-ruleform" data-add>
        <label class="p-label" for="rule-text" style="margin:0">Новое правило</label>
        <textarea class="p-area" id="rule-text" rows="3" maxlength="1000" placeholder="Например: до конца месяца при записи на всё тело дарим консультацию мастера"></textarea>
        <div class="p-actions"><select class="p-select" aria-label="Канал">${channelOptions()}</select><button class="btn btn--primary btn--sm">Добавить правило</button></div>
      </form>
      <div data-list>${S.rules.length ? S.rules.map((r, i) => `<div class="p-rule ${r.off ? 'is-off' : ''}" data-rule="${i}">
          <div class="p-rule__n">${i + 1}</div>
          <div class="p-rule__body">
            <div class="p-rule__text">${esc(r.text)}</div>
            <div class="p-rule__meta">${esc(channelPill(r))} · ${esc(r.by)}, ${esc(r.at)}${r.off ? ' · выключено' : ''}</div>
            <div class="p-rule__tools"><button class="p-link" data-edit>Изменить</button><button class="p-link p-link--danger" data-remove>Удалить</button></div>
          </div>
          <button class="p-switch" role="switch" aria-checked="${!r.off}" aria-label="Правило ${i + 1}" data-off></button>
        </div>`).join('') : '<p class="p-empty">Правил пока нет.</p>'}</div>`;

    const apply = (r) => { if (r) { S.rules = r.rules; viewRules(v); } };
    $('[data-add]', v).onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target;
      apply(await act(() => api('rule.add', { text: $('textarea', f).value, channel: $('select', f).value }), 'Правило добавлено'));
    };
    $$('[data-rule]', v).forEach((row) => {
      const i = Number(row.dataset.rule);
      const rule = S.rules[i];
      const base = { n: i + 1, expected: rule.text };
      $('[data-off]', row).onclick = async () => apply(await act(() => api('rule.update', { ...base, patch: { off: !rule.off } })));
      $('[data-remove]', row).onclick = async () => {
        if (await ask({ title: 'Удалить правило?', text: rule.text, ok: 'Удалить', danger: true })) apply(await act(() => api('rule.remove', base), 'Правило удалено'));
      };
      $('[data-edit]', row).onclick = () => {
        $('.p-rule__body', row).innerHTML = `<textarea class="p-area" rows="3" maxlength="1000" aria-label="Текст правила">${esc(rule.text)}</textarea>
          <div class="p-actions" style="margin-top:12px"><select class="p-select" aria-label="Канал">${channelOptions(rule.channel)}</select>
          <button class="btn btn--primary btn--sm" data-ok>Сохранить</button><button class="p-link" data-cancel>Отмена</button></div>`;
        $('textarea', row).focus();
        $('[data-cancel]', row).onclick = () => viewRules(v);
        $('[data-ok]', row).onclick = async () => apply(await act(() => api('rule.update', { ...base, patch: { text: $('textarea', row).value, channel: $('select', row).value } }), 'Правило изменено'));
      };
    });
  }

  /* ---------- проверка ---------- */
  function chatLog() {
    const c = ui.chat;
    if (!c.msgs.length) return '<p class="p-chat__hint">Напишите как клиент и посмотрите, что ответит ИИ</p>';
    const out = c.msgs.map((m) => {
      if (m.role === 'user') return `<div class="p-msg p-msg--user">${esc(m.content)}</div>`;
      if (m.error) return `<div class="p-msg p-msg--err">${esc(m.error)}</div>`;
      const calls = (m.calls || []).map((t) => `<div class="p-call"><b>${esc(TOOL_NAME[t.name] || t.name)}</b>${t.name === 'price_quote' ? '\n' + esc(t.result) : t.name === 'call_admin' ? `\nПричина: ${esc(t.input.reason)}\nВ настоящем чате ИИ замолчал бы на ${S.settings.pauseHours} ч.` : `\n${esc(t.input.name)}, ${esc(t.input.phone)}`}</div>`).join('');
      const parts = (m.parts || []).map((p) => (p.photo ? `<div class="p-msg p-msg--ai"><img src="${esc(p.photo)}" alt="Фото из ответа ИИ"></div>` : `<div class="p-msg p-msg--ai">${esc(p.text)}</div>`)).join('');
      return calls + (parts || '<div class="p-msg p-msg--err">ИИ не дал ответа. В настоящем чате клиент не получил бы сообщения.</div>');
    }).join('');
    return out + (c.busy ? '<div class="p-typing">ИИ печатает…</div>' : '');
  }

  function viewTest(v) {
    const c = ui.chat;
    const dirty = dirtyKeys();
    v.innerHTML = `${head('Проверка', 'Пробный <em>разговор</em>', 'Настоящий ИИ с вашими настройками, но клиентам и администраторам ничего не уходит: заявки и вызовы только показываются здесь.')}
      <div class="p-test">
        <div>
          <div class="p-seg" role="group" aria-label="Канал">${['tg', 'ig'].map((ch) => `<button data-ch="${ch}" class="${c.channel === ch ? 'is-active' : ''}">${CHANNEL_NAME[ch]}</button>`).join('')}</div>
          <div class="p-chat">
            <div class="p-chat__log" data-log aria-live="polite">${chatLog()}</div>
            <form class="p-chat__form" data-form>
              <textarea class="p-area" rows="1" placeholder="Сообщение клиента" aria-label="Сообщение клиента" ${c.busy ? 'disabled' : ''}></textarea>
              <button class="btn btn--primary" ${c.busy ? 'disabled' : ''}>Отправить</button>
            </form>
          </div>
        </div>
        <aside class="p-test__side">
          <span class="p-label">Что проверяется</span>
          <p>${dirty.length ? `Сохранённые настройки и ваш черновик: ${esc(dirty.map((k) => KEY_NAME[k]).join(', '))}. Клиенты черновик не видят.` : 'Сохранённые настройки: так ИИ отвечает клиентам сейчас.'}</p>
          <p>Каждое сообщение расходует кредиты Claude API, как обычный ответ клиенту.</p>
          <div class="p-actions">
            <button class="p-link" data-preview>Что видит ИИ</button>
            <button class="p-link" data-clear ${c.msgs.length ? '' : 'disabled'}>Начать заново</button>
          </div>
        </aside>
      </div>`;
    const log = $('[data-log]', v);
    log.scrollTop = log.scrollHeight;
    log.addEventListener('load', () => { log.scrollTop = log.scrollHeight; }, true); // фото подгружается позже текста
    const input = $('[data-form] textarea', v);
    if (!c.busy) input.focus({ preventScroll: true });

    $$('[data-ch]', v).forEach((b) => { b.onclick = () => { if (c.busy || c.channel === b.dataset.ch) return; c.channel = b.dataset.ch; c.msgs = []; viewTest(v); }; });
    $('[data-clear]', v).onclick = () => { c.msgs = []; viewTest(v); };
    $('[data-preview]', v).onclick = async () => {
      const r = await act(() => api('preview', { channel: c.channel, draft: draftPayload() }));
      if (!r) return;
      const d = $('#dialog');
      d.className = 'p-dialog p-dialog--wide';
      d.innerHTML = `<h3>Что видит ИИ в ${CHANNEL_NAME[c.channel]}</h3><p>Полная инструкция вместе с закреплёнными частями, данными и правилами: ${r.text.length.toLocaleString('ru-RU')} символов.</p><pre>${esc(r.text)}</pre><div class="p-actions"><button class="btn btn--ghost btn--sm" data-close>Закрыть</button></div>`;
      d.showModal();
      $('[data-close]', d).onclick = () => d.close();
    };
    input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('[data-form]', v).requestSubmit(); } };
    $('[data-form]', v).onsubmit = async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || c.busy) return;
      const history = c.msgs.filter((m) => !m.error && m.content).map((m) => ({ role: m.role, content: m.content }));
      c.msgs.push({ role: 'user', content: text });
      c.busy = true;
      if (ui.tab === 'test') viewTest(v);
      try {
        const r = await api('test', { channel: c.channel, history, text, draft: draftPayload() });
        c.msgs.push({ role: 'assistant', content: r.answer, parts: r.parts, calls: r.calls });
      } catch (err) {
        c.msgs.push({ role: 'assistant', error: err.message });
      }
      c.busy = false;
      if (S && ui.tab === 'test') viewTest($('#view'));
    };
  }

  /* ---------- история ---------- */
  function viewHistory(v) {
    const names = (changed) => changed.map((k) => KEY_NAME[k] || k).join(', ');
    const rows = S.log.map((e) => `<div class="p-ver"><div class="p-ver__n">№${e.rev}</div>
        <div>${esc(names(e.changed))}${e.note ? ` — ${esc(e.note)}` : ''}<small>${esc(e.by)}, ${fmtDate(e.at)}</small></div>
        ${e.rev === S.rev ? '<span class="p-tag">Сейчас</span>' : `<button class="p-link" data-restore="${e.rev}">Вернуть</button>`}
      </div>`).join('');
    const oldest = S.log.length ? S.log[S.log.length - 1].rev : 0;
    v.innerHTML = `${head('История', 'Версии <em>настроек</em>', 'Каждое сохранение поведения и скрипта становится версией, к любой можно вернуться. Хранятся последние 30. Правила и переключатели в историю не входят.')}
      ${rows}
      <div class="p-ver"><div class="p-ver__n">№0</div><div>Исходная версия<small>Тексты из кода сайта${oldest > 1 ? ', более старые версии уже удалены' : ''}</small></div>
      ${S.rev === 0 ? '<span class="p-tag">Сейчас</span>' : '<button class="p-link" data-restore="0">Вернуть</button>'}</div>`;
    $$('[data-restore]', v).forEach((b) => {
      b.onclick = async () => {
        const rev = Number(b.dataset.restore);
        const lost = dirtyKeys().length ? ' Несохранённые правки пропадут.' : '';
        if (!(await ask({ title: `Вернуть версию №${rev}?`, text: `ИИ начнёт отвечать по этой версии со следующего сообщения. Текущая версия останется в истории.${lost}`, ok: 'Вернуть' }))) return;
        const next = await act(() => api('restore', { rev, baseRev: S.rev }), `Версия №${rev} снова действует`);
        if (next) { S = next; draft = {}; render(); }
      };
    });
  }

  const VIEWS = { overview: viewOverview, behavior: viewBehavior, script: viewScript, rules: viewRules, test: viewTest, history: viewHistory };

  window.addEventListener('beforeunload', (e) => { if (S && dirtyKeys().length) e.preventDefault(); });

  /* ---------- старт: одноразовая ссылка из бота или действующая сессия ---------- */
  (async function start() {
    app.innerHTML = '<div class="p-loading">Laser House</div>';
    const hash = location.hash.slice(1);
    const login = hash.match(/^login=([\w-]+)$/);
    // токен сразу убираем из адресной строки и истории браузера
    if (login) history.replaceState(null, '', location.pathname);
    else if (TABS.some(([id]) => id === hash)) ui.tab = hash;
    try {
      S = login ? await api('login', { token: login[1] }) : await api('state');
      render();
    } catch (e) {
      if (login) return renderLogin(e.message);
      if (e.status !== 401) renderLogin(e.message);
    }
  })();
})();
