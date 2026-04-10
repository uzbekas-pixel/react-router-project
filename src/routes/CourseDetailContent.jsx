// ═══════════════════════════════════════════════════════════════════════════════
// CourseDetailContent.jsx  —  Uzbekas Pixel  |  AI Slayd Tizimi  v4 (Kengaytirilgan)
// generateLessonContent(lesson, courseId, category) → Slide[]
// ═══════════════════════════════════════════════════════════════════════════════
import { 
  LuGlobe, LuLightbulb, LuWrench, LuRocket, LuTarget, LuInfo, LuClipboard, LuPalette, LuZap, LuDiamond,
 LuCode, LuLayers, LuMousePointer, LuImage, LuBookOpen, LuVideo,
  LuAtom, LuMinus, LuPlus, LuFlame, LuEye, LuBook, LuDollarSign, LuSmartphone, LuMonitor, LuSparkles, LuGift, LuTrophy, LuStar, LuSearch, LuShield, LuSettings, LuFolder, LuSave, LuPlug, LuBell, LuCalendar, LuTrendingUp, LuMapPin, LuLink, LuHammer, LuPackage, LuKey, LuMail, LuGithub, LuSend, LuGraduationCap, LuSmile, LuActivity
} from "react-icons/lu";

// ─────────────────────────────────────────────────────────────────────────────
// HTML KURSI  (courseId: 1)
// ─────────────────────────────────────────────────────────────────────────────
const htmlLessons = {
  1: [
    {
      type: "intro", label: "Kirish",
      title: "HTML nima? — Veb dunyosiga birinchi qadam",
      avatarText: "Salom! Men Uzbekas AI. Bugun HTML — barcha veb saytlarning poydevori bilan tanishamiz. Tayyor bo'lsangiz, boshlaylik!",
      content: [
        { kind: "paragraph", html: "<strong>HTML</strong> (HyperText Markup Language) — veb sahifalar yaratish uchun ishlatiladigan belgilash tili. Brauzer HTML kodini o'qib, uni ko'rinadigan sahifaga aylantiradi." },
        { kind: "highlight", icon: <LuGlobe />, label: "Qiziqarli fakt", text: "Dunyadagi barcha veb saytlar — Google, YouTube, Instagram — HTML asosida qurilgan. Siz ham bugun shu yo'lni boshlayapsiz!" },
        { kind: "points", items: [
          "HTML 1991-yilda Tim Berners-Lee tomonidan yaratilgan",
          "Hozirda HTML5 — eng so'nggi va kuchli versiya",
          "HTML dasturlash tili EMAS — u belgilash tili (markup language)",
          "Brauzer HTML ni yuqoridan pastga o'qib, ekranda chiqaradi",
          "Fayl kengaytmasi: .html yoki .htm",
        ]},
      ],
    },
    {
      type: "theory", label: "Teglar tushunchasi",
      title: "HTML teg nima va u qanday yoziladi?",
      avatarText: "HTML teglar — sahifaning qurilish bloklari. Ularni tushunmasdan HTML yozib bo'lmaydi!",
      content: [
        { kind: "paragraph", html: "HTML <strong>teg</strong> — burchakli qavslar <code>&lt; &gt;</code> ichida yoziladigan kalit so'z. Ko'pchiligi juft bo'ladi: ochilish va yopilish tegi." },
        { kind: "code", lang: "html", code: `<!-- JUFT TEG: ochiladi va yopiladi -->
<p>Bu paragraf matni</p>
<h1>Bu sarlavha</h1>
<strong>Bu qalin matn</strong>

<!-- YAGONA TEG: yopilmaydi -->
<br>         <!-- qator o'tkazish -->
<hr>         <!-- gorizontal chiziq -->
<img src="rasm.jpg" alt="Tavsif">

<!-- TEG ANATOMIYASI -->
<a href="https://uzbekas.uz" target="_blank">Havola matni</a>
<!--  ^teg nomi  ^atribut nomi  ^atribut qiymati  -->` },
        { kind: "highlight", icon: <LuLightbulb />, label: "Eslatma", text: "Yopilish tegida teg nomidan oldin / belgisi yoziladi: </p>, </h1>, </strong>" },
      ],
    },
    {
      type: "code", label: "Birinchi sahifa",
      title: "HTML sahifaning to'liq tuzilmasi",
      avatarText: "Mana har bir HTML sahifada bo'lishi shart bo'lgan tuzilma. Bu skelitni yod oling!",
      content: [
        { kind: "code", lang: "html", code: `<!DOCTYPE html>
<html lang="uz">

  <head>
    <!-- Brauzer uchun meta ma'lumotlar (ko'rinmaydi) -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sahifa nomi — brauzer tabida chiqadi</title>
    <link rel="stylesheet" href="styles.css">
  </head>

  <body>
    <!-- Foydalanuvchi ko'radigan barcha kontent shu yerda -->
    <h1>Asosiy sarlavha</h1>
    <p>Paragraf matni.</p>

    <script src="script.js"></script>
  </body>

</html>` },
        { kind: "practices", items: [
          "<!DOCTYPE html> — DOIMO birinchi qatorda bo'lsin",
          "<head> — meta, title, CSS ulanishi (ko'rinmaydi)",
          "<body> — foydalanuvchi ko'radigan barcha kontent",
          "<script> — </body> dan oldin, oxirida yozing",
        ]},
      ],
    },
    {
      type: "theory", label: "VS Code o'rnatish",
      title: "Ishchi muhitni tayyorlash",
      avatarText: "Professional dasturchi bo'lish uchun to'g'ri muhit kerak. VS Code — eng yaxshi tanlov!",
      content: [
        { kind: "highlight", icon: <LuWrench />, label: "Kerakli vositalar", text: "1. VS Code (code.visualstudio.com) — bepul kod muharriri | 2. Live Server extension — saqlashda brauzer avtomatik yangilanadi" },
        { kind: "points", items: [
          "VS Code yuklab o'rnating: code.visualstudio.com",
          "Extensions (Ctrl+Shift+X) → 'Live Server' → Install",
          "Yangi fayl: index.html yarating",
          "Emmet shortcut: ! + Tab → HTML skelet avtomatik",
          "Go Live tugmasi (pastki o'ngda) → brauzerda ochiladi",
        ]},
        { kind: "tip", text: "💡 VS Code shortcut: Ctrl+/ — qatorni kommentariyga aylantiradi. Juda qulay!" },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "HTML asoslari bo'yicha sinov",
      avatarText: "O'rganganlaringizni sinab ko'ramiz! To'g'ri javobni tanlang.",
      content: [
        { kind: "quiz", q: "HTML qisqartmasi to'liq nima?", opts: ["HyperText Markup Language", "High Tech Modern Language", "HyperText Making Links", "Home Tool Markup Language"], correct: 0, explanation: "HTML — HyperText Markup Language. 'HyperText' = havolalar orqali bog'langan matn, 'Markup Language' = belgilash tili." },
      ],
    },
    {
      type: "challenge", label: "Test 2",
      title: "Teglar bo'yicha sinov",
      avatarText: "Yana bir savol! Diqqat bilan o'ylang.",
      content: [
        { kind: "quiz", q: "Qaysi teg yopilmaydi (self-closing)?", opts: ["<p>", "<div>", "<br>", "<span>"], correct: 2, explanation: "<br> — qator o'tkazish tegi, u yopilmaydi. <img>, <hr>, <input> ham yopilmaydigan teglarga kiradi." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "1-dars yakunlandi! 🎉",
      avatarText: "Zo'r! Siz HTML nima ekanligi, teglar qanday yozilishi va sahifa tuzilmasini o'rgandingiz. Keyingi darsda amaliyot!",
      content: [
        { kind: "practices", items: [
          "HTML — veb sahifalarning skeleti va asosi",
          "Teglar juft: <p>...</p> yoki yagona: <br>",
          "Har sahifa: <!DOCTYPE html> → <html> → <head> + <body>",
          "VS Code + Live Server = professional ish muhiti",
        ]},
        { kind: "highlight", icon: <LuRocket />, label: "Keyingi dars", text: "Shaxsiy vizitka sahifasini noldan yaratamiz — har bir teg amalda!" },
      ],
    },
  ],

  /* ── Dars 2: Birinchi HTML sahifa ─────────────────────────────────────────── */
  2: [
    {
      type: "intro", label: "Kirish",
      title: "Birinchi HTML sahifangizni o'zingiz yarating",
      avatarText: "Bugun faqat kod yozamiz! Shaxsiy vizitka sahifasi yaratamiz — ism, ta'lim, maqsadlar. Tayyor bo'ling!",
      content: [
        { kind: "paragraph", html: "Nazariyadan amaliyotga! Bugun <strong>shaxsiy vizitka sahifasi</strong> yaratamiz. Bu loyiha barcha asosiy HTML teglarni ishlatadi." },
        { kind: "highlight", icon: <LuTarget />, label: "Maqsad", text: "Dars oxirida sizda brauzerda ochiladigan, to'liq formatlangan shaxsiy sahifangiz bo'ladi!" },
      ],
    },
    {
      type: "code", label: "Matn teglari",
      title: "Sarlavha va paragraf teglari",
      avatarText: "h1 dan h6 gacha sarlavhalar, p tegi paragraflar uchun. Eng ko'p ishlatiladigan teglar!",
      content: [
        { kind: "code", lang: "html", code: `<body>

  <!-- SARLAVHALAR: h1 eng katta, h6 eng kichik -->
  <h1>Kamoliddin Yusupov</h1>       <!-- Bosh sarlavha, 1 ta bo'lsin -->
  <h2>Veb Dasturchi</h2>            <!-- Ikkinchi daraja -->
  <h3>Men haqimda</h3>              <!-- Uchinchi daraja -->

  <!-- PARAGRAFLAR -->
  <p>
    Men Toshkentda yashaydigan,
    veb texnologiyalarni o'rganayotgan
    dasturchi bo'lmoqchiman.
  </p>

  <!-- MATN FORMATLASH -->
  <p>
    Mening <strong>asosiy maqsadim</strong> —
    <em>professional darajada</em> kod yozishni o'rganish.
    <mark>Uzbekas Pixel</mark> bu yo'lda menga yordam beradi.
  </p>

  <!-- GORIZONTAL CHIZIQ (bo'lim ajratuvchi) -->
  <hr>

  <h3>Ko'nikmalarim</h3>

</body>` },
        { kind: "highlight", icon: <LuInfo />, label: "Qoida", text: "h1 tegi sahifada BITTA bo'lishi kerak — bu SEO uchun juda muhim! h2-h6 esa bir nechtadan bo'lishi mumkin." },
      ],
    },
    {
      type: "code", label: "Ro'yxatlar",
      title: "ul, ol, li — Ro'yxat teglari",
      avatarText: "Ro'yxatlar — HTML ning eng ko'p ishlatiladigan elementlaridan biri. Tartibli va tartiblangan ro'yxatlar!",
      content: [
        { kind: "code", lang: "html", code: `<!-- TARTIBLANGAN RO'YXAT (ol — ordered list) -->
<h3>O'rganish rejam:</h3>
<ol>
  <li>HTML asoslar (hozir)</li>
  <li>CSS va Flexbox</li>
  <li>JavaScript</li>
  <li>React.js</li>
  <li>Backend (Node.js)</li>
</ol>

<!-- TARTIBLANGAN RO'YXAT (ul — unordered list) -->
<h3>Hobbiylarim:</h3>
<ul>
  <li>📖 Kitob o'qish</li>
  <li>💻 Kod yozish</li>
  <li>🎮 Video o'yinlar</li>
  <li>🚴 Velosiped haydash</li>
</ul>

<!-- ICHMA-ICH RO'YXAT -->
<ul>
  <li>Frontend
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>JavaScript</li>
    </ul>
  </li>
  <li>Backend</li>
</ul>` },
      ],
    },
    {
      type: "code", label: "Havola va rasm",
      title: "a va img teglari — Havolalar va rasmlar",
      avatarText: "a tegi — havolalar uchun, img tegi — rasmlar uchun. Ikkalasi ham veb sahifaning muhim qismi!",
      content: [
        { kind: "code", lang: "html", code: `<!-- HAVOLA TEGI -->
<a href="https://uzbekas.uz">Uzbekas Pixel</a>

<!-- Yangi tabda ochilsin -->
<a href="https://github.com" target="_blank" rel="noopener">
  GitHub profilim
</a>

<!-- Email havola -->
<a href="mailto:siz@gmail.com">Menga yozing</a>

<!-- Telefon havola -->
<a href="tel:+998901234567">+998 90 123-45-67</a>

<!-- RASM TEGI -->
<img
  src="mening-rasmim.jpg"
  alt="Kamoliddin Yusupov portreti"
  width="200"
  height="200"
>

<!-- Internetdan rasm -->
<img
  src="https://placehold.co/200x200/e44d26/fff?text=K"
  alt="Placeholder rasm"
  style="border-radius: 50%"
>` },
        { kind: "tip", text: "⚠️ img tegida alt atribut SHART! U ko'rish muammosi bor foydalanuvchilar va Google uchun zarur." },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "HTML sahifa elementlari testi",
      avatarText: "Mana savol! To'g'ri javobni tanlang.",
      content: [
        { kind: "quiz", q: "Yangi tabda ochiladigan havola uchun qaysi atribut ishlatiladi?", opts: ['href="blank"', 'target="_blank"', 'open="new"', 'link="tab"'], correct: 1, explanation: 'target="_blank" — havolani yangi brauzer tabida ochadi. rel="noopener noreferrer" bilan birga ishlatish xavfsizlik uchun tavsiya etiladi.' },
      ],
    },
    {
      type: "code", label: "To'liq loyiha",
      title: "Shaxsiy vizitka — To'liq kod",
      avatarText: "Mana hamma narsani birlashtirgan to'liq vizitka sahifasi! Bu sizning birinchi real loyihangiz.",
      content: [
        { kind: "code", lang: "html", code: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Kamoliddin — Veb Dasturchi</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px;
           margin: 40px auto; padding: 0 20px; color: #333; }
    h1   { color: #e44d26; border-bottom: 3px solid #e44d26; }
    .karta { background: #f9f9f9; padding: 20px;
             border-radius: 10px; margin: 15px 0; }
    a    { color: #e44d26; }
  </style>
</head>
<body>
  <h1>👋 Kamoliddin Yusupov</h1>
  <p><em>Veb dasturchi | Toshkent, O'zbekiston</em></p>
  <img src="https://placehold.co/100x100/e44d26/fff?text=K"
       alt="Profil rasm" style="border-radius:50%">

  <div class="karta">
    <h2>📚 Ta'lim</h2>
    <p><strong>Uzbekas Pixel</strong> — Veb Dasturlash kursi, 2024</p>
    <p>Toshkent Axborot Texnologiyalari Universiteti</p>
  </div>

  <div class="karta">
    <h2>💻 Ko'nikmalar</h2>
    <ul>
      <li>HTML5 ✅</li>
      <li>CSS3 (o'rganmoqda)</li>
      <li>JavaScript (o'rganmoqda)</li>
    </ul>
  </div>

  <h2>🔗 Bog'lanish</h2>
  <p>
    <a href="mailto:kamoliddin@gmail.com">📧 Email</a> &nbsp;|&nbsp;
    <a href="https://github.com" target="_blank">🐙 GitHub</a> &nbsp;|&nbsp;
    <a href="https://t.me/username" target="_blank">✈️ Telegram</a>
  </p>
</body>
</html>` },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "2-dars yakunlandi! 🎉",
      avatarText: "Birinchi haqiqiy sahifangizni yaratdingiz! Bu muhim qadam. Endi CSS bilan bezashni o'rganamiz!",
      content: [
        { kind: "practices", items: [
          "h1-h6 sarlavha, p paragraf, hr chiziq teglari",
          "ul/ol — ro'yxatlar, li — ro'yxat elementi",
          "a href — havola, target='_blank' — yangi tab",
          "img src, alt — rasm, alt shart!",
        ]},
      ],
    },
  ],

  /* ── Dars 3: Asosiy teglar ────────────────────────────────────────────────── */
  3: [
    {
      type: "intro", label: "Kirish",
      title: "HTML asosiy teglar — To'liq qo'llanma",
      avatarText: "Bugun eng muhim va ko'p ishlatiladigan teglarni bir joyda o'rganamiz. Bu darsdan keyin istalgan sahifani qura olasiz!",
      content: [
        { kind: "highlight", icon: <LuClipboard />, label: "Teg toifalari", text: "Matn teglari · Tuzilma teglari · Jadval teglari · Forma teglari · Semantik teglar (HTML5)" },
        { kind: "points", items: [
          "HTML da 100+ teg bor, lekin kundalik 30 ta ishlatingiz",
          "Block element: to'liq qatorni egallaydi (div, p, h1...)",
          "Inline element: faqat kontent kengligi (span, a, strong...)",
          "Semantik teglar — mazmunni ta'riflaydi (article, nav, main...)",
        ]},
      ],
    },
    {
      type: "code", label: "Matn teglari",
      title: "Matn formatlash teglari — To'liq ro'yxat",
      avatarText: "Mana barcha matn teglari! Har birining o'z vazifasi bor — ularni to'g'ri ishlatish SEO uchun ham muhim.",
      content: [
        { kind: "code", lang: "html", code: `<!-- MUHIMLIK/TA'KID -->
<strong>Muhim matn</strong>     <!-- Qalin + semantik muhim -->
<b>Qalin matn</b>               <!-- Faqat vizual qalin (semantik emas) -->
<em>Ta'kidlangan</em>           <!-- Kursiv + semantik ta'kid -->
<i>Kursiv matn</i>              <!-- Faqat vizual kursiv -->

<!-- O'ZGARISH/BELGILASH -->
<mark>Sariq bilan belgilangan</mark>
<del>O'chirilgan (narx chegirma)</del>
<ins>Qo'shilgan yangi matn</ins>
<s>Eski matn (eskirgan)</s>

<!-- TEXNIK MATN -->
<code>console.log("salom")</code>   <!-- Kod parchasi -->
<pre>                               <!-- Formatlangan matn (bo'shliqlar saqlanadi) -->
  Bu    bo'shliqlar
  saqlanadi   !
</pre>
<kbd>Ctrl + S</kbd>                 <!-- Klaviatura tugmasi -->
<var>x = y + z</var>               <!-- O'zgaruvchi/matematika -->

<!-- O'LCHAM -->
<small>Kichik izoh matni</small>
<big>Katta matn (eskirgan, CSS ishlating)</big>
<sup>Daraja<sup>2</sup></sup>      <!-- Yuqori indeks: x² -->
<sub>H<sub>2</sub>O</sub>          <!-- Quyi indeks: H₂O -->

<!-- IQTIBOS -->
<blockquote cite="https://manba.uz">
  Bu katta iqtibos bloki — alohida qatorda
</blockquote>
<q>Bu qisqa ichki iqtibos</q>
<cite>— Muallif ismi</cite>` },
      ],
    },
    {
      type: "code", label: "Tuzilma teglari",
      title: "div, span va Semantik teglar",
      avatarText: "div va span — eng ko'p ishlatiladigan teglar! Semantik teglar esa Google va ekran o'quvchilar uchun muhim.",
      content: [
        { kind: "code", lang: "html", code: `<!-- DIV — blok container (tuzilma uchun) -->
<div class="header">
  <div class="logo">Uzbekas Pixel</div>
  <div class="menu">Menu bu yerda</div>
</div>

<!-- SPAN — inline container (stil berish uchun) -->
<p>Narx: <span style="color:red; font-weight:bold">49 000</span> so'm</p>

<!-- ═══ SEMANTIK TEGLAR (HTML5) ═══ -->
<!-- Google va brauzerlarga ma'no beradi -->

<header>
  <nav>
    <a href="/">Bosh sahifa</a>
    <a href="/kurslar">Kurslar</a>
    <a href="/blog">Blog</a>
  </nav>
</header>

<main>
  <section id="haqimda">
    <h2>Biz haqimizda</h2>
    <p>Uzbekas Pixel — O'zbekistonning yetakchi...</p>
  </section>

  <section id="kurslar">
    <article class="kurs-karta">
      <h3>HTML Asoslar</h3>
      <p>12 ta dars · Bepul</p>
    </article>
    <article class="kurs-karta">
      <h3>CSS & Flexbox</h3>
      <p>13 ta dars · 49 000 so'm</p>
    </article>
  </section>
</main>

<aside>
  <h4>Mashhur kurslar</h4>
  <!-- Yon panel kontenti -->
</aside>

<footer>
  <p>© 2024 Uzbekas Pixel. Barcha huquqlar himoyalangan.</p>
</footer>` },
        { kind: "tip", text: "SEO siri: Google semantic teglarga (article, section, nav) ko'proq e'tibor beradi. div o'rniga semantic teglar ishlating!" },
      ],
    },
    {
      type: "code", label: "Jadval",
      title: "table — Jadval tegi",
      avatarText: "Jadvallar murakkab ko'rinadi, lekin mantiqiy. table, tr, th, td — to'rttasini bilib olsangiz bas!",
      content: [
        { kind: "code", lang: "html", code: `<table border="1" style="border-collapse: collapse; width: 100%">

  <!-- THEAD — jadval sarlavhasi -->
  <thead>
    <tr>
      <th style="padding:10px; background:#e44d26; color:white">Kurs</th>
      <th style="padding:10px; background:#e44d26; color:white">Darslar</th>
      <th style="padding:10px; background:#e44d26; color:white">Narx</th>
      <th style="padding:10px; background:#e44d26; color:white">Daraja</th>
    </tr>
  </thead>

  <!-- TBODY — jadval tanasi -->
  <tbody>
    <tr>
      <td style="padding:10px">HTML Asoslar</td>
      <td style="padding:10px; text-align:center">12</td>
      <td style="padding:10px; color:green">Bepul</td>
      <td style="padding:10px">Boshlang'ich</td>
    </tr>
    <tr style="background:#f9f9f9">
      <td style="padding:10px">CSS & Flexbox</td>
      <td style="padding:10px; text-align:center">13</td>
      <td style="padding:10px">49 000 so'm</td>
      <td style="padding:10px">O'rta</td>
    </tr>
    <tr>
      <td style="padding:10px">JavaScript</td>
      <td style="padding:10px; text-align:center">18</td>
      <td style="padding:10px">89 000 so'm</td>
      <td style="padding:10px">Barcha daraja</td>
    </tr>
  </tbody>

  <!-- TFOOT — jadval yig'indisi -->
  <tfoot>
    <tr>
      <td colspan="3" style="padding:10px; font-weight:bold">Jami kurslar: 3</td>
      <td style="padding:10px">—</td>
    </tr>
  </tfoot>

</table>` },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "Semantik teglar testi",
      avatarText: "Semantik teglarni qancha tushundingiz?",
      content: [
        { kind: "quiz", q: "Navigatsiya menyusi uchun qaysi semantik teg ishlatiladi?", opts: ["<div class='nav'>", "<nav>", "<menu>", "<navigation>"], correct: 1, explanation: "<nav> tegi navigatsiya havolalari uchun semantik belgilash. Bu Google ga sahifaning qaysi qismi menyu ekanligini bildiradi va SEO ni yaxshilaydi." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "Asosiy teglar — Xulosa",
      avatarText: "Juda yaxshi! Siz HTML ning eng muhim teglarini o'rgandingiz. Endi formalar darsiga o'tamiz!",
      content: [
        { kind: "practices", items: [
          "strong/em — semantik, b/i — faqat vizual",
          "div — bloklash, span — inline stil berish",
          "Semantic teglar: header, nav, main, section, article, footer",
          "table: table → thead/tbody/tfoot → tr → th/td",
        ]},
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS KURSI  (courseId: 2)
// ─────────────────────────────────────────────────────────────────────────────
const cssLessons = {

  /* ── CSS Dars 1: CSS nima? ──────────────────────────────────────────────── */
  1: [
    {
      type: "intro", label: "Kirish",
      title: "CSS nima? — Veb dizaynning tili",
      avatarText: "HTML skelet bo'lsa, CSS uning kiyimi! Bugun CSS ning asoslarini o'rganamiz — ranglar, shriftlar, o'lchamlar.",
      content: [
        { kind: "paragraph", html: "<strong>CSS</strong> (Cascading Style Sheets) — HTML elementlariga ko'rinish beruvchi til. Ranglar, shriftlar, joylashuv, animatsiyalar — barchasi CSS bilan." },
        { kind: "highlight", icon: <LuPalette />, label: "CSS imkoniyatlari", text: "Rang · Shrift · O'lcham · Joylashtirish (Flexbox, Grid) · Animatsiya · Responsive dizayn · Shadow · Gradient" },
        { kind: "points", items: [
          "CSS 1996-yilda W3C tomonidan standartlashtirilgan",
          "CSS3 — animatsiyalar, flexbox, grid, custom properties",
          "Brauzer CSS ni kaskad (yuqoridan pastga) tartibida o'qiydi",
          "Bir CSS faylini yuzlab HTML sahifaga ulash mumkin",
          "CSS Preprocessors: Sass, Less — kuchli kengaytmalar",
        ]},
      ],
    },
    {
      type: "code", label: "CSS ulash",
      title: "CSS ni HTML ga ulashning 3 usuli",
      avatarText: "3 usul bor, lekin professional loyihalarda faqat bittasi ishlatiladi. Qaysi biri — hozir bilib olasiz!",
      content: [
        { kind: "code", lang: "html", code: `<!-- ❌ 1. INLINE CSS — faqat test uchun -->
<p style="color: red; font-size: 18px; font-weight: bold;">
  Bu inline stil — qayta ishlatib bo'lmaydi
</p>

<!-- ⚠️ 2. INTERNAL CSS — kichik loyihalar -->
<head>
  <style>
    h1 { color: #264de4; font-size: 2rem; }
    p  { line-height: 1.6; color: #333; }
  </style>
</head>

<!-- ✅ 3. EXTERNAL CSS — professional standart -->
<head>
  <link rel="stylesheet" href="styles.css">
  <!-- yoki bir nechta fayl -->
  <link rel="stylesheet" href="reset.css">
  <link rel="stylesheet" href="components.css">
  <link rel="stylesheet" href="responsive.css">
</head>` },
        { kind: "code", lang: "css", code: `/* styles.css — External CSS fayl */

/* CSS QOIDASI (rule) tuzilmasi:
   selektor { xususiyat: qiymat; }  */

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background-color: #f0f2f5;
  color: #1a1a2e;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

h1 {
  color: #264de4;
  font-size: 2.5rem;       /* rem — root element ga nisbatan */
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
}

.konteyner {
  max-width: 1200px;
  margin: 0 auto;          /* gorizontal markazlash */
  padding: 0 20px;
}` },
      ],
    },
    {
      type: "theory", label: "O'lcham birliklari",
      title: "CSS o'lcham birliklari — px, rem, em, %",
      avatarText: "O'lcham birliklari CSS ning eng chalkash qismi! Lekin men tushuntiraman — oddiy!",
      content: [
        { kind: "code", lang: "css", code: `/* ABSOLYUT BIRLIKLAR */
.element {
  width:  200px;    /* px — piksel, ekran piksellariga to'g'ri */
  border: 1px solid #ccc;
}

/* NISBIY BIRLIKLAR — zamonaviy va responsive */
html { font-size: 16px; }  /* rem asosi */

.matn {
  font-size: 1rem;    /* = 16px (html font-size ga teng) */
  font-size: 1.5rem;  /* = 24px */
  font-size: 0.875rem;/* = 14px */

  font-size: 1em;     /* ota elementning font-size ga nisbatan */

  width: 50%;         /* ota elementning 50% kengligi */
  width: 100vw;       /* viewport (ekran) kengligi 100% */
  height: 100vh;      /* viewport balandligi 100% */
}

/* ZAMONAVIY: min/max/clamp */
.sarlavha {
  font-size: clamp(1.2rem, 3vw, 2.5rem);
  /* min: 1.2rem, maqbul: 3vw, max: 2.5rem */
  /* Ekran o'lchamiga qarab avtomatik moslashadi! */
}` },
        { kind: "highlight", icon: <LuLightbulb />, label: "Tavsiya", text: "Font size uchun rem, margin/padding uchun rem yoki px, layout uchun % yoki fr ishlatish — zamonaviy standart." },
      ],
    },
    {
      type: "code", label: "Ranglar",
      title: "CSS rang qiymatlari — 4 xil usul",
      avatarText: "CSS da rangni 4 xil usulda yozish mumkin. Ularning barchasini bilib olsangiz, dizayn jarayoni juda osonlashadi!",
      content: [
        { kind: "code", lang: "css", code: `/* 1. NAMED COLORS — ismli ranglar (140 ta) */
.element { color: red; background: lightblue; border-color: darkgreen; }

/* 2. HEX — 16lik son (#RRGGBB yoki #RGB) */
.element {
  color:            #264de4;    /* to'q ko'k */
  background-color: #f0f2f5;    /* och kulrang */
  border-color:     #e44d26;    /* CSS qizil-to'q */
  /* Qisqa hex: #fff = #ffffff, #333 = #333333 */
}

/* 3. RGB / RGBA — qizil, yashil, ko'k (+ shaffoflik) */
.element {
  color:            rgb(38, 77, 228);        /* to'q ko'k */
  background-color: rgba(38, 77, 228, 0.1);  /* 10% shaffof */
  border:           1px solid rgba(0,0,0, 0.2);
}

/* 4. HSL / HSLA — rang, to'yinganlik, yorqinlik */
.element {
  color: hsl(225, 73%, 52%);          /* to'q ko'k */
  background: hsl(225, 73%, 52%, 0.1);
}

/* CSS CUSTOM PROPERTIES (o'zgaruvchilar) — PROFESSIONAL ✅ */
:root {
  --asosiy-rang:  #264de4;
  --qo-shimcha:   #e44d26;
  --matn-rang:    #1a1a2e;
  --fon-rang:     #f8fafc;
  --chegara:      #e2e8f0;
}

.tugma {
  background: var(--asosiy-rang);
  color: white;
  border: 2px solid var(--asosiy-rang);
}
.tugma:hover {
  background: transparent;
  color: var(--asosiy-rang);
}` },
        { kind: "tip", text: "CSS Custom Properties (var(--nom)) — bir joyda o'zgartirsangiz, hamma joyda o'zgaradi. Katta loyihalarda shart!" },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "CSS asoslari testi",
      avatarText: "CSS ni qanchalik tushundingiz?",
      content: [
        { kind: "quiz", q: "Professional loyihalarda CSS qanday ulanishi kerak?", opts: ["Inline style atributi bilan", "HTML ichida <style> tegi bilan", "Alohida .css fayl, <link> bilan", "Muhim emas, farqi yo'q"], correct: 2, explanation: "External CSS (.css fayl) — kodni qayta ishlatish, tezlik (kesh), va tartiblilik uchun eng yaxshi usul. Inline CSS faqat JavaScript orqali dinamik stil berganda ishlatiladi." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "CSS kirish darsi yakunlandi!",
      avatarText: "Zo'r natija! CSS asoslarini o'rgandingiz. Keyingi darsda selektorlar — CSS ning eng muhim qismi!",
      content: [
        { kind: "practices", items: [
          "External CSS — professional loyihalarda standart",
          "rem — font uchun, % — layout uchun zamonaviy birlik",
          "HEX (#264de4) va rgba() — eng ko'p ishlatiladigan rang formatlari",
          "CSS Custom Properties (--nom) — katta loyihalarda shart",
        ]},
      ],
    },
  ],

  /* ── CSS Dars 2: Selektorlar ───────────────────────────────────────────── */
  2: [
    {
      type: "intro", label: "Kirish",
      title: "CSS Selektorlar — Elementlarni aniq tanlash",
      avatarText: "Selektor noto'g'ri bo'lsa, stil hech qayerga tushmaydi! Bu dars CSS ning eng muhim qismi.",
      content: [
        { kind: "paragraph", html: "<strong>Selektor</strong> — CSS ga qaysi HTML elementga stil berishini ko'rsatuvchi pattern. To'g'ri selektor = kam kod + yuqori samaradorlik." },
        { kind: "highlight", icon: <LuTarget />, label: "Selektor turlari", text: "Element · Class · ID · Universal · Attribute · Pseudo-class · Pseudo-element · Kombinatsiyalar" },
      ],
    },
    {
      type: "code", label: "Asosiy selektorlar",
      title: "Element, Class, ID selektorlari",
      avatarText: "Bu uchta selektor — CSS kod yozishning 90%ini tashkil qiladi. Ularni yaxshi bilib oling!",
      content: [
        { kind: "code", lang: "css", code: `/* 1. ELEMENT selektor — barcha shu teglar */
p      { color: #444; line-height: 1.6; }
h1     { font-size: 2.5rem; font-weight: 800; }
button { cursor: pointer; border: none; }
a      { text-decoration: none; color: #264de4; }

/* 2. CLASS selektor (. bilan) — bir nechta elementga */
.karta {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.karta-sarlavha { font-size: 1.25rem; font-weight: 700; }
.karta-qizil    { border-left: 4px solid #e44d26; }
.karta-ko-k     { border-left: 4px solid #264de4; }

/* 3. ID selektor (# bilan) — bitta noyob element */
#navigatsiya {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
#asosiy-sarlavha { font-size: 3rem; color: #264de4; }

/* 4. UNIVERSAL selektor (*) — barcha elementlar */
* {
  box-sizing: border-box;   /* professional reset */
  margin: 0;
  padding: 0;
}

/* 5. KO'P SELEKTOR — bir xil stil bir nechta elementga */
h1, h2, h3, h4 {
  font-family: 'Georgia', serif;
  color: #1a1a2e;
  margin-bottom: 0.5em;
}` },
      ],
    },
    {
      type: "code", label: "Kengaytirilgan selektorlar",
      title: "Attribute, Pseudo-class, Pseudo-element",
      avatarText: "Bu selektorlar professional kod yozishda juda ko'p ishlatiladigan kuchli vositalar!",
      content: [
        { kind: "code", lang: "css", code: `/* ATTRIBUTE selektorlar */
input[type="text"]     { border: 1px solid #ccc; border-radius: 6px; }
input[type="password"] { font-size: 1.2rem; letter-spacing: 2px; }
a[href^="https"]       { color: green; }   /* https bilan boshlanadi */
a[href$=".pdf"]        { color: red; }     /* .pdf bilan tugaydi */
img[alt]               { border: 2px solid green; }  /* alt bor */

/* PSEUDO-CLASS — element holati */
a:hover         { color: #e44d26; text-decoration: underline; }
a:active        { color: #c0392b; }
a:visited       { color: purple; }
input:focus     { outline: 2px solid #264de4; border-color: #264de4; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

/* Tuzilma pseudo-class */
li:first-child    { font-weight: bold; }
li:last-child     { border-bottom: none; }
li:nth-child(2n)  { background: #f5f5f5; }    /* juft qatorlar */
li:nth-child(odd) { background: white; }       /* toq qatorlar */
p:not(.maxsus)    { color: #666; }             /* .maxsus emas */

/* PSEUDO-ELEMENT — element qismi */
p::first-letter   { font-size: 2em; font-weight: bold; float: left; }
p::first-line     { font-weight: 600; }
.karta::before    {
  content: "⭐ ";
  color: gold;
}
.karta::after     {
  content: "";
  display: block;
  height: 2px;
  background: linear-gradient(to right, #264de4, transparent);
  margin-top: 16px;
}` },
      ],
    },
    {
      type: "code", label: "Kombinatsiyalar",
      title: "Selektor kombinatsiyalari",
      avatarText: "Kombinatsiyalar — aniq elementlarni tanlashning kuchli usuli. Ularni bilsangiz istalgan elementni topa olasiz!",
      content: [
        { kind: "code", lang: "css", code: `/* AVLOD (descendant) — bo'shliq */
.nav a          { color: white; font-weight: 600; }
/* .nav ichidagi BARCHA a lar (chuqur ichki ham) */

/* TO'G'RIDAN-TO'G'RI FARZAND (child) — > belgisi */
.list > li      { list-style: none; padding: 8px; }
/* faqat to'g'ridan-to'g'ri li farzandlar */

/* QARDOSH (adjacent sibling) — + belgisi */
h2 + p          { font-size: 1.1rem; color: #666; margin-top: 0; }
/* h2 dan KEYINGI birinchi p */

/* UMUMIY QARDOSH (general sibling) — ~ belgisi */
h2 ~ p          { line-height: 1.8; }
/* h2 dan keyingi BARCHA p lar */

/* AMALIY MISOL: Navigatsiya menyusi */
.nav            { display: flex; gap: 8px; }
.nav > ul       { list-style: none; display: flex; gap: 4px; }
.nav > ul > li  { position: relative; }
.nav > ul > li > a {
  padding: 10px 16px;
  border-radius: 6px;
  color: #333;
  transition: background 0.2s;
}
.nav > ul > li > a:hover {
  background: #264de420;
  color: #264de4;
}
/* Dropdown: hover bo'lganda */
.nav > ul > li:hover .dropdown {
  display: block;
}` },
      ],
    },
    {
      type: "theory", label: "Specificity",
      title: "Specificity — CSS ustuvorlik hisoblash",
      avatarText: "Bu qismni tushunmasangiz, CSS da 'nima uchun ishlamayapti' deb qiynalasiz. Diqqat bilan ko'ring!",
      content: [
        { kind: "paragraph", html: "<strong>Specificity</strong> — brauzer qaysi CSS qoidasi ustun kelishini aniqlash uchun hisoblash tizimi. Har bir selektorda 'ball' bor." },
        { kind: "code", lang: "css", code: `/* SPECIFICITY HISOBLASH:
   [inline] [ID] [class/attr/pseudo-class] [element]

   inline style  → 1,0,0,0  (1000 ball)
   #id           → 0,1,0,0  (100 ball)
   .class        → 0,0,1,0  (10 ball)
   [attr]        → 0,0,1,0  (10 ball)
   :pseudo-class → 0,0,1,0  (10 ball)
   element       → 0,0,0,1  (1 ball)
   *             → 0,0,0,0  (0 ball)
*/

/* 1 ball */
p { color: red; }

/* 10 ball — ustun keladi */
.matn { color: blue; }

/* 11 ball */
p.matn { color: green; }

/* 100 ball — hammadan ustun */
#sarlavha { color: purple; }

/* 110 ball */
#sarlavha.matn { color: orange; }

/* !important — BARCHA qoidalarni yengadi (oxirgi chora) */
p { color: red !important; }
/* ⚠️ !important ni faqat uchinchi taraf CSS ni override qilganda */` },
        { kind: "tip", text: "Qoida: Spesifik selektor yozing, !important ishlatmang. Agar !important kerak bo'lsa — CSS arxitekturangizda muammo bor." },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "Selektorlar testi",
      avatarText: "Specificity ni tushundingizmi?",
      content: [
        { kind: "quiz", q: "Qaysi selektor ENG YUQORI ustuvorlikka ega?", opts: ["p { color: red; }", ".matn { color: blue; }", "#sarlavha { color: green; }", "p.matn { color: orange; }"], correct: 2, explanation: "#sarlavha — ID selektor 100 ball, .matn class 10 ball, p element 1 ball. Shuning uchun #sarlavha eng yuqori ustuvorlikka ega." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "Selektorlar — Xulosa",
      avatarText: "CSS selektorlarni o'zgandingiz! Keyingi darsda Box Model — CSS ning eng fundamental tushunchasi.",
      content: [
        { kind: "practices", items: [
          "Class selektor (.) — ko'p elementlarga, qayta ishlatiladi",
          "ID selektor (#) — bitta noyob elementga",
          "Pseudo-class (:hover) — element holati uchun",
          "Pseudo-element (::before) — element qismlari uchun",
          "Specificity: inline > ID > class > element",
        ]},
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// JAVASCRIPT KURSI  (courseId: 3)
// ─────────────────────────────────────────────────────────────────────────────
const jsLessons = {

  /* ── JS Dars 1: JavaScript nima? ─────────────────────────────────────────── */
  1: [
    {
      type: "intro", label: "Kirish",
      title: "JavaScript — Vebning eng kuchli tili",
      avatarText: "HTML skelet, CSS kiyim, JavaScript esa RUH! Bugun veb sahifalarni jonlantiruvchi til bilan tanishamiz.",
      content: [
        { kind: "paragraph", html: "<strong>JavaScript</strong> (JS) — 1995-yilda yaratilgan, hozirda <em>dunyodagi eng mashhur dasturlash tili</em> (#1 GitHub statistikasi). Brauzerda, serverde (Node.js), mobil (React Native) va hatto robotiкada ishlaydi." },
        { kind: "highlight", icon: <LuZap />, label: "JS bilan nima qilish mumkin?", text: "DOM boshqarish · Forma validatsiyasi · API so'rovlar · Real-time chat · O'yinlar · Animatsiyalar · Mobile app · Server (Node.js)" },
        { kind: "points", items: [
          "Interpreted til — compile qilmasdan brauzerda ishlaydi",
          "Dinamik tiplar — o'zgaruvchi turini e'lon qilmasdan",
          "Prototype-based OOP — sinflar ES6+ da qo'shildi",
          "Async/Await — asinxron operatsiyalar uchun",
          "ECMAScript standarti — har yil yangi versiya (ES2024)",
        ]},
      ],
    },
    {
      type: "code", label: "Birinchi kod",
      title: "JavaScript ni HTML ga ulash",
      avatarText: "JavaScript ni HTML ga ulashning 3 usuli bor. Qaysi biri to'g'ri — hozir bilib olasiz!",
      content: [
        { kind: "code", lang: "html", code: `<!-- ❌ 1. INLINE — atribut ichida (yomon amaliyot) -->
<button onclick="alert('Bosildi!')">Bosing</button>

<!-- ⚠️ 2. INTERNAL — <script> tegi HTML ichida -->
<body>
  <h1 id="sarlavha">Salom!</h1>
  <button id="btn">O'zgartir</button>

  <!-- ✅ </body> dan OLDIN yozing — muhim! -->
  <script>
    const btn = document.getElementById('btn');
    btn.addEventListener('click', function() {
      document.getElementById('sarlavha').textContent = 'O\\'zgartildi!';
    });
  </script>
</body>

<!-- ✅ 3. EXTERNAL — alohida .js fayl (professional standart) -->
<body>
  <!-- HTML kontent -->
  <script src="script.js"></script>  <!-- oxirida -->
</body>

<!-- YOKI: defer bilan head da ham bo'ladi -->
<head>
  <script src="script.js" defer></script>
  <!-- defer — HTML to'liq yuklanguncha kutadi -->
</head>` },
      ],
    },
    {
      type: "code", label: "Console",
      title: "Browser Console — Dasturchi eng yaxshi do'sti",
      avatarText: "Console — JavaScript o'rganishda SHART bo'lgan vosita. F12 bosing va dunyo ochiladi!",
      content: [
        { kind: "code", lang: "js", code: `// Browser Console: F12 → Console tab

// ── ASOSIY METODLAR ──
console.log("Oddiy chiqaruv");
console.warn("⚠️ Ogohlantirish");
console.error("❌ Xato xabari");
console.info("ℹ️ Ma'lumot");

// ── FORMATLANGAN CHIQARUV ──
const ism = "Kamoliddin";
const yosh = 22;
console.log("Ism:", ism, "| Yosh:", yosh);
console.log(\`\${ism} \${yosh} yoshda\`);   // template literal, \${...} qismi bilan!

// ── OB'EKT VA MASSIV ──
const foydalanuvchi = { ism: "Dilnoza", yosh: 21 };
console.log(foydalanuvchi);         // ob'ekt ko'rinishida
console.table([                     // chiroyli jadvalda
  { ism: "Ali", yosh: 20 },
  { ism: "Vali", yosh: 22 },
]);

// ── HISOBLASH VAQTI ──
console.time("hisob");
for (let i = 0; i < 1_000_000; i++) {}
console.timeEnd("hisob");           // hisob: 3.2ms

// ── GURUHLASH ──
console.group("Foydalanuvchi ma'lumotlari");
console.log("Ism:", ism);
console.log("Yosh:", yosh);
console.groupEnd();

// ── TEKSHIRISH ──
console.assert(yosh >= 18, "Voyaga yetmagan!");
// assert(shart, xabar) — shart false bo'lsa xato chiqaradi` },
        { kind: "tip", text: "console.log ni o'rniga VS Code debugger ishlatishni o'rganing — professional daraja!" },
      ],
    },
    {
      type: "theory", label: "typeof",
      title: "Ma'lumot turlari va typeof operatori",
      avatarText: "JavaScript da 8 ta asosiy tip bor. typeof operatori ularni aniqlashda yordam beradi.",
      content: [
        { kind: "code", lang: "js", code: `// JavaScript ning 8 ta tipi:

// 1. string — matn
typeof "salom"          // "string"
typeof 'bitta qo\\'shtirnoq' // "string"
typeof \`template\`       // "string"

// 2. number — barcha sonlar (butun va kasr)
typeof 42               // "number"
typeof 3.14             // "number"
typeof Infinity         // "number"
typeof NaN              // "number" (Not a Number — ajib!)

// 3. boolean — ha/yo'q
typeof true             // "boolean"
typeof false            // "boolean"

// 4. undefined — aniqlanmagan
typeof undefined        // "undefined"
let x;
typeof x                // "undefined"

// 5. null — bo'sh (qasdan)
typeof null             // "object" ← JS ning mashxur xatosi!

// 6. object — ob'ekt
typeof { ism: "Ali" }   // "object"
typeof [1, 2, 3]        // "object" (massiv ham object!)
typeof null             // "object" (tarixiy xato)

// 7. function
typeof function() {}    // "function"
typeof console.log      // "function"

// 8. symbol (ES6)
typeof Symbol("id")     // "symbol"

// MASSIVNI TO'G'RI TEKSHIRISH:
Array.isArray([1,2,3])  // true ✅
Array.isArray({a: 1})   // false` },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "JavaScript asoslari testi",
      avatarText: "O'rganganlaringizni sinab ko'ramiz!",
      content: [
        { kind: "quiz", q: "JavaScript ni professional ulash uchun qaysi usul ishlatiladi?", opts: ["onclick atribut bilan", "HTML ichida <script> tegi", "<script src='...' defer> head ichida", "CSS fayl ichida"], correct: 2, explanation: "<script src='script.js' defer> — head ichida, defer atribut bilan. Bu HTML to'liq yuklanguncha JS ni kechiktiradi. </body> oldida src ham yaxshi, lekin defer zamonaviy standart." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "JS 1-dars yakunlandi!",
      avatarText: "Ajoyib! JavaScript asoslarini o'rgandingiz. Keyingi darsda o'zgaruvchilar!",
      content: [
        { kind: "practices", items: [
          "External JS (script.js) + defer — professional standart",
          "console.log — debug qilishning asosiy usuli",
          "typeof — ma'lumot turini aniqlash",
          "null ning typeof 'object' — JS ning tarixiy xatosi, yodda saqlang!",
        ]},
      ],
    },
  ],

  /* ── JS Dars 2: O'zgaruvchilar ──────────────────────────────────────────── */
  2: [
    {
      type: "intro", label: "Kirish",
      title: "O'zgaruvchilar — Ma'lumotni xotiraga saqlash",
      avatarText: "O'zgaruvchilar — dasturlashning eng asosiy tushunchasi! Ularni bilmasdan dastur yozib bo'lmaydi.",
      content: [
        { kind: "paragraph", html: "<strong>O'zgaruvchi</strong> — ma'lumotni saqlash uchun kompyuter xotirasida nom berilgan joy. JavaScript da uch kalit so'z bor: <code>let</code>, <code>const</code>, <code>var</code>." },
        { kind: "highlight", icon: <LuDiamond />, label: "Asosiy qoida", text: "const — o'zgarmaydigan (default tanlov) | let — o'zgaradigan | var — ISHLATMANG (ES6 dan oldin)" },
      ],
    },
    {
      type: "code", label: "let vs const",
      title: "let, const, var — Farqlari va qoidalari",
      avatarText: "const va let — zamonaviy JavaScript. Qoidani bilib olsangiz, hech qachon adashmaydisiz!",
      content: [
        { kind: "code", lang: "js", code: `// ── CONST — qiymati o'zgarmaydigan ──
const PI             = 3.14159265;
const SAYT_NOMI      = "Uzbekas Pixel";
const MAX_FOYDALANUVCHI = 10_000;   // _ — raqamni o'qishga qulay qiladi
const RANGLAR        = ["qizil", "ko'k", "yashil"];

// CONST BILAN MUAMMO:
// PI = 3.15;        // ❌ TypeError: Assignment to constant
// SAYT_NOMI = "boshqa"; // ❌ xato

// Lekin ob'ekt va massiv ichini o'zgartirish MUMKIN:
const foydalanuvchi = { ism: "Ali", yosh: 20 };
foydalanuvchi.yosh = 21;      // ✅ bu mumkin
foydalanuvchi.email = "ali@mail.uz"; // ✅ bu ham mumkin
// foydalanuvchi = {};        // ❌ bu mumkin emas

// ── LET — o'zgaradigan qiymat ──
let hisob        = 0;
let foydalanuvchi_ismi = "Mehribon";
let kirgan       = false;

// LET ni o'zgartirish:
hisob = hisob + 1;    // ✅
hisob++;              // ✅ qisqacha
foydalanuvchi_ismi = "Dilnoza"; // ✅
kirgan = true;        // ✅

// ── VAR — ISHLATMANG ──
var eski = "bu yerga qaramang";
// var — function scope, hoisting muammolari bor
// let/const ES6 da hoisting muammosini hal qildi

// ── NAMING CONVENTION ──
// camelCase — JS standarti
let foydalanuvchiIsmi = "Ali";      // ✅
let maksimalNarx      = 1_000_000;  // ✅
const MAX_URINISH     = 3;          // CONST uchun UPPER_SNAKE_CASE

// ❌ Yomon nomlar:
let x = "Ali";          // nima ekanligini bilmaymiz
let data = 42;          // qaysi data?
let temp = true;        // temp nima?

// ✅ Yaxshi nomlar:
let foydalanuvchiNomi  = "Ali";
let mahsulotNarxi      = 42_000;
let loginQilingan      = true;` },
      ],
    },
    {
      type: "code", label: "Ma'lumot turlari",
      title: "JavaScript ma'lumot turlari — Amaliy ko'rish",
      avatarText: "Har bir tipning o'z xususiyatlari bor. Ularni bilib olsangiz, xatolar kamayadi!",
      content: [
        { kind: "code", lang: "js", code: `// ── STRING — matn ──
const ism        = "Sardor";
const salomlash  = 'Xayrli kun!';
const habar      = \`Salom, \${ism}! Bugun \${new Date().toLocaleDateString('uz-UZ')}\`;

// String metodlari — ENG MUHIMLARI
"  salom  ".trim()          // "salom" — bo'shliqlarni olib tashlaydi
"KATTA".toLowerCase()       // "katta"
"kichik".toUpperCase()      // "KICHIK"
"uzbekas pixel".includes("pixel")  // true
"uzbekas".startsWith("uz")        // true
"uzbekas".endsWith("as")          // true
"ha ha ha".replace("ha", "yo")    // "yo ha ha"
"ha ha ha".replaceAll("ha", "yo") // "yo yo yo"
"a,b,c".split(",")                // ["a", "b", "c"]
["a","b","c"].join("-")           // "a-b-c"
"uzbekas".slice(0, 3)             // "uzb"
"uzbekas".length                  // 7

// ── NUMBER — sonlar ──
const yosh   = 25;
const narx   = 49_000.50;
const manfiy = -5;

// Math ob'ekti
Math.round(3.7)    // 4 — yaxlitlash
Math.floor(3.9)    // 3 — pastga yaxlitlash
Math.ceil(3.1)     // 4 — yuqoriga yaxlitlash
Math.abs(-5)       // 5 — mutlaq qiymat
Math.max(3, 7, 2)  // 7 — maksimum
Math.min(3, 7, 2)  // 2 — minimum
Math.random()      // 0 dan 1 gacha tasodifiy son
Math.pow(2, 10)    // 1024 — darajaga ko'tarish
Math.sqrt(16)      // 4 — kvadrat ildiz
(49000).toFixed(2) // "49000.00"

// String → Number konvertatsiya
Number("42")       // 42
parseInt("42px")   // 42
parseFloat("3.14") // 3.14
+"42"              // 42 (unary +)

// ── BOOLEAN ──
const kirdi    = true;
const chiqdi   = false;
const katta    = 18 > 15;    // true
const teng     = "a" === "a"; // true

// ── NULL va UNDEFINED ──
let hozirda_foydalanuvchi = null;   // qasdan bo'sh
let hali_aniqlanmagan;              // undefined (e'lon, lekin qiymat yo'q)

// ── OBJECT ──
const kurs = {
  id: 1,
  nomi: "HTML Asoslar",
  narx: 0,
  bepul: true,
  o_quvchilar: 3240,
  teglar: ["html", "veb", "frontend"],
};
console.log(kurs.nomi);           // "HTML Asoslar"
console.log(kurs["narx"]);        // 0
console.log(kurs.teglar[0]);      // "html"

// ── ARRAY — tartibli ro'yxat ──
const kurslar = ["HTML", "CSS", "JavaScript", "React"];
kurslar[0]            // "HTML" — birinchi element (0 dan boshlanadi)
kurslar.length        // 4 — uzunlik
kurslar.push("Node")  // oxiriga qo'shish
kurslar.pop()         // oxirgisini olib tashlash
kurslar.includes("CSS") // true` },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "O'zgaruvchilar testi",
      avatarText: "O'zgaruvchilar va tiplarni qancha yaxshi tushundingiz?",
      content: [
        { kind: "quiz", q: "Qachon LET emas, CONST ishlatish kerak?", opts: ["Hisoblagich (++, -- bo'ladi)", "Foydalanuvchi kiritgan ma'lumot", "API URL, sayt nomi, matematik konstantalar", "For loop iterator (i = 0)"], correct: 2, explanation: "const — qiymati hech qachon o'zgarmaydigan narsalar uchun: API URL, matematik konstantalar (PI), konfiguratsiya qiymatlari. Bu kodni aniqroq va xatolardan himoyalanganroq qiladi." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "O'zgaruvchilar — Xulosa",
      avatarText: "O'zgaruvchilar va ma'lumot turlarini o'zgandingiz! Keyingi darsda operatorlar va shartlar!",
      content: [
        { kind: "practices", items: [
          "const — o'zgarmaydigan, let — o'zgaradigan, var — ishlatmang",
          "camelCase nom qo'yish — JavaScript standarti",
          "String metodlari: trim(), split(), includes(), slice()",
          "Math ob'ekti: round(), floor(), ceil(), random(), max()",
          "Number() va parseInt() — string ni songa aylantirish",
        ]},
      ],
    },
  ],

  /* ── JS Dars 5: Funksiyalar ─────────────────────────────────────────────── */
  5: [
    {
      type: "intro", label: "Kirish",
      title: "Funksiyalar — Kodni qayta ishlatiladigan qilish",
      avatarText: "Funksiyalar — dasturlashning eng kuchli vositasi! DRY prinsipi: Don't Repeat Yourself — bir marta yoz, ko'p marta ishlat!",
      content: [
        { kind: "paragraph", html: "<strong>Funksiya</strong> — ma'lum bir vazifani bajaradigan, nomlangan kod bloki. Funksiyani bir marta yozib, istalgan joyda chaqirish mumkin." },
        { kind: "highlight", icon: <LuSmartphone />, label: "DRY Prinsipi", text: "Don't Repeat Yourself — bir xil kodni ikki marta yozma. Funksiya qil, qayta ishlat!" },
        { kind: "points", items: [
          "Single Responsibility — bitta funksiya bitta vazifani bajarsın",
          "Yaxshi funksiya 5-20 qator bo'ladi",
          "Nomi fe'l bilan boshlansin: getUserById, calculateTotal, validateEmail",
          "Pure function — tashqi o'zgaruvchilarga bog'liq bo'lmasin (ideal)",
        ]},
      ],
    },
    {
      type: "code", label: "Funksiya turlari",
      title: "4 xil funksiya yozish usuli",
      avatarText: "JavaScript da funksiya yozishning 4 usuli bor. Arrow function — zamonaviy va keng tarqalgan!",
      content: [
        { kind: "code", lang: "js", code: `// ── 1. FUNCTION DECLARATION ──
// Hoisting bor — chaqirishdan OLDIN ham ishlaydi
function salomlash(ism) {
  return \`Salom, \${ism}! Uzbekas Pixel ga xush kelibsiz!\`;
}

// Chaqirish oldin ham bo'ladi (hoisting):
console.log(salomlash("Malika")); // ishlaydi!

// ── 2. FUNCTION EXPRESSION ──
// Hoisting YO'Q — faqat e'londan keyin chaqiriladi
const kvadrat = function(son) {
  return son * son;
};
console.log(kvadrat(7)); // 49

// ── 3. ARROW FUNCTION (ES6) — zamonaviy ✅ ──
// Bir qatorli — return va {} shart emas
const ikkilantir   = (son) => son * 2;
const qo_shish     = (a, b) => a + b;
const salomlash2   = ism => \`Salom, \${ism}!\`; // bitta param — () ham shart emas

// Ko'p qatorli arrow function
const sonTekshir = (son) => {
  if (son > 0) return "musbat ➕";
  if (son < 0) return "manfiy ➖";
  return "nol ⭕";
};

// ── 4. IMMEDIATELY INVOKED FUNCTION EXPRESSION (IIFE) ──
// Yaratilishi bilanoq chaqiriladi — scope izolyatsiyasi uchun
(function() {
  const maxfiy = "Bu o'zgaruvchiga tashqaridan kira olmaysiz";
  console.log("IIFE ishladi!");
})();

// Arrow IIFE:
(() => {
  console.log("Arrow IIFE");
})();` },
      ],
    },
    {
      type: "code", label: "Parametrlar",
      title: "Parametrlar — Default, Rest, Destructuring",
      avatarText: "Zamonaviy JS da parametrlar bilan ishlashning kuchli usullari. Ularni bilib olsangiz kod juda qisqaradi!",
      content: [
        { kind: "code", lang: "js", code: `// ── DEFAULT PARAMETRLAR ──
const tabriknoma = (ism, voqea = "tug'ilgan kun", emoji = "🎉") => {
  return \`\${ism} ga \${voqea} bilan tabrik! \${emoji}\`;
};
console.log(tabriknoma("Jasur"));
// "Jasur ga tug'ilgan kun bilan tabrik! 🎉"
console.log(tabriknoma("Nodira", "yangi yil", "🎆"));
// "Nodira ga yangi yil bilan tabrik! 🎆"

// ── REST PARAMETRLAR (...args) ──
// Cheksiz sondagi argumentlar
const yig_indi = (...sonlar) => {
  return sonlar.reduce((jam, son) => jam + son, 0);
};
console.log(yig_indi(1, 2, 3));        // 6
console.log(yig_indi(10, 20, 30, 40)); // 100

const birinchi = (bosh, ...qolgan) => {
  console.log("Birinchi:", bosh);    // "a"
  console.log("Qolganlar:", qolgan); // ["b", "c", "d"]
};
birinchi("a", "b", "c", "d");

// ── DESTRUCTURING PARAMETRLAR ──
// Ob'ekt parametr — nomli argumentlar
const foydalanuvchi_ko_rsat = ({ ism, yosh, email = "yo\\'q" }) => {
  return \`\${ism} (\${yosh} yosh) — \${email}\`;
};
const user = { ism: "Zulfiya", yosh: 24, email: "z@mail.uz" };
console.log(foydalanuvchi_ko_rsat(user));

// Massiv destructuring
const [birinchi_son, ikkinchi_son, ...qolgan_sonlar] = [1, 2, 3, 4, 5];
console.log(birinchi_son);   // 1
console.log(qolgan_sonlar);  // [3, 4, 5]

// ── CALLBACK FUNKSIYA ──
const sonlar = [5, 3, 8, 1, 9, 2];
const saralangan = sonlar.sort((a, b) => a - b);
console.log(saralangan); // [1, 2, 3, 5, 8, 9]

const juftlar = sonlar.filter(son => son % 2 === 0);
console.log(juftlar);    // [8, 2]

const ikkilashgan = sonlar.map(son => son * 2);
console.log(ikkilashgan); // [10, 6, 16, 2, 18, 4]` },
      ],
    },
    {
      type: "code", label: "Closure va Scope",
      title: "Scope va Closure — Ilg'or tushunchalar",
      avatarText: "Bu qism biroz murakkab, lekin muhim! Closure JS da eng kuchli pattern.",
      content: [
        { kind: "code", lang: "js", code: `// ── SCOPE (Ko'rinish doirasi) ──

// Global scope — hamma joyda ko'rinadi
const globalNom = "Global";

function misol() {
  // Function scope — faqat funksiya ichida
  const lokalNom = "Lokal";
  console.log(globalNom); // ✅ ko'rinadi
  console.log(lokalNom);  // ✅ ko'rinadi

  if (true) {
    // Block scope — {} ichida (let/const bilan)
    let blokNom = "Blok";
    const blokConst = "Blok Const";
    console.log(lokalNom); // ✅ ko'rinadi
  }
  // console.log(blokNom); // ❌ ReferenceError
}
// console.log(lokalNom); // ❌ ReferenceError

// ── CLOSURE — funksiya o'z tashqi o'zgaruvchilarini eslab qoladi ──
function hisoblagichYarat(boshlangichQiymat = 0) {
  let hisob = boshlangichQiymat; // bu o'zgaruvchi "yopiladi"

  return {
    oshir:     () => ++hisob,
    kamayt:    () => --hisob,
    reset:     () => { hisob = boshlangichQiymat; },
    qiymat:    () => hisob,
  };
}

const hisoblagich1 = hisoblagichYarat(0);
const hisoblagich2 = hisoblagichYarat(100);

hisoblagich1.oshir();  // 1
hisoblagich1.oshir();  // 2
hisoblagich1.oshir();  // 3
hisoblagich2.oshir();  // 101

// Ikkalasi mustaqil! Closure ajralib turadi:
console.log(hisoblagich1.qiymat()); // 3
console.log(hisoblagich2.qiymat()); // 101` },
        { kind: "tip", text: "Closure — factory function, module pattern va React Hooks ning asosi. Yaxshi tushunish ilg'or JS uchun shart!" },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "Funksiyalar testi",
      avatarText: "Funksiyalarni qancha tushundingiz?",
      content: [
        { kind: "quiz", q: "Arrow function qaysi ko'rinishda to'g'ri?", opts: ["function => (a, b) { return a + b }", "const yig => (a, b) => a + b", "const yig'indi = (a, b) => a + b;", "arrow yig'indi(a, b) { return a + b }"], correct: 2, explanation: "To'g'ri: const yig'indi = (a, b) => a + b; — const bilan e'lon, keyin (parametrlar), => belgisi, va ifoda. Bir qatorli arrow function da return va {} shart emas." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "Funksiyalar — Xulosa",
      avatarText: "Funksiyalarni o'zgandingiz! Keyingi darsda arrow functions va callback chuqurroq.",
      content: [
        { kind: "practices", items: [
          "Arrow function — zamonaviy, qisqa, ko'p ishlatiladigan",
          "Default parametrlar — argumentni berilmasa standart qiymat",
          "Rest (...args) — cheksiz argumentlar massiv sifatida",
          "Closure — funksiya tashqi o'zgaruvchilarni eslab qoladi",
          "DRY — takrorlanmas kod, qayta ishlatishga qulay funksiyalar",
        ]},
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// REACT KURSI  (courseId: 4)
// ─────────────────────────────────────────────────────────────────────────────
const reactLessons = {

  /* ── React Dars 1: React nima? ──────────────────────────────────────────── */
  1: [
    {
      type: "intro", label: "Kirish",
      title: "React.js — Zamonaviy UI kutubxonasi",
      avatarText: "React — dunyodagi eng mashhur frontend kutubxona! Meta (Facebook) tomonidan yaratilgan va milyonlab dasturchilar ishlatadi.",
      content: [
        { kind: "paragraph", html: "<strong>React.js</strong> — foydalanuvchi interfeyslari (UI) yaratish uchun JavaScript kutubxonasi. 2013-yilda Facebook tomonidan ochiq-manbali qilingan." },
        { kind: "highlight", icon: <LuAtom />, label: "Nima uchun React?", text: "Component-based · Virtual DOM (tez) · JSX · Dev Tools · Ulkan ekotizim · Ko'p ish o'rinlari" },
        { kind: "points", items: [
          "Meta, Netflix, Airbnb, Uber, Twitter — React ishlatadi",
          "Virtual DOM — faqat o'zgargan qismni yangilaydi (2-10x tez!)",
          "Component — qayta ishlatiladigan UI bloki",
          "React Native — bir kod, iOS + Android",
          "Next.js — React bilan full-stack",
        ]},
      ],
    },
    {
      type: "code", label: "O'rnatish",
      title: "Vite bilan React loyihasini boshlash",
      avatarText: "Vite — 2021-yildan React standart o'rnatish vositasi. Create React App eski, Vite tezroq!",
      content: [
        { kind: "code", lang: "js", code: `// ── TERMINAL DA BAJARING ──

// 1. Vite bilan React loyiha yarating
npm create vite@latest uzbekas-loyiha -- --template react

// 2. Loyiha papkasiga kiring
cd uzbekas-loyiha

// 3. Paketlarni o'rnating
npm install

// 4. Dev serverni ishga tushiring
npm run dev
// → http://localhost:5173 da ochiladi

// ── LOYIHA TUZILMASI ──
uzbekas-loyiha/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/         ← rasmlar, fontlar
│   ├── components/     ← qayta ishlatiladigan komponentlar
│   ├── pages/          ← sahifalar
│   ├── App.jsx         ← asosiy komponent
│   ├── App.css
│   └── main.jsx        ← kirish nuqtasi
├── index.html          ← asosiy HTML
├── vite.config.js      ← Vite konfiguratsiya
└── package.json        ← paketlar ro'yxati

// ── MUHIM BUYRUQLAR ──
// npm run dev     → ishlab chiqish (hot reload)
// npm run build   → production uchun yig'ish (/dist)
// npm run preview → yig'ilganni ko'rish
// npm run lint    → kod sifatini tekshirish` },
      ],
    },
    {
      type: "code", label: "Birinchi komponent",
      title: "Birinchi React komponentingiz",
      avatarText: "Komponent — React ning asosi! Har bir tugma, karta, modal — alohida komponent. Keling yozamiz!",
      content: [
        { kind: "code", lang: "jsx", code: `// src/App.jsx

import { useState } from 'react';
import './App.css';

// ── KOMPONENT — Katta harf bilan boshlanishi SHART ──
function App() {

  // ── STATE — komponentning xotirasi ──
  const [hisob, setHisob]     = useState(0);
  const [nomi, setNomi]       = useState("Mehmon");
  const [korinadi, setKorinadi] = useState(true);

  // ── EVENT HANDLER FUNKSIYALAR ──
  const oshirish     = () => setHisob(prev => prev + 1);
  const kamaytirish  = () => setHisob(prev => Math.max(0, prev - 1));
  const togglash     = () => setKorinadi(prev => !prev);

  // ── JSX QAYTARISH ──
  return (
    <div className="app">
      <h1>⚛️ Uzbekas React Demo</h1>

      {/* Shartli render */}
      {korinadi && (
        <div className="karta">
          <p>Salom, <strong>{nomi}</strong>! 👋</p>

          {/* Hisob ko'rsatish */}
          <div className="hisob-blok">
            <button onClick={kamaytirish} disabled={hisob === 0}>➖</button>
            <span className={hisob > 5 ? "son katta" : "son"}>{hisob}</span>
            <button onClick={oshirish}>➕</button>
          </div>

          <p>
            {hisob === 0 && "Boshlash uchun + bosing"}
            {hisob > 0 && hisob <= 5 && \`Siz \${hisob} marta bosdingiz 👍\`}
            {hisob > 5 && "Zo'r! 5 dan oshdi! 🔥"}
          </p>
        </div>
      )}

      {/* Ism kiritish */}
      <input
        value={nomi}
        onChange={(e) => setNomi(e.target.value)}
        placeholder="Ismingizni kiriting..."
      />
      <button onClick={togglash}>
        {korinadi ? "Yashirish 👁️" : "Ko'rsatish 👁️"}
      </button>
    </div>
  );
}

export default App;` },
        { kind: "highlight", icon: "🔑", label: "JSX qoidalari", text: "class → className | for → htmlFor | {} ichida JS ifodalar | return ichida bitta element | Self-closing: <img /> <br />" },
      ],
    },
    {
      type: "code", label: "Props",
      title: "Props — Komponentlar orasida ma'lumot uzatish",
      avatarText: "Props — ota komponentdan bola komponentga ma'lumot uzatish usuli. React ning eng muhim tushunchalaridan biri!",
      content: [
        { kind: "code", lang: "jsx", code: `// ── PROPS MISOLI ──

// 1. Bola komponent — props qabul qiladi
function KursKarta({ nomi, narx, daraja, emoji = <LuBook /> }) {
  return (
    <div style={{
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "12px",
    }}>
      <h3>{emoji} {nomi}</h3>
      <p>Daraja: <strong>{daraja}</strong></p>
      <p style={{ color: narx === 0 ? "green" : "#264de4", fontWeight: "bold" }}>
        {narx === 0 ? "🆓 Bepul" : \`💰 \${narx.toLocaleString()} so'm\`}
      </p>
    </div>
  );
}

// 2. Ota komponent — props uzatadi
function App() {
  const kurslar = [
    { id: 1, nomi: "HTML Asoslar",     narx: 0,       daraja: "Boshlang'ich", emoji: <LuGlobe /> },
    { id: 2, nomi: "CSS & Flexbox",    narx: 49000,   daraja: "O'rta",        emoji: <LuPalette /> },
    { id: 3, nomi: "JavaScript",       narx: 89000,   daraja: "Barcha daraja",emoji: <LuZap /> },
    { id: 4, nomi: "React.js",         narx: 120000,  daraja: "O'rta-Yuqori", emoji: <LuAtom /> },
  ];

  return (
    <div>
      <h1>📖 Kurslarimiz</h1>
      {/* Massivni map bilan render qilish */}
      {kurslar.map((kurs) => (
        <KursKarta
          key={kurs.id}          {/* key — SHART, massiv uchun */}
          nomi={kurs.nomi}
          narx={kurs.narx}
          daraja={kurs.daraja}
          emoji={kurs.emoji}
        />
      ))}
    </div>
  );
}` },
        { kind: "tip", text: "key prop — massivda har bir element uchun SHART. React uni tez yangilash uchun ishlatadi. ID ishlatish eng yaxshi — index emas!" },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "React asoslari testi",
      avatarText: "React ni qancha tushundingiz?",
      content: [
        { kind: "quiz", q: "React komponent nomini qanday yozish SHART?", opts: ["kichik harf: myComponent", "Katta harf: MyComponent", "underscore: my_component", "Faqat bir so'z"], correct: 1, explanation: "React komponent nomi KATTA harf bilan boshlanishi shart (PascalCase). Aks holda React uni oddiy HTML element deb qabul qiladi: <div> emas, <MyComponent>." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "React 1-dars yakunlandi!",
      avatarText: "React dunyosiga xush kelibsiz! Asoslar, o'rnatish, komponent va Props o'rgandingiz!",
      content: [
        { kind: "practices", items: [
          "npm create vite@latest — React loyiha yaratish",
          "Komponent — PascalCase, funksiya, JSX qaytaradi",
          "Props — ota komponentdan bola ga ma'lumot",
          "key — massiv render qilganda SHART",
          "useState — komponent holati uchun",
        ]},
      ],
    },
  ],

  /* ── React Dars 6: useState ─────────────────────────────────────────────── */
  6: [
    {
      type: "intro", label: "Kirish",
      title: "useState Hook — Komponent xotirasi",
      avatarText: "useState — React Hooks ning eng muhimi! Komponent o'z ma'lumotini eslab turishi va UI ni avtomatik yangilashi shu orqali.",
      content: [
        { kind: "paragraph", html: "<strong>useState</strong> — React komponentiga 'xotira' beruvchi Hook. State o'zgarganda komponent avtomatik qayta render bo'ladi." },
        { kind: "highlight", icon: "🧠", label: "useState sintaksis", text: "const [qiymat, setQiymat] = useState(boshlangich_qiymat);" },
        { kind: "points", items: [
          "State — komponentning ichki, o'zgaruvchan ma'lumoti",
          "State o'zgarganda React avtomatik UI ni yangilaydi",
          "setQiymat — state ni o'zgartiruvchi funksiya",
          "State ni to'g'ridan-to'g'ri o'zgartirmang: qiymat = yangi ❌",
          "Har bir komponentning o'z mustaqil state i bor",
        ]},
      ],
    },
    {
      type: "code", label: "Asosiy misol",
      title: "useState — Amaliy misollar",
      avatarText: "Mana real loyihalarda har kuni ishlatiladigan useState patternlar!",
      content: [
        { kind: "code", lang: "jsx", code: `import { useState } from 'react';

// ── MISOL 1: Hisoblagich ──
function Hisoblagich() {
  const [son, setSon] = useState(0);

  return (
    <div>
      <p>Hisob: <strong>{son}</strong></p>
      <button onClick={() => setSon(son + 1)}>+1</button>
      <button onClick={() => setSon(son - 1)}>-1</button>
      <button onClick={() => setSon(0)}>Reset</button>
    </div>
  );
}

// ── MISOL 2: Toggle ──
function DarkModeToggle() {
  const [qoronglik, setQoronglik] = useState(false);

  return (
    <div style={{
      background: qoronglik ? '#1a1a2e' : '#ffffff',
      color: qoronglik ? '#ffffff' : '#1a1a2e',
      padding: '20px', borderRadius: '12px',
      transition: 'all 0.3s ease'
    }}>
      <p>{qoronglik ? '🌙 Qorong\\'u' : '☀️ Yorug\\'}' rejim</p>
      <button onClick={() => setQoronglik(prev => !prev)}>
        Almashtirish
      </button>
    </div>
  );
}

// ── MISOL 3: Forma ──
function KirishForma() {
  const [forma, setForma] = useState({ ism: '', email: '', yosh: '' });
  const [yuborildi, setYuborildi] = useState(false);

  const ozgartir = (e) => {
    setForma(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const yuborish = (e) => {
    e.preventDefault();
    console.log('Forma:', forma);
    setYuborildi(true);
  };

  if (yuborildi) return <p>✅ Muvaffaqiyatli yuborildi!</p>;

  return (
    <form onSubmit={yuborish}>
      <input name="ism"   value={forma.ism}   onChange={ozgartir} placeholder="Ism" />
      <input name="email" value={forma.email} onChange={ozgartir} placeholder="Email" />
      <input name="yosh"  value={forma.yosh}  onChange={ozgartir} placeholder="Yosh" />
      <button type="submit">Yuborish</button>
    </form>
  );
}` },
      ],
    },
    {
      type: "code", label: "Murakkab state",
      title: "Ob'ekt va massiv state",
      avatarText: "Murakkab state — ob'ekt va massiv bilan ishlash. Spread operator (...) bu yerda juda muhim!",
      content: [
        { kind: "code", lang: "jsx", code: `import { useState } from 'react';

// ── OB'EKT STATE — spread bilan o'zgartirish ──
function ProfilForm() {
  const [profil, setProfil] = useState({
    ism: 'Kamola',
    yosh: 23,
    shahar: 'Toshkent',
    premium: false,
  });

  const ozgartir = (maydon, qiymat) => {
    setProfil(prev => ({ ...prev, [maydon]: qiymat }));
    // ...prev — eski barcha maydonlarni saqlab qoladi
    // [maydon]: qiymat — faqat o'zgargan maydonni yangilaydi
  };

  return (
    <div>
      <p>Ism: {profil.ism}</p>
      <input value={profil.ism} onChange={e => ozgartir('ism', e.target.value)} />
      <p>Premium: {profil.premium ? 'Ha ✅' : 'Yo\\'q ❌'}</p>
      <button onClick={() => ozgartir('premium', !profil.premium)}>Toggle</button>
    </div>
  );
}

// ── MASSIV STATE ──
function TodoList() {
  const [vazifalar, setVazifalar] = useState([
    { id: 1, matn: 'HTML o\\'rganish', bajarildi: true },
    { id: 2, matn: 'CSS o\\'rganish', bajarildi: false },
    { id: 3, matn: 'JS o\\'rganish', bajarildi: false },
  ]);
  const [yangi, setYangi] = useState('');

  // Qo'shish — push emas, spread!
  const qo_shish = () => {
    if (!yangi.trim()) return;
    setVazifalar(prev => [
      ...prev,
      { id: Date.now(), matn: yangi, bajarildi: false }
    ]);
    setYangi('');
  };

  // O'zgartirish — map bilan
  const toggl = (id) => {
    setVazifalar(prev =>
      prev.map(v => v.id === id ? { ...v, bajarildi: !v.bajarildi } : v)
    );
  };

  // O'chirish — filter bilan
  const ochirish = (id) => {
    setVazifalar(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div>
      <input value={yangi} onChange={e => setYangi(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && qo_shish()} />
      <button onClick={qo_shish}>Qo'shish</button>
      {vazifalar.map(v => (
        <div key={v.id} style={{ textDecoration: v.bajarildi ? 'line-through' : 'none' }}>
          <span onClick={() => toggl(v.id)}>{v.matn}</span>
          <button onClick={() => ochirish(v.id)}>❌</button>
        </div>
      ))}
    </div>
  );
}` },
        { kind: "tip", text: "QOIDA: State ni to'g'ridan-to'g'ri o'zgartirmang! Massiv uchun .push() emas — spread [...prev, yangi]. Ob'ekt uchun = emas — {...prev, maydon: qiymat}." },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "useState testi",
      avatarText: "useState ni yaxshi tushundingizmi?",
      content: [
        { kind: "quiz", q: "Massiv state ga element qo'shishning TO'G'RI usuli qaysi?", opts: ["vazifalar.push(yangi)", "setVazifalar(vazifalar.push(yangi))", "setVazifalar(prev => [...prev, yangi])", "setVazifalar([vazifalar, yangi])"], correct: 2, explanation: "setVazifalar(prev => [...prev, yangi]) — to'g'ri usul. prev (eski massiv) spread bilan nusxalanadi va oxiriga yangi element qo'shiladi. .push() state ni mutatsiya qiladi — React buni sezmaydi!" },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "useState — Xulosa",
      avatarText: "useState ni o'zgandingiz! Keyingi muhim Hook — useEffect bilan ishlash!",
      content: [
        { kind: "practices", items: [
          "const [val, setVal] = useState(boshlangich) — asosiy sintaksis",
          "Setter orqali o'zgartiring — to'g'ridan-to'g'ri emas!",
          "Ob'ekt: setProfil(prev => ({...prev, maydon: qiymat}))",
          "Massiv qo'shish: setArr(prev => [...prev, yangi])",
          "Massiv o'chirish: setArr(prev => prev.filter(...))",
          "Massiv yangilash: setArr(prev => prev.map(...))",
        ]},
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// INGLIZ TILI KURSI  (courseId: 5)
// ─────────────────────────────────────────────────────────────────────────────
const englishLessons = {
  1: [
    {
      type: "intro", label: "Kirish",
      title: "Ingliz Tili — Salomlashish va tanishish",
      avatarText: "Hello! Welcome to our English course! Bugun ingliz tilida salomlashish va o'zini tanishtirish iboralarini o'rganamiz.",
      content: [
        { kind: "highlight", icon: "🇬🇧", label: "Darsdagi maqsad", text: "Bu dars oxirida siz ingliz tilida o'zingizni tanishtira olasiz va oddiy suhbat boshlay olasiz." },
        { kind: "points", items: [
          "Formal va informal salomlashish farqi",
          "O'zingizni tanishtirish iboralari",
          "Savol berish va javob berish",
        ]},
      ],
    },
    {
      type: "theory", label: "Salomlashish",
      title: "Greetings — Salomlashish iboralari",
      avatarText: "Ingliz tilida salomlashish ikki xil: formal (rasmiy) va informal (norasmiy).",
      content: [
        { kind: "highlight", icon: "🤝", label: "FORMAL (Rasmiy)", text: "Good morning! (ertalab) · Good afternoon! (kunduzi) · Good evening! (kechqurun) · How do you do? (birinchi uchrashuv)" },
        { kind: "highlight", icon: "👋", label: "INFORMAL (Norasmiy)", text: "Hi! / Hey! · What's up? · How's it going? · Long time no see!" },
      ],
    },
    {
      type: "theory", label: "Amaliyot",
      title: "Suhbat namunasi",
      avatarText: "Endi buni amaliyotda qanday ko'rinishini dialog orqali ko'ramiz.",
      content: [
        { kind: "highlight", icon: "🗣️", label: "Dialog", text: "A: Hello! My name is Kamol. What's your name?\nB: Hi, Kamol! Nice to meet you. I'm Sarah.\nA: Where are you from, Sarah?\nB: I'm from the USA. And you?" },
        { kind: "practices", items: [
          "My name is... (ismim...)",
          "I'm from... (men ...danman)",
          "Nice to meet you (tanishganimdan xursandman)"
        ]},
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "Salomlashish testi",
      avatarText: "Ingliz tili asoslarini o'zgandingiz. Sinab ko'ramiz!",
      content: [
        { kind: "quiz", q: "Kechqurun (18:00 dan keyin) qanday salomlashiladi?", opts: ["Good morning!", "Good afternoon!", "Good evening!", "Good night!"], correct: 2, explanation: "Good evening! — kechqurun salomlashish uchun (18:00 dan keyin). Good night! esa xayrlashganda yoki uxlash vaqtida aytiladi." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "1-dars yakunlandi! Hello World! 🎉",
      avatarText: "Ajoyib! Ingliz tilida salomlashish va o'zini tanishtirish iboralarini o'rgandingiz!",
      content: [
        { kind: "practices", items: [
          "Good morning/afternoon/evening — vaqtga qarab salomlashish",
          "My name is... / I'm from... — o'zini tanishtirish",
        ]},
      ],
    },
  ],
  2: [
    {
      type: "intro", label: "Kirish",
      title: "Sonlar va Oila a'zolari",
      avatarText: "Hi again! Bugungi darsimizda ingliz tilida sanashni va oila a'zolarimizni tanishtirishni o'rganamiz.",
      content: [
        { kind: "highlight", icon: "🔢", label: "Sonlar (Numbers)", text: "One (1), Two (2), Three (3), Four (4), Five (5), Six (6), Seven (7), Eight (8), Nine (9), Ten (10)." },
        { kind: "highlight", icon: "👨‍👩‍👧‍👦", label: "Oila (Family)", text: "Mother (Ona), Father (Ota), Brother (Aka/Uka), Sister (Opa/Singil)." },
      ],
    },
    {
      type: "theory", label: "Amaliyot",
      title: "Oila haqida gapirish",
      avatarText: "O'z oilangiz haqida qanday gapirishni ko'rib chiqamiz.",
      content: [
        { kind: "highlight", icon: "🗣️", label: "Dialog", text: "A: How many brothers and sisters do you have? (Nechta aka-uka, opa-singlingiz bor?)\nB: I have one brother and two sisters. (Mening bir akam va ikkita opam bor.)" },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "Oila testi",
      avatarText: "O'rganganlaringizni sinab ko'ramiz!",
      content: [
        { kind: "quiz", q: "Ingliz tilida 'Ona' qanday aytiladi?", opts: ["Father", "Sister", "Mother", "Brother"], correct: 2, explanation: "Mother — Ona degani." },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// RUS TILI KURSI  (courseId: 6)
// ─────────────────────────────────────────────────────────────────────────────
const russianLessons = {
  1: [
    {
      type: "intro", label: "Kirish",
      title: "Rus alifbosi — Asosiy harflar va talaffuz",
      avatarText: "Здравствуйте! (Zdrastvuyte!) Rus tili kursiga xush kelibsiz. Eng asosiysi — alifbodan boshlaymiz.",
      content: [
        { kind: "paragraph", html: "Rus tilida <strong>33 ta harf</strong> mavjud: 10 ta unli, 21 ta undosh va 2 ta belgi (ovozsiz). Bu harflarni to'g'ri o'qish gapirishning asosidir." },
        { kind: "highlight", icon: "🇷🇺", label: "Qoida", text: "Kirill yozuvidagi ba'zi harflar lotin harflariga o'xshaydi, lekin boshqacha o'qiladi. Masalan: 'P' = 'R', 'C' = 'S', 'H' = 'N'." },
        { kind: "points", items: [
          "А, О, У, Э, Ы — qattiq unlilar",
          "Я, Ё, Ю, Е, И — yumshoq unlilar",
          "Ь (yumshatish) va Ъ (qattiqlashtirish) belgilari hech qanday tovush bermaydi",
        ]},
      ],
    },
    {
      type: "theory", label: "Talaffuz",
      title: "O'xshash va farqli harflar",
      avatarText: "O'zbek tili alifbosiga (lotincha) qanday harflar o'xshash, qaysilari esa butunlay boshqacha? Keling ko'rib chiqamiz.",
      content: [
        { kind: "highlight", icon: "🗣️", label: "Lotincha o'xshash", text: "A(A), O(O), M(M), T(T), K(K) — bu harflar qanday yozilsa shunday o'qiladi." },
        { kind: "highlight", icon: <LuInfo />, label: "Aldamchi harflar", text: "В = V (B emas), Н = N (H emas), Р = R (P emas), С = S (C emas), Х = X (H emas)." },
        { kind: "practices", items: [
          "РЕСТОРАН — Restoran deb o'qiladi",
          "ВОДА (suv) — Voda deb o'qiladi",
          "САХАР (shakar) — Saxar deb o'qiladi",
          "НОС (burun) — Nos deb o'qiladi",
        ]},
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "Alifbo testi",
      avatarText: "Diqqatli bo'ling, aldovchi harflarni eslang!",
      content: [
        { kind: "quiz", q: "Rus tilidagi 'СОК' so'zi qanday o'qiladi?", opts: ["Kok", "Sok", "Cok", "Hok"], correct: 1, explanation: "'С' harfi 'S' deb, 'О' harfi 'O' deb, 'К' harfi 'K' deb o'qiladi. Demak, 'Sok' (sharbat)." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "1-dars yakunlandi! 🎉",
      avatarText: "Отлично! (Ajoyib!) Siz rus alifbosi bilan tanishdingiz.",
      content: [
        { kind: "practices", items: [
          "Rus alifbosida 33 ta harf mavjud",
          "Unli va undosh harflarning turlari",
          "Aldamchi harflarni ajratish (В, Н, Р, С, Х)",
        ]},
      ],
    },
  ],
  2: [
    {
      type: "intro", label: "Kirish",
      title: "Ot va Sifat (Jinslar va Ko'plik)",
      avatarText: "Привет! Bugun rus tilining eng muhim gramatik qoidalaridan biri - Jinslar (Род) haqida gaplashamiz.",
      content: [
        { kind: "paragraph", html: "Rus tilida hamma narsaning <strong>jinsi</strong> bor. Bu o'zbek tilidan eng katta farq." },
        { kind: "highlight", icon: "👨‍👩‍👧", label: "Uchta jins (Род)", text: "1. Мужской род (Erkak jins) — Он (U) \n2. Женский род (Ayol jins) — Она (U) \n3. Средний род (O'rta jins) — Оно (U)" },
      ],
    },
    {
      type: "theory", label: "Qoidalar",
      title: "Jinsni qanday aniqlaymiz?",
      avatarText: "So'zning oxirgi harfiga qarab jinsni oson topish mumkin.",
      content: [
        { kind: "points", items: [
          "Undosh harf bilan tugasa → Мужской (masalan: Дом, Брат)",
          "А yoki Я bilan tugasa → Женский (masalan: Мама, Книга)",
          "О yoki Е bilan tugasa → Средний (masalan: Окно, Море)",
        ]},
        { kind: "practices", items: [
          "Мой брат (Mening akam) — Мужской",
          "Моя мама (Mening onam) — Женский",
          "Моё окно (Mening derazam) — Средний",
        ]},
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "Jinslar testi",
      avatarText: "Qoidani eslab qoldingizmi?",
      content: [
        { kind: "quiz", q: "'Книга' (Kitob) so'zi qaysi jinsga tegishli?", opts: ["Мужской (Erkak)", "Женский (Ayol)", "Средний (O'rta)", "Ko'plik"], correct: 1, explanation: "'Книга' so'zi 'А' harfi bilan tugagani uchun u Женский род (Ayol jins) hisoblanadi." },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FRANSUZ TILI KURSI  (courseId: 7)
// ─────────────────────────────────────────────────────────────────────────────
const frenchLessons = {
  1: [
    {
      type: "intro", label: "Kirish",
      title: "Fransuz Alifbosi va Tovushlar",
      avatarText: "Bonjour! (Bonjur!) Fransuz tili kursiga xush kelibsiz. Eng nozik va go'zal tillardan biri!",
      content: [
        { kind: "paragraph", html: "Fransuz alifbosi <strong>26 ta harfdan</strong> iborat (xuddi ingliz tilidagi kabi), lekin o'qilishi umuman boshqacha." },
        { kind: "highlight", icon: "🇫🇷", label: "Muhim qoida", text: "Fransuz tilida ko'p so'zlarning oxiridagi undosh harflar O'QILMAYDI! Masalan: 'Paris' = Pari, 'Comment' = Komo." },
      ],
    },
    {
      type: "theory", label: "Salomlashish",
      title: "Asosiy salomlashish iboralari",
      avatarText: "Fransuz tilida qanday salomlashamiz? Bu juda oson!",
      content: [
        { kind: "points", items: [
          "Bonjour (Bonjur) — Salom / Xayrli kun (rasmiy)",
          "Salut (Salyu) — Salom (norasmiy, do'stlar orasida)",
          "Bonsoir (Bonsuar) — Xayrli kech",
          "Au revoir (O rvuar) — Xayr / Ko'rishguncha",
          "Merci (Mersi) — Rahmat",
          "S'il vous plaît (Sil vu ple) — Iltimos",
        ]},
        { kind: "tip", text: "Fransuzlarda 'R' harfi tomoqdan, yumshoq 'G' kabi talaffuz qilinadi. Buni mashq qilib ko'ring!" },
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "Fransuzcha salomlashish",
      avatarText: "Sinab ko'ramiz, e'tibor bilan eshitdingizmi?",
      content: [
        { kind: "quiz", q: "Do'stingizga qanday qilib norasmiy salom berasiz?", opts: ["Bonjour", "Merci", "Salut", "Au revoir"], correct: 2, explanation: "Salut (Salyu) — norasmiy 'Salom' yoki 'Xayr' degan ma'noni bildiradi. Do'stlar orasida ishlatiladi." },
      ],
    },
    {
      type: "summary", label: "Xulosa",
      title: "1-dars yakunlandi! 🎉",
      avatarText: "Très bien! (Juda yaxshi!) Birinchi qadam qo'yildi.",
      content: [
        { kind: "practices", items: [
          "Fransuz tilida so'z oxiridagi harflar ko'pincha o'qilmasligi",
          "Bonjour va Salut orasidagi farq",
          "Asosiy xushmuomalalik so'zlari (Merci, S'il vous plaît)",
        ]},
      ],
    },
  ],
  2: [
    {
      type: "intro", label: "Kirish",
      title: "Être (Bo'lish) va Avoir (Ega bo'lish) fe'llari",
      avatarText: "Bugun fransuz tilining eng muhim ikki fe'lini o'rganamiz: Être va Avoir.",
      content: [
        { kind: "paragraph", html: "Fransuz tilida gap tuzish uchun bu ikkita fe'lni suvdek yod bilish shart. Ular boshqa zamonlarni yasashda ham kerak bo'ladi." },
        { kind: "highlight", icon: "👤", label: "Être (Bo'lmoq / To be)", text: "Je suis (Menman) \nTu es (Sensan) \nIl/Elle est (U) \nNous sommes (Bizmiz) \nVous êtes (Sizsiz) \nIls/Elles sont (Ulardir)" },
      ],
    },
    {
      type: "theory", label: "Amaliyot",
      title: "Avoir va Misollar",
      avatarText: "Endi Avoir fe'li va ularni qanday ishlatishni ko'ramiz.",
      content: [
        { kind: "highlight", icon: "🎒", label: "Avoir (Ega bo'lmoq / To have)", text: "J'ai (Menda bor) \nTu as (Senda bor) \nIl/Elle a (Unda bor) \nNous avons (Bizda bor) \nVous avez (Sizda bor) \nIls/Elles ont (Ularda bor)" },
        { kind: "practices", items: [
          "Je suis étudiant. (Men talabaman)",
          "J'ai un livre. (Menda kitob bor)",
          "Tu es mon ami. (Sen mening do'stimsan)",
        ]},
      ],
    },
    {
      type: "challenge", label: "Test",
      title: "Fe'llar testi",
      avatarText: "Esingizda qoldimi?",
      content: [
        { kind: "quiz", q: "'Men talabaman' jumlasi fransuz tilida qanday bo'ladi?", opts: ["J'ai étudiant", "Je suis étudiant", "Tu es étudiant", "Nous sommes étudiant"], correct: 1, explanation: "Être fe'lining birinchi shaxsi 'Je suis' bo'ladi. 'Je suis étudiant' = 'Men talabaman'." },
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────────────────────
// TRANSLATE LESSON HELPER
// ─────────────────────────────────────────────────────────────────────────────
const translateLesson = (slides, t) => {
  if (!slides || !Array.isArray(slides)) return slides;
  if (!t) return slides; // t undefined bo'lsa, original slides qaytariladi
  return slides.map(slide => {
    const typeLabels = {
      intro: t.introLabel,
      theory: t.theoryLabel,
      code: t.codeLabel,
      challenge: t.challengeLabel,
      practices: t.practicesLabel,
      summary: t.summaryLabel
    };
    const translatedSlide = {
      ...slide,
      label: typeLabels[slide.type] || slide.label
    };
    if (translatedSlide.content && Array.isArray(translatedSlide.content)) {
      translatedSlide.content = translatedSlide.content.map(block => {
        if (block.kind === "highlight") {
          const blockLabels = {
            "Kirish": t.introLabel, "Nazariya": t.theoryLabel, "Xulosa": t.summaryLabel,
            "Qiziqarli fakt": t.factLabel, "Eslatma": t.noteLabel, "Qoida": t.ruleLabel,
            "Maslahat": t.tipLabel, "Topshiriq": t.taskLabel, "Success": t.successLabel,
            "Muvaffaqiyat": t.successLabel, "Keyingi dars": t.nextLessonLabel,
            "Interesting Fact": t.factLabel, "Note": t.noteLabel, "Rule": t.ruleLabel,
            "Tip": t.tipLabel, "Task": t.taskLabel, "Next Lesson": t.nextLessonLabel,
            "Maqsad": t.target, "Qiziqarli": t.factLabel, "Tabrik!": t.successLabel,
            "Mavzu": t.theoryLabel, "Kerakli vositalar": t.tools, "Suhbat namunasi": t.help,
            "Lotincha o'xshash": t.grad, "Aldamchi harflar": t.warning, "Uchta jins (Род)": t.grad,
            "Muhim qoida": t.ruleLabel, "Être (Bo'lmoq / To be)": t.theoryLabel, "Avoir (Ega bo'lmoq / To have)": t.theoryLabel
          };
          const iconMap = {
            "🌐": "globe", "💡": "lightbulb", "🎯": "target", "⚠️": "warning",
            "📋": "clipboard", "🚀": "rocket", "🛠️": "tools", "📜": "clipboard",
            "✅": "check", "🎓": "grad", "🎒": "backpack", "📚": "book",
            "🏆": "rocket", "🖊️": "lightbulb", "🗣️": "grad", "👨‍👩‍👧": "grad",
            "🇷🇺": "globe", "🇫🇷": "globe", "👤": "grad", "💬": "help", "👋": "grad"
          };
          return {
            ...block,
            label: blockLabels[block.label] || block.label,
            icon: iconMap[block.icon] || block.icon
          };
        }
        return block;
      });
    }
    return translatedSlide;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// UMUMIY FALLBACK — qolgan barcha darslar uchun
// ─────────────────────────────────────────────────────────────────────────────
// Default tarjima labellari — t undefined bo'lsa ishlatilinadi
const DEFAULT_T = {
  introLabel: "Kirish", theoryLabel: "Nazariya", codeLabel: "Kod",
  challengeLabel: "Topshiriq", practicesLabel: "Amaliyot", summaryLabel: "Xulosa",
  factLabel: "Qiziqarli fakt", noteLabel: "Eslatma", ruleLabel: "Qoida",
  tipLabel: "Maslahat", taskLabel: "Topshiriq", successLabel: "Muvaffaqiyat",
  nextLessonLabel: "Keyingi dars", target: "Maqsad", tools: "Kerakli vositalar",
  help: "Yordam", grad: "Daraja", warning: "Ogohlantirish",
  introText: "Kirish matni", theoryText: "Nazariya matni",
  challengeIntro: "Topshiriqni bajaring", summaryIntro: "Dars yakunlandi",
  explanationLabel: "Izoh", optionA: "A variant", optionB: "B variant",
  optionC: "C variant", optionD: "D variant",
  summaryPoint1: "Mavzu o'rganildi", summaryPoint2: "Amaliyot qilindi",
  summaryPoint3: "Test yechildi", summaryPoint4: "Tayyor!",
  lessonIntro: "{{title}} mavzusidan boshlaymiz", theoryIntro: "nazariyasini o'rganamiz",
  lessonStructure: "Dars nazariy va amaliy qismlardan iborat",
  codeAndExamples: "Sintaksis, kod bloklari va amaliy misollar ko'rsatiladi",
  theoryAndExamples: "Qoidalar, dialog namunalar va so'zlashuv misollari ko'rsatiladi",
  quizAtEnd: "Har bir mavzu oxirida test savoli bo'ladi",
  finishNotice: "Barcha slaydlarni ko'rganingizda 'Tugatdim' tugmasi paydo bo'ladi",
  examplesAndUsage: "Amaliy misollar va namunalar",
  errorHandling: "Ko'p uchraydigan xatolar va ularning yechimi",
  aiTutorLabel: "AI Tutor", chatPlaceholder: "Savolingizni yozing",
  codeIntro: "Kodni amalda sinab ko'ring", copyAndTry: "Bu kodni nusxalab muharrirda sinab ko'ring.",
};

const buildGenericLesson = (lesson, category, t) => {
  if (!t || typeof t !== "object") t = DEFAULT_T;
  const isCode = ["HTML", "CSS", "JavaScript", "React", "Node.js", "Python"].includes(category);
  const lang = { HTML: "html", CSS: "css", JavaScript: "js", React: "jsx" }[category] || "js";

  return [
    {
      type: "intro", label: t.introLabel,
      title: `${lesson.title} — ${t.lessonIntro.split("mavzusidan")[0].trim()}`,
      avatarText: t.lessonIntro.replace("{{title}}", lesson.title),
      content: [
        { kind: "highlight", icon: "book", label: t.theoryLabel, text: `${lesson.title} — ${category} ${t.theoryIntro.toLowerCase()}` },
        { kind: "points", items: [
          t.lessonStructure || "Dars nazariy va amaliy qismlardan iborat",
          isCode ? t.codeAndExamples || "Sintaksis, kod bloklari va amaliy misollar ko'rsatiladi" : t.theoryAndExamples || "Qoidalar, dialog namunalar va so'zlashuv misollari ko'rsatiladi",
          t.quizAtEnd || "Har bir mavzu oxirida test savoli bo'ladi",
          t.finishNotice || "Barcha slaydlarni ko'rganingizda 'Tugatdim' tugmasi paydo bo'ladi",
        ]},
      ],
    },
    {
      type: "theory", label: t.theoryLabel,
      title: `${lesson.title} — ${t.theoryLabel}`,
      avatarText: t.theoryIntro,
      content: [
        { kind: "paragraph", html: `<strong>${lesson.title}</strong> — ${category} ${t.theoryIntro.toLowerCase()}` },
        { kind: "points", items: [
          `${lesson.title} — ${t.ruleLabel}s`,
          t.examplesAndUsage || "Amaliy misollar va namunalar",
          t.errorHandling || "Ko'p uchraydigan xatolar va ularning yechimi",
        ]},
        { kind: "tip", text: `💬 ${t.aiTutorLabel}: ${t.chatPlaceholder}` },
      ],
    },
    isCode 
      ? {
          type: "code", label: t.codeLabel,
          title: `${lesson.title} — ${t.codeLabel}`,
          avatarText: t.codeIntro,
          content: [
            { kind: "code", lang, code: `// ${lesson.title}\nconsole.log("${lesson.title} — learning...");` },
            { kind: "highlight", icon: "lightbulb", label: t.taskLabel, text: t.copyAndTry || "Bu kodni nusxalab muharrirda sinab ko'ring." },
          ],
        }
      : {
          type: "theory", label: t.practicesLabel,
          title: `${lesson.title} — ${t.practicesLabel}`,
          avatarText: t.practicesIntro,
          content: [
            { kind: "highlight", icon: "grad", label: t.practicesLabel, text: `${lesson.title} ${t.practicesIntro.toLowerCase()}` },
            { kind: "practices", items: [
              t.repeatWords || "Yangi so'zlarni takrorlang",
              t.tryDialogs || "Dialoglarni mashq qiling",
              t.noFear || "Xato qilishdan qo'rqmang!"
            ]},
          ],
        },
    {
      type: "challenge", label: t.challengeLabel,
      title: `${lesson.title} — ${t.challengeLabel}`,
      avatarText: t.challengeIntro,
      content: [
        { kind: "quiz", q: `${lesson.title}?`, opts: [t.optionA || "A", t.optionB || "B", t.optionC || "C", t.optionD || "D"], correct: 1, explanation: t.explanationLabel },
      ],
    },
    {
      type: "summary", label: t.summaryLabel,
      title: `${lesson.title} — ${t.summaryLabel}`,
      avatarText: t.summaryIntro,
      content: [
        { kind: "practices", items: [
          t.summaryPoint1 || "Mavzu o'rganildi",
          t.summaryPoint2 || "Amaliyot qilindi",
          t.summaryPoint3 || "Test yechildi",
          t.summaryPoint4 || "Tayyor!",
        ]},
        { kind: "highlight", icon: "rocket", label: t.successLabel, text: t.summaryIntro },
      ],
    },
  ];
};

// ─────────────────────────────────────────────────────────────────────────────
// ASOSIY EKSPORT FUNKSIYA
// VideoLessonModal ichida chaqiriladi:
//   const slides = generateLessonContent(lesson, courseId, courseCategory, t);
// ─────────────────────────────────────────────────────────────────────────────
export const generateLessonContent = (lesson, courseId, category, t) => {
  // t undefined yoki null bo'lsa, default labellar ishlatiladi
  if (!t || typeof t !== "object") t = DEFAULT_T;
  if (!lesson) return buildGenericLesson({ title: "Dars", id: 1 }, "Umumiy", t);

  const cId = Number(courseId);
  let res = [];

  // HTML (1, 8)
  if (cId === 1 || cId === 8 || category === "HTML") {
    res = htmlLessons[lesson.id];
  }
  // CSS (2)
  else if (cId === 2 || category === "CSS") {
    res = cssLessons[lesson.id];
  }
  // JavaScript (3)
  else if (cId === 3 || category === "JavaScript") {
    res = jsLessons[lesson.id];
  }
  // React (4)
  else if (cId === 4 || category === "React") {
    res = reactLessons[lesson.id];
  }
  // English (5)
  else if (cId === 5 || category === "English") {
    res = englishLessons[lesson.id];
  }
  // Russian (6)
  else if (cId === 6 || category === "Russian") {
    res = russianLessons[lesson.id];
  }
  // French (7)
  else if (cId === 7 || category === "French") {
    res = frenchLessons[lesson.id];
  }

  if (res && res.length > 0) {
    return translateLesson(res, t);
  }

  // Fallback — qolgan barcha kurslar va darslar
  return translateLesson(buildGenericLesson(lesson, category || "Umumiy", t), t);
};

export default generateLessonContent;