(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- строки, которые рендерит JS ---------- */
  const T = {
    ru: {
      from: 'от {sum}', currency: 'сум', min: 'мин', hour: 'ч', session: 'процедура',
      hint_body_all: 'Совет: «Всё тело» выйдет дешевле — экономия {sum}',
      hint_included: '«Всё тело» уже включает остальные выбранные зоны',
      other_device: 'На {device} эти же зоны — {sum}',
      dev_alex_case: 'Candela', dev_diode_case: 'HairBoss',
      men_note: 'Мужская лазерная эпиляция — на Candela GentleLase Pro-U. Цены указаны с учётом скидки.',
      no_discount: 'Без скидки', you_save: 'выгода',
      sale_note: 'Цены указаны с учётом скидки.',
      quiz: {
        alex: { name: 'Candela GentleLase Pro-U', why: 'Золотой стандарт лазерной эпиляции. Подходит для вашего типа кожи и волос, быстро обрабатывает даже большие зоны, а первые результаты видны уже после первой процедуры.' },
        deka: { name: 'DEKA Motus PRO', why: 'Итальянская платформа с александритовым и неодимовым лазерами — работает с вашим типом кожи и волос. Технология Moveo и современное охлаждение делают процедуру мягкой и комфортной.' },
        diode: { name: 'HairBoss X-Fest', why: 'Немецкий диод последней модели — подходит для вашего типа кожи и волос, работает круглый год и очень комфортен благодаря современному охлаждению.' },
        light: 'Светлые и седые волосы лазер «видит» хуже. Приходите на консультацию — мастер честно скажет, будет ли результат.'
      }
    },
    uz: {
      from: '{sum} dan', currency: 'so‘m', min: 'daq', hour: 'soat', session: 'muolaja',
      hint_body_all: 'Maslahat: «Butun tana» arzonroq — {sum} tejaysiz',
      hint_included: '«Butun tana» boshqa tanlangan zonalarni ham o‘z ichiga oladi',
      other_device: 'Shu zonalar {device} apparatida — {sum}',
      dev_alex_case: 'Candela', dev_diode_case: 'HairBoss',
      men_note: 'Erkaklar lazer epilyatsiyasi — Candela GentleLase Pro-U’da. Narxlar chegirma bilan ko‘rsatilgan.',
      no_discount: 'Chegirmasiz', you_save: 'foyda',
      sale_note: 'Narxlar chegirma bilan ko‘rsatilgan.',
      quiz: {
        alex: { name: 'Candela GentleLase Pro-U', why: 'Lazer epilyatsiyasining oltin standarti. Teringiz va tuklaringiz turiga mos keladi, katta zonalarga ham tez ishlov beradi, birinchi natija esa birinchi muolajadan keyinoq ko‘rinadi.' },
        deka: { name: 'DEKA Motus PRO', why: 'Aleksandrit va neodim lazerli italyan platformasi — teringiz va tuklaringiz turi bilan ishlaydi. Moveo texnologiyasi va zamonaviy sovutish muolajani yumshoq va qulay qiladi.' },
        diode: { name: 'HairBoss X-Fest', why: 'So‘nggi modeldagi nemis diodi — teringiz va tuklaringiz turiga mos, yil davomida ishlaydi va zamonaviy sovutish tufayli juda qulay.' },
        light: 'Och va oq tuklarni lazer yomonroq «ko‘radi». Konsultatsiyaga keling — usta natija bo‘lish-bo‘lmasligini halol aytadi.'
      }
    }
  };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* noop */ } }
  };

  let lang = store.get('lh-lang') === 'uz' ? 'uz' : 'ru';
  const t = (k) => T[lang][k];
  const fmt = (n) => n.toLocaleString('ru-RU').replace(/ /g, ' ');
  const money = (n) => fmt(n) + ' ' + t('currency');
  const tpl = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const zoneName = (k) => LH.zones[k][lang];

  /* ---------- ссылки ---------- */
  $$('.js-book').forEach((a) => { if (a.getAttribute('href') === '#') a.href = LH.links.booking; });
  $$('.js-tg').forEach((a) => { a.href = LH.links.telegram; });
  $$('.js-ig').forEach((a) => { a.href = LH.links.instagram; });

  // есть бот — запись и сертификат ведут сразу в нужный раздел бота
  if (LH.links.bot) {
    const botLink = (start) => `https://t.me/${LH.links.bot}?start=${start}`;
    $$('.js-book').forEach((a) => { a.href = botLink('book'); });
    $$('.js-cert').forEach((a) => { a.href = botLink('cert'); });
    $$('[data-bot]').forEach((a) => {
      a.href = botLink(a.dataset.bot);
      a.target = '_blank';
      a.rel = 'noopener';
      // «Позвонить» в Самарканде становится «Записаться» — берём подпись у соседних кнопок
      if (a.dataset.i18n === 'br_call') {
        a.innerHTML = $('[data-i18n="br_book"]').innerHTML;
        a.dataset.i18n = 'br_book';
      }
    });
  }

  /* ---------- i18n ---------- */
  const ruDict = {};
  $$('[data-i18n]').forEach((el) => { ruDict[el.dataset.i18n] = el.innerHTML; });

  function applyLang() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const val = lang === 'uz' ? LH.uz[key] : ruDict[key];
      if (val != null) el.innerHTML = val;
    });
    $$('.lang__btn').forEach((b) => b.classList.toggle('is-active', b.dataset.lang === lang));
    renderFrom();
    renderFilters();
    renderZones();
    renderSummary();
    renderPrep();
    renderContra();
    renderFaq();
    renderGrowth(growthShown);
    if (quiz.done) showQuizResult();
    requestAnimationFrame(updateSegs);
  }

  $$('.lang__btn').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    store.set('lh-lang', lang);
    applyLang();
  }));

  /* ---------- цены «от» ---------- */
  function minPrice(device) {
    return Math.min(...['women', 'men'].flatMap((s) => (LH.prices[s][device] || []).map((r) => r[2])));
  }
  function renderFrom() {
    $$('.js-from').forEach((el) => {
      const sum = `<b>${fmt(minPrice(el.dataset.device))}</b>`;
      el.innerHTML = lang === 'uz'
        ? `${sum} ${t('currency')} dan`
        : `от ${sum} ${t('currency')}`;
    });
  }

  /* ---------- калькулятор ---------- */
  const calc = { sex: 'women', device: 'alex', filter: 'all', selected: new Set() };
  const groupOrder = LH.groups.map((g) => g.id).filter((id) => id !== 'all');

  const currentList = () => LH.prices[calc.sex][calc.device];
  const priceMap = (sex, device) => new Map((LH.prices[sex][device] || []).map((r) => [r[0], r]));
  // прайс-листы студии (Candela / DEKA) идут со своими разделами — 5-й элемент строки
  const groupOf = (row) => row[4] || LH.zones[row[0]].g;
  const isSheet = () => currentList().some((r) => r[4]);
  const groupsFor = () => (isSheet() ? [LH.groups[0], ...LH.sheetGroups] : LH.groups);

  function renderFilters() {
    const list = currentList();
    const byKey = new Map(list.map((r) => [r[0], groupOf(r)]));
    const sel = [...calc.selected].filter((k) => byKey.has(k));
    const wrap = $('.js-filters');
    wrap.innerHTML = groupsFor()
      .filter((g) => g.id === 'all' || list.some((r) => groupOf(r) === g.id))
      .map((g) => {
        const n = g.id === 'all' ? sel.length : sel.filter((k) => byKey.get(k) === g.id).length;
        return `<button type="button" role="tab" class="filter${calc.filter === g.id ? ' is-active' : ''}" data-g="${g.id}">${g[lang]}${n ? `<sup>${n}</sup>` : ''}</button>`;
      }).join('');
    const note = $('.js-calc-note');
    note.hidden = !isSheet();
    note.textContent = calc.sex === 'men' ? t('men_note') : t('sale_note');
  }

  function fmtTime(m) {
    if (!m) return '—';
    const h = Math.floor(m / 60), r = m % 60;
    return (h ? `${h} ${t('hour')} ` : '') + (r ? `${r} ${t('min')}` : '').trim();
  }

  function renderZones() {
    let list = currentList().filter((r) => calc.filter === 'all' || groupOf(r) === calc.filter);
    const sheet = isSheet();
    if (!sheet) {
      // диод: по разделам, «Всё тело» первым
      list = list.slice().sort((a, b) => groupOrder.indexOf(groupOf(a)) - groupOrder.indexOf(groupOf(b)));
      list.sort((a, b) => (b[0] === 'body_all') - (a[0] === 'body_all'));
    }
    const groupName = (id) => (LH.sheetGroups.find((g) => g.id === id) || {})[lang];

    // прайс-лист студии — одной колонкой, как на листе
    $('.js-zones').classList.toggle('calc__list--single', sheet);
    let prevGroup = null;
    $('.js-zones').innerHTML = list.map(([key, mins, price, old, group]) => {
      const on = calc.selected.has(key);
      const complex = key === 'body_all';
      // заголовки разделов, как в прайсе студии
      const head = sheet && calc.filter === 'all' && group !== prevGroup && group !== 'complex'
        ? `<p class="zone-group">${groupName(group)}</p>` : '';
      prevGroup = group;
      return `${head}<button type="button" role="listitem" class="zone${on ? ' is-on' : ''}${complex ? ' zone--complex' : ''}" data-key="${key}" aria-pressed="${on}">
        <span class="zone__check"></span>
        <span class="zone__name">${zoneName(key)}${mins ? `<span class="zone__time">≈ ${fmtTime(mins)}</span>` : ''}</span>
        <span class="zone__price">${old ? `<s>${fmt(old)}</s>` : ''}${money(price)}</span>
      </button>`;
    }).join('');
  }

  function renderSummary() {
    const map = priceMap(calc.sex, calc.device);
    const keys = [...calc.selected].filter((k) => map.has(k));
    const total = keys.reduce((s, k) => s + map.get(k)[2], 0);
    const mins = keys.reduce((s, k) => s + map.get(k)[1], 0);

    $('.js-count-sel').textContent = keys.length;
    $('.js-sel-chips').innerHTML = keys.map((k) => `<li>${zoneName(k)}<button type="button" data-key="${k}" aria-label="×">✕</button></li>`).join('');
    $('.js-empty').hidden = keys.length > 0;
    $('.js-time').textContent = fmtTime(mins);

    const totalEl = $('.js-total');
    const newTotal = money(total);
    if (totalEl.textContent !== newTotal) {
      totalEl.textContent = newTotal;
    }

    // на мобильном итог виден в нижней панели
    const barLabel = lang === 'uz' ? LH.uz.bar_book : ruDict.bar_book;
    $('.mbar__book').textContent = keys.length ? `${barLabel} · ${fmt(total)}` : barLabel;

    // подсказки
    const hint = $('.js-hint');
    const all = map.get('body_all');
    hint.hidden = true;
    if (all && !calc.selected.has('body_all') && total > all[2]) {
      hint.textContent = tpl(t('hint_body_all'), { sum: money(total - all[2]) });
      hint.hidden = false;
    } else if (calc.selected.has('body_all') && keys.length > 1) {
      hint.textContent = t('hint_included');
      hint.hidden = false;
    }

    // сравнение с другим аппаратом
    const alt = $('.js-alt');
    alt.hidden = true;
    if (keys.length && keys.every((k) => map.get(k)[3])) {
      const old = keys.reduce((s, k) => s + map.get(k)[3], 0);
      alt.innerHTML = `${t('no_discount')}: <s>${money(old)}</s> · ${t('you_save')} <b>${money(old - total)}</b>`;
      alt.hidden = false;
      return;
    }
    const otherDev = calc.device === 'diode' ? 'alex' : 'diode';
    const other = priceMap(calc.sex, otherDev);
    if (keys.length && other.size && keys.every((k) => other.has(k))) {
      const sum = keys.reduce((s, k) => s + other.get(k)[2], 0);
      alt.innerHTML = tpl(t('other_device'), { device: t(`dev_${otherDev}_case`), sum: `<b>${money(sum)}</b>` });
      alt.hidden = false;
    }
  }

  function updateSegs() {
    $$('.seg').forEach((seg) => {
      const active = $('.seg__btn.is-active', seg);
      const thumb = $('.seg__thumb', seg);
      if (!active || !thumb) return;
      thumb.style.width = active.offsetWidth + 'px';
      thumb.style.transform = `translateX(${active.offsetLeft}px)`;
    });
  }

  function markSeg(name) {
    $$(`.seg[data-seg="${name}"] .seg__btn`).forEach((b) => b.classList.toggle('is-active', b.dataset.val === calc[name]));
  }

  function setSeg(name, val) {
    calc[name] = val;
    // мужской прайс есть только на Candela
    if (name === 'sex' && val === 'men') calc.device = 'alex';
    if (name === 'device' && val !== 'alex' && calc.sex === 'men') calc.sex = 'women';
    markSeg('sex');
    markSeg('device');
    $$('.seg[data-seg="device"] .seg__btn').forEach((b) => { b.hidden = calc.sex === 'men' && b.dataset.val !== 'alex'; });
    const list = currentList();
    if (calc.filter !== 'all' && !list.some((r) => groupOf(r) === calc.filter)) calc.filter = 'all';
    updateSegs();
    renderFilters();
    renderZones();
    renderSummary();
  }

  $$('.seg').forEach((seg) => seg.addEventListener('click', (e) => {
    const b = e.target.closest('.seg__btn');
    if (b) setSeg(seg.dataset.seg, b.dataset.val);
  }));

  $('.js-filters').addEventListener('click', (e) => {
    const b = e.target.closest('.filter');
    if (!b) return;
    calc.filter = b.dataset.g;
    renderFilters();
    renderZones();
  });

  function toggleZone(key) {
    if (calc.selected.has(key)) calc.selected.delete(key); else calc.selected.add(key);
    const btn = $(`.zone[data-key="${key}"]`);
    if (btn) {
      const on = calc.selected.has(key);
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on);
    }
    renderFilters();
    renderSummary();
  }

  $('.js-zones').addEventListener('click', (e) => {
    const z = e.target.closest('.zone');
    if (z) toggleZone(z.dataset.key);
  });
  $('.js-sel-chips').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) toggleZone(b.dataset.key);
  });
  $('.js-clear').addEventListener('click', () => {
    calc.selected.clear();
    renderFilters(); renderZones(); renderSummary();
  });

  $$('.js-goto-calc').forEach((a) => a.addEventListener('click', () => setSeg('device', a.dataset.device)));
  window.addEventListener('resize', updateSegs);

  /* ---------- тест ---------- */
  const quiz = { step: 0, answers: [], done: false, result: null };
  const steps = $$('.quiz__step');
  const backBtn = $('.js-quiz-back');

  function showStep(i) {
    quiz.step = i;
    steps.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === i));
    $('.quiz__progress span').style.width = (i / 3) * 100 + '%';
    backBtn.hidden = i === 0 || i === 3;
  }

  // Каждый аппарат подходит под любые ответы, поэтому результат выдаём по очереди,
  // чтобы ни один из трёх не остался без внимания.
  const quizOrder = ['alex', 'deka', 'diode'];
  function nextQuizDevice() {
    let i = parseInt(store.get('lh-quiz'), 10);
    if (Number.isNaN(i)) i = Math.floor(Math.random() * quizOrder.length);
    store.set('lh-quiz', String((i + 1) % quizOrder.length));
    return quizOrder[i % quizOrder.length];
  }

  function showQuizResult() {
    const r = T[lang].quiz[quiz.result];
    $('.js-quiz-name').textContent = r.name;
    $('.js-quiz-why').textContent = r.why + (quiz.answers[1] === 'light' ? ' ' + T[lang].quiz.light : '');
  }

  $$('.quiz__step .opt').forEach((o) => o.addEventListener('click', () => {
    quiz.answers[quiz.step] = o.dataset.val;
    if (quiz.step < 2) { showStep(quiz.step + 1); return; }
    quiz.result = nextQuizDevice();
    quiz.done = true;
    showQuizResult();
    showStep(3);
  }));
  backBtn.addEventListener('click', () => showStep(Math.max(0, quiz.step - 1)));
  $('.js-quiz-restart').addEventListener('click', () => { quiz.answers = []; quiz.done = false; showStep(0); });
  $('.js-quiz-go').addEventListener('click', () => setSeg('device', quiz.result));
  showStep(0);

  /* ---------- памятка ---------- */
  let prepIdx = 0;
  function renderPrep() {
    $('.js-prep-tabs').innerHTML = LH.prep.map((p, i) =>
      `<button type="button" role="tab" class="ttab${i === prepIdx ? ' is-active' : ''}" data-i="${i}" aria-selected="${i === prepIdx}"><i></i>${p[lang]}</button>`).join('');
    const p = LH.prep[prepIdx];
    $('.js-prep-panel').innerHTML = `<h3>${p[lang]}</h3><ul>${p.items[lang].map((x, i) => `<li style="animation-delay:${i * 60}ms">${x}</li>`).join('')}</ul>`;
  }
  $('.js-prep-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.ttab');
    if (!b) return;
    prepIdx = +b.dataset.i;
    renderPrep();
  });

  /* ---------- противопоказания и FAQ ---------- */
  function renderContra() {
    $('.js-contra').innerHTML = LH.contra[lang].map((x) => `<li>${x}</li>`).join('');
  }

  function renderFaq() {
    const openIdx = $$('.qa').findIndex((d) => d.open);
    $('.js-faq').innerHTML = LH.faq.map((f, i) => `
      <details class="qa"${i === (openIdx === -1 ? 0 : openIdx) ? ' open' : ''}>
        <summary>${f.q[lang]}<span class="plus"></span></summary>
        <p class="qa__a">${f.a[lang]}</p>
      </details>`).join('');
  }
  $('.js-faq').addEventListener('toggle', (e) => {
    if (!e.target.open) return;
    $$('.qa').forEach((d) => { if (d !== e.target) d.open = false; });
  }, true);

  /* ---------- график курса ---------- */
  const growthVals = [100, 78, 60, 45, 32, 22, 14, 8];
  let growthShown = false;
  function renderGrowth(show) {
    $('.js-growth').innerHTML = growthVals.map((v, i) => `
      <div class="gbar">
        <b>${v}%</b>
        <div class="gbar__col" style="height:${show ? v * 0.78 : 0}%;transition-delay:${i * 90}ms"></div>
        <span>${i + 1}${lang === 'ru' ? '-я' : '-chi'}</span>
      </div>`).join('');
  }

  /* ---------- шапка, меню, навигация ---------- */
  const header = $('.header');
  const mbar = $('.mbar');
  const hero = $('.hero');
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    mbar.classList.toggle('is-visible', y > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('.burger');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    $('.mobile-menu').setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('.mobile-menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  const navLinks = $$('.nav a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach((s) => spy.observe(s));

  /* ---------- появление при скролле ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const sibs = $$(':scope > .reveal', el.parentElement);
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 80 + 'ms';
      el.classList.add('is-in');
      io.unobserve(el);
      if (el.classList.contains('growth') && !growthShown) {
        growthShown = true;
        requestAnimationFrame(() => $$('.gbar__col').forEach((c, i) => { c.style.height = growthVals[i] * 0.78 + '%'; }));
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- счётчики ---------- */
  const counters = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
      const start = performance.now(), dur = reduceMotion ? 1 : 1600;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * e).toFixed(dec).replace('.', ',');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counters.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.js-count').forEach((el) => counters.observe(el));

  /* ---------- старт ---------- */
  applyLang();
})();
