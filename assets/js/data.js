/* Laser House — контент и прайс.
   Цены взяты из онлайн-записи Altegio (n1237691.alteg.io), октябрь 2026.
   Формат позиции: [ключ зоны, минуты, цена в сумах] */

window.LH = window.LH || {};

LH.links = {
  booking: 'https://n1237691.alteg.io/select-city/572/select-branch',
  telegram: 'https://t.me/laserhouse_uz',
  instagram: 'https://www.instagram.com/laserhouse_uz/',
  phone: '+998940000048',
  phoneLabel: '+998 94 000-00-48'
};

LH.zones = {
  body_all:         { ru: 'Всё тело',                 uz: 'Butun tana', g: 'complex' },
  face_full:        { ru: 'Лицо полностью',           uz: 'Yuz to‘liq', g: 'face' },
  lip:              { ru: 'Верхняя губа (усики)',     uz: 'Yuqori lab (mo‘ylov)', g: 'face' },
  chin:             { ru: 'Подбородок',               uz: 'Iyak', g: 'face' },
  cheeks:           { ru: 'Щёки',                     uz: 'Yonoqlar', g: 'face' },
  forehead:         { ru: 'Лоб',                      uz: 'Peshona', g: 'face' },
  sideburns:        { ru: 'Баки',                     uz: 'Chakka sochlari', g: 'face' },
  ears:             { ru: 'Уши',                      uz: 'Quloqlar', g: 'face' },
  beard:            { ru: 'Оформление бороды',        uz: 'Soqolga shakl berish', g: 'face' },
  neck_full:        { ru: 'Шея полностью',            uz: 'Bo‘yin to‘liq', g: 'face' },
  neck_front:       { ru: 'Шея спереди',              uz: 'Bo‘yinning old qismi', g: 'face' },
  neck_back:        { ru: 'Шея сзади',                uz: 'Bo‘yinning orqa qismi', g: 'face' },
  armpits:          { ru: 'Подмышки',                 uz: 'Qo‘ltiq osti', g: 'arms' },
  shoulders:        { ru: 'Плечи',                    uz: 'Yelkalar', g: 'arms' },
  arms_full:        { ru: 'Руки полностью',           uz: 'Qo‘llar to‘liq', g: 'arms' },
  arms_half:        { ru: 'Руки наполовину',          uz: 'Qo‘llar yarmi', g: 'arms' },
  arms_upper:       { ru: 'Руки выше локтя',          uz: 'Tirsakdan yuqori', g: 'arms' },
  arms_lower:       { ru: 'Руки до локтя',            uz: 'Tirsakkacha', g: 'arms' },
  hands:            { ru: 'Кисти рук',                uz: 'Qo‘l panjalari', g: 'arms' },
  fingers:          { ru: 'Пальцы рук',               uz: 'Qo‘l barmoqlari', g: 'arms' },
  chest_full:       { ru: 'Грудь полностью',          uz: 'Ko‘krak to‘liq', g: 'body' },
  decollete:        { ru: 'Декольте',                 uz: 'Dekolte', g: 'body' },
  between_breasts:  { ru: 'Между грудей',             uz: 'Ko‘krak orasi', g: 'body' },
  areolas:          { ru: 'Ареолы груди',             uz: 'Ko‘krak uchi atrofi', g: 'body' },
  belly_full:       { ru: 'Живот полностью',          uz: 'Qorin to‘liq', g: 'body' },
  line_navel_chest: { ru: 'Линия от пупка до груди',  uz: 'Kindikdan ko‘krakkacha chiziq', g: 'body' },
  line_pubis_navel: { ru: 'Линия от лобка до пупка',  uz: 'Qovdan kindikkacha chiziq', g: 'body' },
  line_pubis_chest: { ru: 'Линия от лобка до груди',  uz: 'Qovdan ko‘krakkacha chiziq', g: 'body' },
  back:             { ru: 'Спина',                    uz: 'Orqa', g: 'body' },
  lower_back:       { ru: 'Поясница',                 uz: 'Bel', g: 'body' },
  buttocks:         { ru: 'Ягодицы',                  uz: 'Dumba', g: 'body' },
  legs_full:        { ru: 'Ноги полностью',           uz: 'Oyoqlar to‘liq', g: 'legs' },
  legs_half:        { ru: 'Ноги наполовину',          uz: 'Oyoqlar yarmi', g: 'legs' },
  toes:             { ru: 'Пальцы ног',               uz: 'Oyoq barmoqlari', g: 'legs' },
  bikini_deep:      { ru: 'Бикини глубокое',          uz: 'Chuqur bikini', g: 'intim' },
  bikini_classic:   { ru: 'Бикини классическое',      uz: 'Klassik bikini', g: 'intim' },
  bikini_deep_m:    { ru: 'Интимная зона (глубокое бикини)', uz: 'Intim zona (chuqur bikini)', g: 'intim' }
};

LH.groups = [
  { id: 'all',     ru: 'Все зоны',    uz: 'Barchasi' },
  { id: 'face',    ru: 'Лицо и шея',  uz: 'Yuz va bo‘yin' },
  { id: 'arms',    ru: 'Руки',        uz: 'Qo‘llar' },
  { id: 'body',    ru: 'Тело',        uz: 'Tana' },
  { id: 'legs',    ru: 'Ноги',        uz: 'Oyoqlar' },
  { id: 'intim',   ru: 'Интим',       uz: 'Intim' },
  { id: 'complex', ru: 'Комплекс',    uz: 'Kompleks' }
];

LH.prices = {
  women: {
    diode: [
      ['body_all', 120, 1790000], ['face_full', 10, 250000], ['lip', 5, 150000], ['chin', 5, 150000],
      ['cheeks', 5, 150000], ['forehead', 5, 150000], ['sideburns', 5, 150000], ['neck_full', 20, 199999],
      ['neck_front', 10, 130000], ['neck_back', 10, 130000], ['armpits', 10, 190000], ['shoulders', 15, 260000],
      ['arms_full', 25, 340000], ['arms_half', 20, 210000], ['arms_upper', 20, 210000], ['arms_lower', 20, 210000],
      ['hands', 5, 150000], ['fingers', 5, 70000], ['chest_full', 15, 240000], ['between_breasts', 5, 150000],
      ['areolas', 10, 150000], ['belly_full', 20, 230000], ['line_navel_chest', 5, 140000], ['line_pubis_navel', 5, 120000],
      ['back', 20, 350000], ['lower_back', 10, 220000], ['buttocks', 20, 330000], ['legs_full', 30, 390000],
      ['legs_half', 25, 300000], ['toes', 5, 100000], ['bikini_deep', 20, 330000], ['bikini_classic', 20, 290000]
    ],
    alex: [
      ['body_all', 210, 2890000], ['face_full', 20, 450000], ['lip', 20, 200000], ['chin', 20, 150000],
      ['cheeks', 20, 200000], ['forehead', 20, 200000], ['sideburns', 20, 200000], ['neck_full', 20, 200000],
      ['neck_front', 20, 150000], ['neck_back', 20, 150000], ['armpits', 20, 250000], ['shoulders', 20, 300000],
      ['arms_full', 30, 490000], ['arms_upper', 30, 300000], ['arms_lower', 30, 300000], ['hands', 20, 170000],
      ['fingers', 15, 70000], ['chest_full', 30, 350000], ['decollete', 20, 200000], ['areolas', 20, 150000],
      ['belly_full', 30, 390000], ['line_navel_chest', 20, 150000], ['line_pubis_navel', 20, 150000], ['back', 30, 450000],
      ['lower_back', 20, 175000], ['buttocks', 30, 400000], ['legs_full', 40, 890000], ['legs_half', 40, 600000],
      ['toes', 20, 70000], ['bikini_deep', 30, 450000], ['bikini_classic', 30, 350000]
    ]
  },
  men: {
    diode: [
      ['body_all', 0, 2000000], ['face_full', 30, 390000], ['beard', 20, 390000], ['lip', 10, 150000],
      ['chin', 15, 180000], ['cheeks', 15, 180000], ['forehead', 10, 180000], ['sideburns', 15, 130000],
      ['ears', 20, 140000], ['neck_full', 25, 300000], ['neck_front', 15, 180000], ['neck_back', 15, 180000],
      ['armpits', 15, 250000], ['shoulders', 20, 300000], ['arms_full', 30, 400000], ['arms_upper', 20, 300000],
      ['arms_lower', 20, 300000], ['hands', 15, 200000], ['fingers', 10, 100000], ['chest_full', 30, 300000],
      ['between_breasts', 15, 200000], ['areolas', 10, 150000], ['belly_full', 25, 350000], ['line_pubis_chest', 15, 180000],
      ['line_pubis_navel', 15, 180000], ['back', 35, 450000], ['lower_back', 25, 300000], ['buttocks', 30, 450000],
      ['legs_full', 40, 480000], ['legs_half', 25, 300000], ['toes', 10, 150000], ['bikini_deep_m', 20, 400000]
    ],
    alex: [
      ['body_all', 180, 3890000], ['face_full', 20, 450000], ['lip', 20, 200000], ['chin', 80, 150000],
      ['cheeks', 20, 200000], ['forehead', 20, 200000], ['sideburns', 20, 200000], ['neck_full', 20, 200000],
      ['neck_front', 20, 150000], ['neck_back', 20, 150000], ['armpits', 20, 250000], ['shoulders', 20, 300000],
      ['arms_full', 30, 590000], ['arms_upper', 30, 300000], ['arms_lower', 30, 300000], ['hands', 20, 170000],
      ['fingers', 20, 70000], ['chest_full', 30, 390000], ['belly_full', 30, 490000], ['line_navel_chest', 20, 150000],
      ['line_pubis_navel', 20, 150000], ['back', 40, 590000], ['lower_back', 30, 175000], ['buttocks', 30, 400000],
      ['legs_full', 50, 900000], ['legs_half', 40, 600000], ['toes', 20, 70000], ['bikini_deep_m', 20, 490000]
    ]
  }
};

LH.marquee = {
  ru: ['Бритва', 'Воск', 'Шугаринг', 'Полоски', 'Кремы', 'Эпилятор'],
  uz: ['Ustara', 'Mum', 'Shugaring', 'Chiziqlar', 'Kremlar', 'Epilyator']
};

LH.prep = [
  {
    ru: 'За 2 недели', uz: '2 hafta oldin',
    items: {
      ru: ['Откажитесь от шугаринга и восковой депиляции', 'Не загорайте и не пользуйтесь автозагаром', 'Принимаете антибиотики или серьёзные препараты — уточните у врача, можно ли процедуру'],
      uz: ['Shugaring va mum depilyatsiyasidan voz keching', 'Quyoshda toblanmang va avtozagardan foydalanmang', 'Antibiotik yoki jiddiy dori ichayotgan bo‘lsangiz — muolaja mumkinligini shifokordan so‘rang']
    }
  },
  {
    ru: 'За 1–2 дня', uz: '1–2 kun oldin',
    items: {
      ru: ['Сбрейте волосы в нужных зонах — за 1–2 дня или в день процедуры', 'Именно сбрейте: не выщипывайте и не используйте воск'],
      uz: ['Kerakli zonalardagi tuklarni 1–2 kun oldin yoki muolaja kuni qirib oling', 'Aynan qirib oling: yulmang va mum ishlatmang']
    }
  },
  {
    ru: 'В день процедуры', uz: 'Muolaja kuni',
    items: {
      ru: ['Дезодорант можно до процедуры, после — нельзя', 'Без масел, кремов и спиртосодержащих лосьонов', 'Без горячего душа и бассейна', 'Исключите раздражители: тесную одежду и бельё, косметику, другие процедуры'],
      uz: ['Dezodorant muolajadan oldin mumkin, keyin — yo‘q', 'Moy, krem va spirtli loson ishlatmang', 'Issiq dush va basseyn mumkin emas', 'Tor kiyim va ichki kiyim, kosmetika va boshqa muolajalardan saqlaning']
    }
  },
  {
    ru: '2–3 дня после', uz: '2–3 kun keyin',
    items: {
      ru: ['Никаких скрабов и пилингов', 'Без бассейна', 'Без масел, кремов, лосьонов и другой косметики'],
      uz: ['Skrab va piling ishlatmang', 'Basseynga bormang', 'Moy, krem, loson va boshqa kosmetikadan foydalanmang']
    }
  },
  {
    ru: '2 недели после', uz: '2 hafta keyin',
    items: {
      ru: ['Не загорайте и не используйте автозагар', 'Без сауны', 'В жару — SPF не ниже 30', 'Появилось раздражение — средства с пантенолом'],
      uz: ['Quyoshda toblanmang va avtozagar ishlatmang', 'Saunaga bormang', 'Issiq kunlarda — kamida SPF 30', 'Qizarish bo‘lsa — pantenolli vositalar']
    }
  }
];

LH.contra = {
  ru: ['Псориаз и другие повреждения кожи', 'Беременность и лактация', 'Инфекционные заболевания кожи', 'Онкологические заболевания', 'Сахарный диабет', 'Приём тетрациклиновых антибиотиков, системных ретиноидов и стероидов', 'Аутоиммунные заболевания: красная волчанка, склеродермия, диабет 1 типа, аутоиммунный тиреоидит, рассеянный склероз, полиневрит, болезнь Аддисона, дерматомиозит, тромбоцитопеническая пурпура, витилиго, ревматоидный артрит', 'Любые заболевания в острой фазе'],
  uz: ['Psoriaz va terining boshqa shikastlanishlari', 'Homiladorlik va emizish davri', 'Terining yuqumli kasalliklari', 'Onkologik kasalliklar', 'Qandli diabet', 'Tetratsiklin guruhi antibiotiklari, tizimli retinoidlar va steroidlar qabul qilish', 'Autoimmun kasalliklar: qizil yuguruk, sklerodermiya, 1-tur diabet, autoimmun tireoidit, tarqoq skleroz, polinevrit, Addison kasalligi, dermatomiozit, trombotsitopenik purpura, vitiligo, revmatoid artrit', 'O‘tkir bosqichdagi har qanday kasallik']
};

LH.faq = [
  {
    q: { ru: 'Когда будет заметен результат?', uz: 'Natija qachon seziladi?' },
    a: {
      ru: 'Через 1,5–3 недели после процедуры. Чем темнее волос, тем быстрее видно, что волос стало меньше и растут они медленнее. Лазер разрушает только фолликулы в фазе активного роста — «спящие» волоски он не видит. С каждой процедурой они просыпаются, и к концу курса остаются лишь редкие мягкие светлые волоски.',
      uz: 'Muolajadan 1,5–3 hafta o‘tib. Tuk qanchalik qora bo‘lsa, ular kamayib, sekin o‘sayotgani shunchalik tez seziladi. Lazer faqat faol o‘sish bosqichidagi follikulalarni yo‘q qiladi — «uxlayotgan» tuklarni u ko‘rmaydi. Har bir muolaja bilan ular uyg‘onadi va kurs oxiriga kelib faqat siyrak, yumshoq va och rangli tukchalar qoladi.'
    }
  },
  {
    q: { ru: 'Сколько процедур понадобится?', uz: 'Nechta muolaja kerak bo‘ladi?' },
    a: {
      ru: 'В среднем 6–10 процедур с интервалом 3–6 недель. Лазерная эпиляция делается только курсом: нужно «поймать» все волны роста волос. После каждой процедуры мастер оценивает, как уходят волосы, и говорит, сколько осталось. После курса — 1–2 поддерживающие процедуры раз в полгода-год.',
      uz: 'O‘rtacha 3–6 hafta oraliq bilan 6–10 muolaja. Lazer epilyatsiyasi faqat kurs bilan qilinadi: tuklar o‘sishining barcha to‘lqinlarini «ushlash» kerak. Har muolajadan keyin usta natijani baholab, yana nechta qolganini aytadi. Kursdan so‘ng — yarim yilda-yilda 1–2 ta qo‘llab-quvvatlovchi muolaja.'
    }
  },
  {
    q: { ru: 'Это больно?', uz: 'Bu og‘riqlimi?' },
    a: {
      ru: 'Обычно страшнее ожидание, чем сама процедура. На диодном HairBoss X-Fest ощущается лёгкое тепло и покалывание — работает система охлаждения. Candela подаёт холод (криоохлаждение DCD) перед каждым импульсом. Мастер всё время уточняет ваши ощущения и подбирает параметры.',
      uz: 'Odatda muolajaning o‘zidan ko‘ra uni kutish qo‘rqinchliroq. Diodli HairBoss X-Fest’da sovutish tizimi tufayli faqat yengil iliqlik va sanchish seziladi. Candela har bir impulsdan oldin sovuq beradi (DCD krio-sovutish). Usta doimo his-tuyg‘ularingizni so‘rab, parametrlarni moslaydi.'
    }
  },
  {
    q: { ru: 'Когда лучше начинать курс?', uz: 'Kursni qachon boshlagan ma’qul?' },
    a: {
      ru: 'Идеально — осенью: в холода проще защищать кожу от солнца, а к лету курс будет закончен. Но начать можно и весной, и летом — главное SPF не ниже 30 на открытые зоны и никакого активного солнца за неделю до и после процедуры.',
      uz: 'Ideal vaqt — kuz: sovuqda terini quyoshdan himoya qilish osonroq, yozga kelib esa kurs tugaydi. Lekin bahor va yozda ham boshlash mumkin — asosiysi ochiq zonalarga kamida SPF 30 surting va muolajadan bir hafta oldin va keyin quyoshda toblanmang.'
    }
  },
  {
    q: { ru: 'Можно ли загорать и ехать в отпуск во время курса?', uz: 'Kurs davomida quyoshda toblanish va ta’tilga chiqish mumkinmi?' },
    a: {
      ru: 'Можно. Загорать — не раньше чем через 7–10 дней после процедуры, неделю мажьте зоны пантенолом. В отпуске: SPF 30+ на тело и 50+ на лицо, загар по 15–20 минут, без солнца с 12:00 до 16:00. После возвращения дайте коже отдохнуть 10–14 дней, а если краснота от загара не сошла — перенесите процедуру на 3–5 дней.',
      uz: 'Mumkin. Quyoshda toblanish — muolajadan kamida 7–10 kun o‘tib, bir hafta davomida zonalarga pantenol surting. Ta’tilda: tanaga SPF 30+, yuzga SPF 50+, 15–20 daqiqadan toblaning, 12:00 dan 16:00 gacha quyoshga chiqmang. Qaytgach teriga 10–14 kun dam bering, qizarish ketmagan bo‘lsa — muolajani 3–5 kunga suring.'
    }
  },
  {
    q: { ru: 'Покраснение или «крапивница» после процедуры — это ожог?', uz: 'Muolajadan keyingi qizarish yoki «toshma» — bu kuyishmi?' },
    a: {
      ru: 'Чаще всего нет. Это нормальная фолликулярная реакция кожи на лазер — особенно в зонах с плотными и жёсткими волосами: бикини, подмышки, ноги. Она говорит о том, что фолликул получил нужное воздействие, и обычно проходит сама за несколько дней. Если что-то беспокоит — напишите нам.',
      uz: 'Ko‘pincha yo‘q. Bu terining lazerga normal follikulyar reaksiyasi — ayniqsa qalin va dag‘al tukli zonalarda: bikini, qo‘ltiq osti, oyoqlar. Bu follikula kerakli ta’sirni olganini bildiradi va odatda bir necha kunda o‘zi o‘tib ketadi. Biror narsa bezovta qilsa — bizga yozing.'
    }
  },
  {
    q: { ru: 'Можно ли делать эпиляцию во время поста (уразы)?', uz: 'Ro‘za paytida epilyatsiya qilish mumkinmi?' },
    a: {
      ru: 'Да. Лазерная эпиляция — внешняя косметологическая процедура и не нарушает пост. Проходит комфортно, быстро и безопасно.',
      uz: 'Ha. Lazer epilyatsiyasi — tashqi kosmetologik muolaja va ro‘zani buzmaydi. U qulay, tez va xavfsiz o‘tadi.'
    }
  },
  {
    q: { ru: 'Я прервала курс. Придётся начинать сначала?', uz: 'Kursni to‘xtatib qo‘ydim. Boshidan boshlash kerakmi?' },
    a: {
      ru: 'Нет. Может показаться, что волосы вернулись — это проснулись «спящие» фолликулы, а после 3–4 процедур иногда бывает эффект гиперкомпенсации. Курс нужно просто возобновить: сначала его никто не начинает, хотя количество процедур может немного вырасти.',
      uz: 'Yo‘q. Tuklar qaytgandek tuyulishi mumkin — bu «uxlayotgan» follikulalar uyg‘ongani, 3–4 muolajadan keyin esa ba’zan giperkompensatsiya effekti bo‘ladi. Kursni shunchaki davom ettirish kerak: boshidan boshlanmaydi, lekin muolajalar soni biroz oshishi mumkin.'
    }
  },
  {
    q: { ru: 'Диод или александрит — что выбрать?', uz: 'Diod yoki aleksandrit — qaysi birini tanlash kerak?' },
    a: {
      ru: 'Лучший лазер — тот, который подходит именно вашей коже и волосам. Александрит Candela — эталон для светлой кожи и тёмных волос с быстрым результатом. Диод HairBoss — универсальный и комфортный, подходит и для смуглой, и для загорелой кожи. Пройдите наш тест выше или спросите мастера на консультации.',
      uz: 'Eng yaxshi lazer — aynan sizning teringiz va tuklaringizga mos keladigani. Candela aleksandriti — och rangli teri va qora tuklar uchun tez natija beruvchi etalon. HairBoss diodi — universal va qulay, qoramtir va qoraygan teriga ham mos. Yuqoridagi testdan o‘ting yoki konsultatsiyada ustadan so‘rang.'
    }
  }
];

/* Переводы интерфейса. Русский текст берётся прямо из HTML. */
LH.uz = {
  nav_lasers: 'Lazerlar', nav_prices: 'Narxlar', nav_course: 'Kurs', nav_prep: 'Tayyorgarlik', nav_faq: 'Savollar', nav_branches: 'Filiallar',
  cta_book: 'Yozilish',
  hero_eyebrow: 'Lazer epilyatsiyasi studiyalari tarmog‘i · Toshkent',
  hero_title_html: '<span class="line">Ustarani</span><span class="line"><span class="strike">unuting</span><span class="dot">.</span></span>',
  hero_sub: 'Asl tibbiy lazerlar Candela (AQSH) va HairBoss X-Fest (Germaniya), tajribali ustalar va teringizga mos apparatni halol tanlash. Dam olish kunlarisiz, 10:00 dan 21:00 gacha.',
  hero_book: 'Onlayn yozilish', hero_tg: 'Telegram’da yozish',
  stat_followers: 'Instagram’da obunachilar', stat_studios: 'Toshkentda studiyalar', stat_days: 'kun haftasiga, 10–21', stat_course: 'muolaja — to‘liq kurs',
  chip_alex: 'Aleksandrit · AQSH', chip_diode: 'Diod · Germaniya', chip_cool: 'Har bir impulsda sovutish',
  bye_kicker: 'Hayr, qiynoqlar',
  bye_title_html: 'Hammasi uchun rahmat.<br>Lekin endi sizga <em>ehtiyoj yo‘q</em>.',
  bye_razor: 'Ustara', bye_razor_t: '2 kunda tikanli tuklar va qichishish',
  bye_wax: 'Mum', bye_wax_t: 'Og‘riqli va 3–4 haftada yana boshidan',
  bye_sugar: 'Shugaring', bye_sugar_t: 'Teriga botib o‘sgan tuklar va cheksiz yozilishlar',
  bye_cream: 'Kremlar', bye_cream_t: 'Terida kimyo va bir-ikki kunlik natija',
  bye_win_t: 'Tuklar ingichka va siyrak bo‘ladi, ustara deyarli kerak bo‘lmaydi. Teriga botgan tuklar va qichishishsiz.',
  bye_win_cta: 'Narxlarni ko‘rish',
  lasers_kicker: 'Texnologiyalar',
  lasers_title_html: 'Ikki lazer.<br><em>Nol</em> murosa.',
  lasers_sub: 'Biz «moda apparat» sotmaymiz. Fototipingiz, terining sezgirligi va tuk tuzilishiga qarab texnologiyani tanlaymiz.',
  diode_type: 'Diodli lazer', diode_country: 'Germaniya', diode_tag: 'Qulay va universal',
  diode_b1: 'Barcha teri turlariga, jumladan qoramtir va qoraygan teriga mos',
  diode_b2: 'Yil davomida ishlaydi — mavsumga bog‘liq emas',
  diode_b3: 'Qalin va chuqur joylashgan tuklarni ham samarali olib tashlaydi',
  diode_b4: 'Innovatsion sovutish — faqat yengil iliqlik va sanchish',
  diode_b5: 'Sezgir zonalar uchun ideal: yuz, qo‘ltiq osti, bikini',
  alex_type: 'Aleksandrit lazeri', alex_country: 'AQSH', alex_tag: 'Aniqlik va tez natija etaloni',
  alex_b1: 'Och rangli teri va qora tuklar uchun ideal',
  alex_b2: 'Birinchi natija — birinchi muolajadan keyinoq',
  alex_b3: 'Yuqori tezlik: oyoqlar, qo‘llar, orqa — tez',
  alex_b4: 'DCD krio-sovutish — har bir impulsdan oldin sovuq',
  alex_b5: 'Terini tekis, silliq va ipakdek qiladi',
  from: 'dan', currency: 'so‘m', see_prices: 'Narxlar',
  quiz_kicker: '30 soniyalik test',
  quiz_title: 'Sizga qaysi lazer mos?',
  quiz_q1: 'Teringiz turi', quiz_q1_a: 'Och', quiz_q1_b: 'O‘rtacha, bug‘doyrang', quiz_q1_c: 'Qoramtir yoki qoraygan',
  quiz_q2: 'Zonadagi tuklar rangi', quiz_q2_a: 'Qora va dag‘al', quiz_q2_b: 'Qo‘ng‘ir, o‘rtacha', quiz_q2_c: 'Och yoki oq',
  quiz_q3: 'Siz uchun nima muhimroq?', quiz_q3_a: 'Tez natija', quiz_q3_b: 'Maksimal qulaylik', quiz_q3_c: 'Hamyonbop narx',
  quiz_step: 'Savol', quiz_of: '/', quiz_back: 'Orqaga', quiz_restart: 'Qaytadan', quiz_result: 'Sizga mos keladi', quiz_go: 'Narxini hisoblash',
  quiz_note: 'Test — faqat yo‘nalish. Aniq parametrlarni usta konsultatsiyada tanlaydi.',
  prices_kicker: 'Narxlar',
  prices_title_html: 'Narxnoma va <em>kalkulyator</em>',
  prices_sub: 'Zonalarni bosing — narx va vaqtni darhol hisoblaymiz. Narxlar bir muolaja uchun.',
  for_her: 'Ayollar uchun', for_him: 'Erkaklar uchun', dev_diode: 'Diod HairBoss', dev_alex: 'Aleksandrit Candela',
  calc_selected: 'Tanlangan zonalar', calc_empty: 'Zonalarni tanlang — summa shu yerda paydo bo‘ladi',
  calc_total: 'Bir muolaja', calc_time: 'Taxminiy vaqt', calc_clear: 'Tozalash', calc_book: 'Shu zonalarga yozilish',
  calc_note: 'Kurs — 3–6 hafta oraliq bilan 6–10 muolaja. Aktual narxni administratordan aniqlang.',
  min: 'daq', hour: 'soat',
  course_kicker: 'Qanday ishlaydi',
  course_title_html: 'Konsultatsiyadan<br><em>silliq teri</em>gacha',
  step1_t: 'Konsultatsiya va tanlov', step1_d: 'Usta fototip, teri va tuklarni baholaydi, apparat va parametrlarni tanlaydi.',
  step2_t: 'Muolaja', step2_d: 'Zonalarga qarab 5 daqiqadan 3,5 soatgacha. Sovutish, faqat yengil iliqlik.',
  step3_t: '1,5–3 haftada natija', step3_d: 'Tuklar to‘kiladi, sekinroq va ingichkaroq o‘sadi.',
  step4_t: '6–10 muolajalik kurs', step4_d: '3–6 hafta oraliq: lazer o‘sish bosqichidagi follikulalarni «ushlaydi».',
  step5_t: 'Qo‘llab-quvvatlash', step5_d: 'Kursdan keyin — yarim yilda-yilda 1–2 muolaja.',
  growth_title: 'Har muolajadan keyin tuklar kamayadi', growth_note: 'Sxematik ko‘rinish. Natija individual.', session: 'muolaja',
  pain_kicker: 'Eng ko‘p beriladigan savol',
  pain_title_html: '«Bu <em>og‘riqlimi</em>?»',
  pain_quote: 'Odatda muolajaning o‘zidan ko‘ra uni kutish qo‘rqinchliroq.',
  pain_c1_t: 'HairBoss X-Fest', pain_c1_d: 'Zamonaviy sovutish tizimi: muolaja vaqtida faqat yengil iliqlik va sanchish seziladi.',
  pain_c2_t: 'Candela GentleLase Pro-U', pain_c2_d: 'Dynamic Cooling Device har bir impulsdan oldin sovuq beradi va og‘riqni sezilarli kamaytiradi.',
  pain_c3_t: 'Usta yoningizda', pain_c3_d: 'Usta doimo his-tuyg‘ularingizni so‘raydi va parametrlarni aynan sizga moslaydi.',
  shy_title: 'Bikinidan uyalyapsizmi?',
  shy_1: 'Usta — qiz. U aynan siz kabi tuzilgan va hammasi tez va yumshoq o‘tishini o‘zi xohlaydi.',
  shy_2: 'Kuniga 10 dan ortiq bikini — bu shunchaki ish. Supermarketdagi kassirdan hech kim uyalmaydi-ku.',
  shy_3: 'Usta 5–10 daqiqada taranglikni ketkazadi. Laser House’da juda yoqimli va o‘z ishini sevadigan ustalar ishlaydi.',
  prep_kicker: 'Eslatma',
  prep_title_html: 'Natija <em>maksimal</em> bo‘lishi uchun',
  prep_sub: 'Oddiy qoidalar — va bir necha oydan so‘ng doimiy qirish haqida unutasiz.',
  contra_title: 'Qarshi ko‘rsatmalar',
  contra_sub: 'Qarshi ko‘rsatma — muolajadan oldin shifokor bilan maslahatlashish uchun sabab. Surunkali bosqichda shifokor ko‘pincha ruxsat beradi.',
  faq_kicker: 'Savollar',
  faq_title_html: 'Siz <em>so‘raysiz</em> — biz javob beramiz',
  cert_kicker: 'Sovg‘a',
  cert_title_html: 'Silliqlikni <em>sovg‘a qiling</em>',
  cert_sub: 'Laser House sovg‘a sertifikati — «men sen haqingda qayg‘uraman» deyishning chiroyli usuli. Nominal va zonalarni administrator bilan aniqlang.',
  cert_cta: 'Sertifikat buyurtma qilish', cert_card: 'Sovg‘a sertifikati',
  br_kicker: 'Filiallar',
  br_title_html: 'Toshkentda <em>ikki</em> studiya',
  br_hours: 'Har kuni 10:00 dan 21:00 gacha',
  br1_name: 'S-1', br1_addr: 'Yahyo G‘ulomov ko‘chasi, 13 (Buyuk Ipak Yo‘li massivi)', br1_land: 'Mo‘ljal: «Bibigon» kafesi',
  br2_name: 'Mirobod tumani', br2_addr: 'Nukus ko‘chasi, 72/2', br2_land: 'Mo‘ljal: Rossiya elchixonasi',
  br_book: 'Shu filialga yozilish', br_route: 'Yo‘nalish',
  final_title_html: 'O‘zingni asra,<br><em>jonim</em>. <svg class="heart" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 34s-12-7.4-14.6-15C3.6 13.6 7 8 12.4 8c3.4 0 5.9 2 7.6 4.6C21.7 10 24.2 8 27.6 8 33 8 36.4 13.6 34.6 19 32 26.6 20 34 20 34z" fill="currentColor"/></svg>',
  final_sub: 'Seni studiyada kutamiz. Onlayn, Telegram yoki telefon orqali yozil.',
  footer_tag: 'Toshkentdagi lazer epilyatsiyasi studiyalari tarmog‘i',
  footer_nav: 'Navigatsiya', footer_contacts: 'Kontaktlar', footer_note: 'Narxlar ma’lumot uchun va ommaviy oferta emas.',
  bar_book: 'Yozilish',
  hint_body_all: 'Maslahat: «Butun tana» arzonroq — {sum} tejaysiz',
  other_device: 'Shu zonalar {device}da: {sum}',
  zones_count: 'ta zona'
};
