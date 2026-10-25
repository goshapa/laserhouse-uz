/* Laser House — контент и прайс.
   Цены взяты из онлайн-записи Altegio (n1237691.alteg.io), октябрь 2026.
   Формат позиции: [ключ зоны, минуты, цена в сумах] */

window.LH = window.LH || {};

LH.links = {
  booking: 'https://t.me/LaserHouseuzbot?start=book',
  telegram: 'https://t.me/laserhouse_uz',
  // username Telegram-бота без @. Пока пусто — кнопки ведут на онлайн-запись Altegio и в Telegram студии
  bot: 'LaserHouseuzbot',
  instagram: 'https://www.instagram.com/laserhouse_uz/',
  phone: '+998940000048',
  phoneLabel: '+998 94 000-00-48'
};

/* Google Реклама: id тега (AW-…) и метки конверсий из кабинета (Цели → Конверсии).
   Пока id пустой — тег не загружается. Пустая метка — это действие не считается. */
LH.ads = {
  id: 'AW-18533502821', // сам тег стоит в <head> index.html
  labels: {
    book: 'zIC4CPKFhakdEOWeu4VF',  // «Запись» — переход в бота на запись
    cert: 'PeNvCIrahakdEOWeu4VF',  // «Сертификат» — заказ сертификата
    call: 'nptLCMHbhakdEOWeu4VF',  // «Звонок» — нажатие на номер телефона
    chat: '-kXmCMTbhakdEOWeu4VF'   // «Мессенджер» — переход в Telegram или Instagram студии (второстепенная)
  }
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
  bikini_deep_m:    { ru: 'Бикини глубокое (интимная зона)', uz: 'Chuqur bikini (intim zona)', g: 'intim' },
  lip_m:            { ru: 'Верхняя губа (усы)',       uz: 'Yuqori lab (mo‘ylov)', g: 'face' }
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

/* Разделы прайс-листов студии (Candela / DEKA) */
LH.sheetGroups = [
  { id: 'm_face',   ru: 'Лицо',             uz: 'Yuz' },
  { id: 'm_neck',   ru: 'Шея',              uz: 'Bo‘yin' },
  { id: 'm_chest',  ru: 'Грудь',            uz: 'Ko‘krak' },
  { id: 'm_bikini', ru: 'Бикини',           uz: 'Bikini' },
  { id: 'm_arms',   ru: 'Руки и подмышки',  uz: 'Qo‘llar va qo‘ltiq osti' },
  { id: 'm_legs',   ru: 'Ноги',             uz: 'Oyoqlar' },
  { id: 'm_belly',  ru: 'Живот',            uz: 'Qorin' },
  { id: 'm_back',   ru: 'Спина и ягодицы',  uz: 'Orqa va dumba' },
  { id: 'complex',  ru: 'Всё тело',         uz: 'Butun tana' }
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
    /* DEKA / Candela (александрит). Порядок и разделы — как в прайсе студии.
       Формат: [зона, минуты, цена со скидкой, цена без скидки, раздел] */
    alex: [
      ['face_full', 20, 450000, 600000, 'm_face'], ['cheeks', 20, 200000, 300000, 'm_face'],
      ['forehead', 20, 200000, 300000, 'm_face'], ['lip_m', 20, 200000, 300000, 'm_face'],
      ['chin', 20, 150000, 200000, 'm_face'], ['sideburns', 20, 200000, 300000, 'm_face'],
      ['neck_full', 20, 200000, 300000, 'm_neck'], ['neck_front', 20, 150000, 250000, 'm_neck'],
      ['neck_back', 20, 150000, 250000, 'm_neck'],
      ['areolas', 20, 150000, 250000, 'm_chest'], ['decollete', 20, 200000, 300000, 'm_chest'],
      ['chest_full', 30, 350000, 500000, 'm_chest'],
      ['bikini_classic', 30, 350000, 500000, 'm_bikini'], ['bikini_deep', 30, 450000, 600000, 'm_bikini'],
      ['arms_full', 30, 490000, 650000, 'm_arms'], ['arms_upper', 30, 300000, 500000, 'm_arms'],
      ['arms_lower', 30, 300000, 500000, 'm_arms'], ['shoulders', 20, 300000, 500000, 'm_arms'],
      ['armpits', 20, 250000, 300000, 'm_arms'], ['fingers', 15, 70000, 100000, 'm_arms'],
      ['hands', 20, 170000, 200000, 'm_arms'],
      ['legs_full', 40, 890000, 1000000, 'm_legs'], ['legs_half', 40, 600000, 800000, 'm_legs'],
      ['toes', 20, 70000, 100000, 'm_legs'],
      ['belly_full', 30, 390000, 500000, 'm_belly'], ['line_pubis_navel', 20, 150000, 200000, 'm_belly'],
      ['line_navel_chest', 20, 150000, 200000, 'm_belly'],
      ['lower_back', 20, 175000, 300000, 'm_back'], ['back', 30, 450000, 550000, 'm_back'],
      ['buttocks', 30, 400000, 500000, 'm_back'],
      ['body_all', 210, 2890000, 4200000, 'complex']
    ]
  },
  men: {
    /* Для мужчин — только Candela. Порядок и разделы — как в прайсе студии.
       Формат: [зона, минуты, цена со скидкой, цена без скидки, раздел] */
    alex: [
      ['face_full', 20, 450000, 600000, 'm_face'], ['cheeks', 20, 200000, 300000, 'm_face'],
      ['forehead', 20, 200000, 300000, 'm_face'], ['lip_m', 20, 200000, 300000, 'm_face'],
      ['chin', 20, 150000, 200000, 'm_face'], ['sideburns', 20, 200000, 300000, 'm_face'],
      ['neck_full', 20, 200000, 300000, 'm_neck'], ['neck_front', 20, 150000, 250000, 'm_neck'],
      ['neck_back', 20, 150000, 250000, 'm_neck'],
      ['chest_full', 30, 390000, 500000, 'm_chest'],
      ['bikini_deep_m', 20, 490000, 600000, 'm_bikini'],
      ['arms_full', 30, 590000, 750000, 'm_arms'], ['arms_upper', 30, 300000, 500000, 'm_arms'],
      ['arms_lower', 30, 300000, 500000, 'm_arms'], ['shoulders', 20, 300000, 500000, 'm_arms'],
      ['armpits', 20, 250000, 300000, 'm_arms'], ['fingers', 20, 70000, 100000, 'm_arms'],
      ['hands', 20, 170000, 200000, 'm_arms'],
      ['legs_full', 50, 900000, 1600000, 'm_legs'], ['legs_half', 40, 600000, 800000, 'm_legs'],
      ['toes', 20, 70000, 100000, 'm_legs'],
      ['belly_full', 30, 490000, 700000, 'm_belly'], ['line_pubis_navel', 20, 150000, 200000, 'm_belly'],
      ['line_navel_chest', 20, 150000, 200000, 'm_belly'],
      ['lower_back', 30, 175000, 300000, 'm_back'], ['back', 40, 590000, 800000, 'm_back'],
      ['buttocks', 30, 400000, 500000, 'm_back'],
      ['body_all', 180, 3890000, 4200000, 'complex']
    ]
  }
};

/* DEKA Motus PRO — цены как у Candela (только женский прайс) */
LH.prices.women.deka = LH.prices.women.alex;

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
      ru: 'Через 7–10 дней после процедуры. Чем темнее волос, тем быстрее видно, что волос стало меньше и растут они медленнее. Лазер разрушает только фолликулы в фазе активного роста — «спящие» волоски он не видит. С каждой процедурой они просыпаются, и к концу курса остаются лишь редкие мягкие светлые волоски.',
      uz: 'Muolajadan 7–10 kun o‘tib. Tuk qanchalik qora bo‘lsa, ular kamayib, sekin o‘sayotgani shunchalik tez seziladi. Lazer faqat faol o‘sish bosqichidagi follikulalarni yo‘q qiladi — «uxlayotgan» tuklarni u ko‘rmaydi. Har bir muolaja bilan ular uyg‘onadi va kurs oxiriga kelib faqat siyrak, yumshoq va och rangli tukchalar qoladi.'
    }
  },
  {
    q: { ru: 'Сколько процедур понадобится?', uz: 'Nechta muolaja kerak bo‘ladi?' },
    a: {
      ru: 'В среднем 6–10 процедур с интервалом 4–6 недель. Лазерная эпиляция делается только курсом: нужно «поймать» все волны роста волос. После каждой процедуры мастер оценивает, как уходят волосы, и говорит, сколько осталось. После курса — 1–2 поддерживающие процедуры раз в полгода-год.',
      uz: 'O‘rtacha 4–6 hafta oraliq bilan 6–10 muolaja. Lazer epilyatsiyasi faqat kurs bilan qilinadi: tuklar o‘sishining barcha to‘lqinlarini «ushlash» kerak. Har muolajadan keyin usta natijani baholab, yana nechta qolganini aytadi. Kursdan so‘ng — yarim yilda-yilda 1–2 ta qo‘llab-quvvatlovchi muolaja.'
    }
  },
  {
    q: { ru: 'Это больно?', uz: 'Bu og‘riqlimi?' },
    a: {
      ru: 'Обычно страшнее ожидание, чем сама процедура. На всех трёх аппаратах — Candela, DEKA Motus PRO и HairBoss X-Fest — современное охлаждение, поэтому ощущается лишь лёгкое тепло и покалывание. Мастер всё время уточняет ваши ощущения и подбирает параметры.',
      uz: 'Odatda muolajaning o‘zidan ko‘ra uni kutish qo‘rqinchliroq. Uchala apparatda — Candela, DEKA Motus PRO va HairBoss X-Fest — zamonaviy sovutish bor, shuning uchun faqat yengil iliqlik va sanchish seziladi. Usta doimo his-tuyg‘ularingizni so‘rab, parametrlarni moslaydi.'
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
    q: { ru: 'Какой из трёх лазеров выбрать?', uz: 'Uchta lazerdan qaysi birini tanlash kerak?' },
    a: {
      ru: 'Все три аппарата — последних моделей, и каждый работает с разными типами кожи и волос. Candela — золотой стандарт лазерной эпиляции. DEKA Motus PRO — итальянская платформа с александритовым и неодимовым лазерами. HairBoss X-Fest — универсальный и комфортный немецкий диод. Окончательный выбор мастер делает на консультации — под ваш фототип и зону.',
      uz: 'Uchala apparat ham eng so‘nggi modellar va har biri turli teri va tuk turlari bilan ishlaydi. Candela — lazer epilyatsiyasining oltin standarti. DEKA Motus PRO — aleksandrit va neodim lazerli italyan platformasi. HairBoss X-Fest — universal va qulay nemis diodi. Yakuniy tanlovni usta konsultatsiyada fototipingiz va zonaga qarab qiladi.'
    }
  }
];

/* Переводы интерфейса. Русский текст берётся прямо из HTML. */
LH.uz = {
  nav_results: 'Natijalar', nav_reviews: 'Sharhlar',
  res_kicker: 'Natijalar', res_title_html: 'Oldin va <em>keyin</em>',
  res_sub: 'Ustalarimizning haqiqiy ishlari — Laser House mijozlari suratlari. Ko‘rish uchun suratni bosing.',
  res_note: 'Natija individual va zona, teri hamda tuk turiga bog‘liq.',
  res_c1: '2 muolajadan keyin', res_c2: 'Qo‘ltiq osti', res_c3: '1 muolajadan keyin', res_c4: '5 muolajadan keyin', res_c5: 'Oyoqlar', res_c6: 'Qo‘ltiq osti',
  rev_kicker: 'Sharhlar', rev_title_html: '<em>5,0</em> — mijozlarimiz bahosi',
  rev_sub: 'Yandex Xaritalar va 2GIS’da 500 dan ortiq baho. Quyidagi sharhlar to‘g‘ridan-to‘g‘ri Yandex Xaritalardan yuklanadi.',
  rev_ig: 'Dolzarb bo‘limidagi «Отзывы»', rev_tab1: 'Buyuk Ipak Yo‘li, 13', rev_tab2: 'Nukus, 72/2',
  rev_loading: 'Sharhlar Yandex Xaritalardan yuklanmoqda…',
  rev_ya: 'Yandex Xaritalar', rev_all: 'Yandex Xaritalardagi barcha sharhlar', rev_note: 'Sharhlar Yandex Xaritalardan yuklanadi va mijozlar yangilarini qoldirganda o‘zi yangilanadi.',
  nav_lasers: 'Lazerlar', nav_prices: 'Narxlar', nav_course: 'Kurs', nav_prep: 'Tayyorgarlik', nav_faq: 'Savollar', nav_branches: 'Filiallar',
  cta_book: 'Yozilish',
  hero_eyebrow: 'Lazer epilyatsiyasi studiyalari tarmog‘i · Toshkent · Samarqand',
  hero_title_html: '<span class="line">Ustarani</span><span class="line"><em>unuting</em>.</span>',
  hero_sub: 'So‘nggi modeldagi uchta asl tibbiy lazer — Candela (AQSH), DEKA (Italiya) va HairBoss X-Fest (Germaniya), tajribali ustalar va teringizga mos apparatni halol tanlash. Dam olish kunlarisiz, 10:00 dan 21:00 gacha.',
  hero_book: 'Onlayn yozilish', hero_tg: 'Telegram’da yozish',
  stat_followers: 'Instagram’da obunachilar', stat_studios: 'Toshkentda studiya', stat_samarkand: 'Samarqandda studiya', stat_days: 'kun haftasiga, 10–21', stat_course: 'muolaja — to‘liq kurs',
  trust3_t: 'So‘nggi modellar', trust3_d: 'Barcha apparatlar — o‘z sinfining eng yaxshisi', trust4_t: 'Tajribali mutaxassislar', trust4_d: 'Muntazam malaka oshiradi',
  chip_alex: 'Aleksandrit · AQSH', chip_deka: 'Aleksandrit + neodim · Italiya', chip_diode: 'Diod · Germaniya', chip_cool: 'Har bir impulsda sovutish',
  bye_kicker: 'Hayr, qiynoqlar',
  bye_title_html: 'Hammasi uchun rahmat.<br>Lekin endi sizga <em>ehtiyoj yo‘q</em>.',
  bye_razor: 'Ustara', bye_razor_t: '2 kunda tikanli tuklar va qichishish',
  bye_wax: 'Mum', bye_wax_t: 'Og‘riqli va 3–4 haftada yana boshidan',
  bye_sugar: 'Shugaring', bye_sugar_t: 'Teriga botib o‘sgan tuklar va cheksiz yozilishlar',
  bye_cheap: 'Sifatsiz apparatlar', bye_cheap_t: 'Bekorga sarflangan pul: zaif natija va kuyish xavfi',
  bye_cream: 'Kremlar', bye_cream_t: 'Terida kimyo va bir-ikki kunlik natija',
  bye_win_t: 'Tuklar ingichka va siyrak bo‘ladi, ustara deyarli kerak bo‘lmaydi. Teriga botgan tuklar va qichishishsiz.',
  bye_win_cta: 'Narxlarni ko‘rish',
  lasers_kicker: 'Texnologiyalar',
  lasers_title_html: 'Uchta lazer.<br><em>Nol</em> murosa.',
  lasers_sub: 'Uchala apparat ham so‘nggi modellar, o‘z sinfining eng yaxshilari. Biz «moda apparat» sotmaymiz — fototipingiz, terining sezgirligi va tuk tuzilishiga qarab texnologiyani tanlaymiz.',
  diode_type: 'Diodli lazer', diode_country: 'Germaniya', diode_tag: 'Qulay va universal',
  diode_b1: 'Barcha teri turlariga, jumladan qoramtir va qoraygan teriga mos',
  diode_b2: 'Yil davomida ishlaydi — mavsumga bog‘liq emas',
  diode_b3: 'Qalin va chuqur joylashgan tuklarni ham samarali olib tashlaydi',
  diode_b4: 'Zamonaviy sovutish — faqat yengil iliqlik va sanchish',
  diode_b5: 'Sezgir zonalar uchun ideal: yuz, qo‘ltiq osti, bikini',
  deka_type: 'Aleksandrit + neodim', deka_country: 'Italiya', deka_tag: 'Italyan ko‘p funksiyali platformasi',
  deka_b1: 'Bittada ikki lazer: aleksandrit va neodim',
  deka_b2: 'Moveo texnologiyasi muolajani yumshoqroq va qulayroq qiladi',
  deka_b3: 'Zamonaviy sovutish terini asraydi',
  deka_b4: 'Neodim lazer qoramtir va qoraygan teri bilan ishlaydi',
  deka_b5: 'Katta zonalar uchun ham, sezgir zonalar uchun ham mos',
  alex_type: 'Aleksandrit lazeri', alex_country: 'AQSH', alex_tag: 'Lazer epilyatsiyasining oltin standarti',
  alex_b1: 'Och rangli teri va qora tuklar uchun ideal',
  alex_b2: 'Birinchi natija — birinchi muolajadan keyinoq',
  alex_b3: 'Yuqori tezlik: oyoqlar, qo‘llar, orqa — tez',
  alex_b4: 'Zamonaviy sovutish — muolaja qulay o‘tadi',
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
  calc_note: 'Kurs — 4–6 hafta oraliq bilan 6–10 muolaja. Aktual narxni administratordan aniqlang.',
  min: 'daq', hour: 'soat',
  course_kicker: 'Qanday ishlaydi',
  course_title_html: 'Konsultatsiyadan<br><em>silliq teri</em>gacha',
  step1_t: 'Konsultatsiya va tanlov', step1_d: 'Usta fototip, teri va tuklarni baholaydi, apparat va parametrlarni tanlaydi.',
  step2_t: 'Muolaja', step2_d: 'Zonalarga qarab 10 daqiqadan 2 soat 30 daqiqagacha. Zamonaviy sovutish, faqat yengil iliqlik.',
  step3_t: '7–10 kunda natija', step3_d: 'Tuklar to‘kiladi, sekinroq va ingichkaroq o‘sadi.',
  step4_t: '6–10 muolajalik kurs', step4_d: '4–6 hafta oraliq: lazer o‘sish bosqichidagi follikulalarni «ushlaydi».',
  step5_t: 'Qo‘llab-quvvatlash', step5_d: 'Kursdan keyin — yarim yilda-yilda 1–2 muolaja.',
  growth_title: 'Har muolajadan keyin tuklar kamayadi', growth_note: 'Sxematik ko‘rinish. Natija individual.', session: 'muolaja',
  pain_kicker: 'Eng ko‘p beriladigan savol',
  pain_title_html: '«Bu <em>og‘riqlimi</em>?»',
  pain_quote: 'Odatda muolajaning o‘zidan ko‘ra uni kutish qo‘rqinchliroq.',
  pain_c1_t: 'HairBoss X-Fest', pain_c1_d: 'Zamonaviy sovutish: muolaja vaqtida faqat yengil iliqlik va sanchish seziladi.',
  pain_c2_t: 'Candela GentleLase&nbsp;Pro&#8209;U', pain_c2_d: 'Zamonaviy sovutish terini himoya qiladi va og‘riqni sezilarli kamaytiradi.',
  pain_c4_d: 'Moveo texnologiyasi va zamonaviy sovutish muolajani yumshoq va qulay qiladi.',
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
  br_title_html: '<em>Uchta</em> studiya — Toshkent va Samarqand',
  br_hours: 'Har kuni 10:00 dan 21:00 gacha',
  br1_name: 'S-1', br1_addr: 'Buyuk Ipak Yo‘li ko‘chasi, 13', br1_land: 'Mo‘ljal: Bibigon kafesi',
  br2_name: 'Nukus', br2_addr: 'Nukus ko‘chasi, 72/2, Mirobod tumani', br2_land: 'Mo‘ljal: Rossiya elchixonasi qarshisida',
  br3_name: 'Samarqand', br3_addr: 'Buyuk Ipak Yo‘li ko‘chasi, 25', br3_land: 'Mo‘ljal: 14-maktab',
  br_call: 'Qo‘ng‘iroq qilish', city_tashkent: 'Toshkent', city_samarkand: 'Samarqand',
  br_book: 'Onlayn yozilish', br_route: 'Yo‘nalish',
  final_title_html: 'O‘zingni asra, <em>jonim</em>.',
  final_sub: 'Seni studiyada kutamiz. Onlayn, Telegram yoki telefon orqali yozil.',
  footer_tag: 'Toshkent va Samarqanddagi lazer epilyatsiyasi studiyalari tarmog‘i',
  footer_nav: 'Navigatsiya', footer_contacts: 'Kontaktlar', footer_note: 'Narxlar ma’lumot uchun va ommaviy oferta emas.',
  bar_book: 'Yozilish',
  hint_body_all: 'Maslahat: «Butun tana» arzonroq — {sum} tejaysiz',
  other_device: 'Shu zonalar {device}da: {sum}',
  zones_count: 'ta zona'
};
