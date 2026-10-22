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
      dev_alex_case: 'александрите', dev_diode_case: 'диоде',
      quiz: {
        alex: { name: 'Александрит Candela', why: 'Светлая кожа и тёмные волосы — идеальная пара для александрита. Первые результаты уже после первой процедуры, а большие зоны — ноги, руки, спина — обрабатываются очень быстро.' },
        diode: { name: 'Диод HairBoss X-Fest', why: 'Диод безопасен для любого фототипа, включая смуглую и загорелую кожу, работает круглый год и очень комфортен благодаря системе охлаждения. А ещё он выгоднее по цене.' },
        light: 'Светлые и седые волосы лазер «видит» хуже. Приходите на консультацию — мастер честно скажет, будет ли результат.'
      }
    },
    uz: {
      from: '{sum} dan', currency: 'so‘m', min: 'daq', hour: 'soat', session: 'muolaja',
      hint_body_all: 'Maslahat: «Butun tana» arzonroq — {sum} tejaysiz',
      hint_included: '«Butun tana» boshqa tanlangan zonalarni ham o‘z ichiga oladi',
      other_device: 'Shu zonalar {device}da — {sum}',
      dev_alex_case: 'aleksandrit', dev_diode_case: 'diod',
      quiz: {
        alex: { name: 'Aleksandrit Candela', why: 'Och rangli teri va qora tuklar — aleksandrit uchun ideal juftlik. Birinchi natija birinchi muolajadan keyinoq, katta zonalar — oyoqlar, qo‘llar, orqa — juda tez ishlov beriladi.' },
        diode: { name: 'Diod HairBoss X-Fest', why: 'Diod har qanday fototip uchun, jumladan qoramtir va qoraygan teri uchun xavfsiz, yil davomida ishlaydi va sovutish tizimi tufayli juda qulay. Narxi ham hamyonbop.' },
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
    renderMarquee();
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

  /* ---------- marquee ---------- */
  function renderMarquee() {
    const track = $('.js-marquee');
    const items = LH.marquee[lang].map((w) => `<s>${w}</s><i>✕</i>`).join('');
    const block = `<span class="marquee__item">${items}<b style="color:var(--y)">LASER HOUSE</b><i>✦</i></span>`;
    track.innerHTML = block + block;
  }

  /* ---------- цены «от» ---------- */
  function minPrice(device) {
    return Math.min(...['women', 'men'].flatMap((s) => LH.prices[s][device].map((r) => r[2])));
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
  const calc = { sex: 'women', device: 'diode', filter: 'all', selected: new Set() };
  const groupOrder = LH.groups.map((g) => g.id).filter((id) => id !== 'all');

  const currentList = () => LH.prices[calc.sex][calc.device];
  const priceMap = (sex, device) => new Map(LH.prices[sex][device].map((r) => [r[0], r]));

  function renderFilters() {
    const list = currentList();
    const wrap = $('.js-filters');
    wrap.innerHTML = LH.groups
      .filter((g) => g.id === 'all' || list.some((r) => LH.zones[r[0]].g === g.id))
      .map((g) => {
        const n = g.id === 'all' ? calc.selected.size : [...calc.selected].filter((k) => LH.zones[k].g === g.id).length;
        return `<button type="button" role="tab" class="filter${calc.filter === g.id ? ' is-active' : ''}" data-g="${g.id}">${g[lang]}${n ? `<sup>${n}</sup>` : ''}</button>`;
      }).join('');
  }

  function fmtTime(m) {
    if (!m) return '—';
    const h = Math.floor(m / 60), r = m % 60;
    return (h ? `${h} ${t('hour')} ` : '') + (r ? `${r} ${t('min')}` : '').trim();
  }

  function renderZones() {
    const list = currentList()
      .filter((r) => calc.filter === 'all' || LH.zones[r[0]].g === calc.filter)
      .slice()
      .sort((a, b) => groupOrder.indexOf(LH.zones[a[0]].g) - groupOrder.indexOf(LH.zones[b[0]].g));
    // «Всё тело» всегда первым
    list.sort((a, b) => (b[0] === 'body_all') - (a[0] === 'body_all'));

    $('.js-zones').innerHTML = list.map(([key, mins, price], i) => {
      const on = calc.selected.has(key);
      const complex = key === 'body_all';
      return `<button type="button" role="listitem" class="zone${on ? ' is-on' : ''}${complex ? ' zone--complex' : ''}" data-key="${key}" aria-pressed="${on}" style="animation-delay:${Math.min(i * 18, 300)}ms">
        <span class="zone__check"></span>
        <span class="zone__name">${zoneName(key)}${mins ? `<span class="zone__time">≈ ${fmtTime(mins)}</span>` : ''}</span>
        <span class="zone__price">${money(price)}</span>
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
      totalEl.classList.remove('bump'); void totalEl.offsetWidth; totalEl.classList.add('bump');
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
    const otherDev = calc.device === 'diode' ? 'alex' : 'diode';
    const other = priceMap(calc.sex, otherDev);
    alt.hidden = true;
    if (keys.length && keys.every((k) => other.has(k))) {
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
      thumb.style.transform = `translateX(${active.offsetLeft - 5}px)`;
    });
    $('.seg--device').classList.toggle('is-alex', calc.device === 'alex');
  }

  function setSeg(name, val) {
    calc[name] = val;
    $$(`.seg[data-seg="${name}"] .seg__btn`).forEach((b) => b.classList.toggle('is-active', b.dataset.val === val));
    const list = currentList();
    if (calc.filter !== 'all' && !list.some((r) => LH.zones[r[0]].g === calc.filter)) calc.filter = 'all';
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

  function scoreQuiz([skin, hair, prio]) {
    let alex = 0, diode = 0;
    if (skin === 'light') alex += 2;
    if (skin === 'medium') { alex += 1; diode += 1; }
    if (skin === 'dark') diode += 10; // для смуглой и загорелой кожи — только диод
    if (hair === 'dark') alex += 1;
    if (prio === 'speed') alex += 2;
    if (prio === 'comfort') diode += 1;
    if (prio === 'budget') diode += 2;
    return alex > diode ? 'alex' : 'diode';
  }

  function showQuizResult() {
    const r = T[lang].quiz[quiz.result];
    $('.js-quiz-name').textContent = r.name;
    $('.js-quiz-why').textContent = r.why + (quiz.answers[1] === 'light' ? ' ' + T[lang].quiz.light : '');
  }

  $$('.quiz__step .opt').forEach((o) => o.addEventListener('click', () => {
    quiz.answers[quiz.step] = o.dataset.val;
    if (quiz.step < 2) { showStep(quiz.step + 1); return; }
    quiz.result = scoreQuiz(quiz.answers);
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

  /* ---------- свечение за курсором и 3D-сертификат ---------- */
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduceMotion) {
    const glow = $('.cursor-glow');
    let gx = 0, gy = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', (e) => { gx = e.clientX; gy = e.clientY; }, { passive: true });
    (function loop() {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    })();

    const card = $('.js-tilt');
    const zone = card.parentElement;
    zone.addEventListener('pointermove', (e) => {
      const r = zone.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(x - 0.5) * 24}deg) rotateX(${(0.5 - y) * 18}deg)`;
      card.style.setProperty('--mx', x * 100 + '%');
      card.style.setProperty('--my', y * 100 + '%');
    });
    zone.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }

  /* ---------- частицы в hero ---------- */
  const canvas = $('.hero__canvas');
  const ctx = canvas.getContext('2d');
  let parts = [], W = 0, H = 0, heroVisible = true;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, W / 18));
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3, s: Math.random() * 0.35 + 0.08,
      a: Math.random() * 0.6 + 0.15, y2: Math.random() < 0.55
    }));
  }
  function draw() {
    if (heroVisible) {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y -= p.s; p.x += Math.sin(p.y / 60) * 0.15;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.y2 ? `rgba(255,214,10,${p.a})` : `rgba(245,242,234,${p.a * 0.6})`;
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  if (!reduceMotion) {
    resize();
    window.addEventListener('resize', resize);
    new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe(hero);
    draw();
  }

  /* ---------- старт ---------- */
  applyLang();
})();
