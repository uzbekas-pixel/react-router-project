// src/routes/CourseDetailContent/lessonsDB.js

export const lessonsDB = {
  // ==========================================
  // 1 - HTML ASOSLARI KURSI (courseId: 1)
  // ==========================================
  1: { 
    // ----------------------------------------
    // 1-DARS: HTML nima?
    // ----------------------------------------
    1: { 
      id: 1,
      title: "HTML nima va u qanday ishlaydi?",
      type: "programming",
      slides: [
        {
          icon: "💡",
          title: "HTML ga Kirish",
          content: "<p><b>HTML</b> (HyperText Markup Language) — bu veb-sahifalarni yaratish uchun ishlatiladigan asosiy belgilash tilidir. U dasturlash tili emas, balki sahifaning suyaklarini, ya'ni tuzilishini belgilab beruvchi tildir.</p>"
        },
        {
          icon: "🧱",
          title: "Teglar qanday ishlaydi?",
          content: "<p>HTML asosan <b>teglar</b> (tags) yordamida ishlaydi. Ular odatda juft bo'ladi: ochiluvchi va yopiluvchi. Brauzer bu teglarni o'qiydi va ularga qarab matnni yoki rasmni ekranda chizadi.</p>",
          code: "<h1>Bu asosiy sarlavha</h1>\n<p>Bu oddiy matn (paragraf).</p>",
          language: "html"
        }
      ],
      task: {
        description: "O'zingiz haqingizda qisqacha ma'lumotni web sahifada chiqaring.",
        requirements: [
          "Bitta <h1> tagidan foydalanib ismingizni yozing", 
          "Bitta <p> tagidan foydalanib kasbingizni yozing"
        ],
        hints: ["Teglarni ochgandan keyin yopishni unutmang (masalan: </h1>)"],
        mustInclude: ["<h1>", "<p>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "HTML qanday til hisoblanadi?",
          options: ["Dasturlash tili", "Belgilash tili (Markup Language)", "Ma'lumotlar bazasi tili", "Stillashtirish tili"],
          correct: 1,
          explanation: "HTML - bu HyperText Markup Language, ya'ni matnlarni belgilash va veb-sahifa strukturasini yaratish tili."
        }
      ]
    },

    // ----------------------------------------
    // 2-DARS: Birinchi HTML sahifa
    // ----------------------------------------
    2: {
      id: 2,
      title: "Birinchi HTML sahifa (Asosiy qolip)",
      type: "programming",
      slides: [
        {
          icon: "📄",
          title: "HTML Qolipi",
          content: "<p>Har qanday veb-sahifa qat'iy bir qolipga (strukturaga) ega bo'lishi shart. Busiz brauzer sahifani to'g'ri o'qiy olmaydi. Barcha kodlar <b>&lt;html&gt;</b> tegi ichida yoziladi.</p>"
        },
        {
          icon: "🧠",
          title: "Head va Body",
          content: "<p>Sahifa ikki qismga bo'linadi:<br/><b>1. &lt;head&gt;</b> - Sayt haqida ma'lumotlar (brauzer tepadagi tabda chiqadigan nom, SEO ma'lumotlar). Bizga ko'rinmaydi.<br/><b>2. &lt;body&gt;</b> - Biz ekranda ko'radigan hamma narsa (matn, rasm, video) faqat shu yerga yoziladi.</p>",
          code: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>Mening Saytim</title>\n  </head>\n  <body>\n    <p>Ekranda faqat shu matn ko'rinadi.</p>\n  </body>\n</html>",
          language: "html"
        }
      ],
      task: {
        description: "Mukammal HTML qolipini yarating. Sahifa sarlavhasiga (tabga) 'Uzbekas' deb yozing, ekranda esa 'Salom Dunyo' yozuvi chiqsin.",
        requirements: [
          "<!DOCTYPE html> e'lon qilinishi shart", 
          "<title> tegidan foydalanib 'Uzbekas' deb yozing",
          "<body> ichida <h1> tagida 'Salom Dunyo' deb yozing"
        ],
        hints: ["<title> tegi doim <head> ichida bo'lishi kerak."],
        mustInclude: ["<!DOCTYPE html>", "<title>", "<body>", "<h1>"],
        starterCode: "<!DOCTYPE html>\n<html>\n\n</html>"
      },
      quizQuestions: [
        {
          question: "Foydalanuvchi ekranda ko'radigan barcha ma'lumotlar qaysi teg ichiga yoziladi?",
          options: ["<head>", "<title>", "<body>", "<html>"],
          correct: 2,
          explanation: "<head> qismidagi kodlar ekranda ko'rinmaydi. Barcha ko'rinadigan kontent <body> ichida yoziladi."
        }
      ]
    },

    // ----------------------------------------
    // 3-DARS: Asosiy teglar (Sarlavhalar)
    // ----------------------------------------
    3: {
      id: 3,
      title: "Asosiy teglar (Sarlavha va Matnlar)",
      type: "programming",
      slides: [
        {
          icon: "📝",
          title: "Sarlavhalar (Headings)",
          content: "<p>HTML da 6 xil darajadagi sarlavhalar mavjud. Ular <b>h1</b> dan boshlab <b>h6</b> gacha davom etadi. <b>h1</b> eng katta va eng muhim sarlavha hisoblanadi (har bir sahifada bitta bo'lishi tavsiya etiladi).</p>",
          code: "<h1>Eng katta sarlavha</h1>\n<h2>Kichikroq sarlavha</h2>\n<h6>Eng kichik sarlavha</h6>",
          language: "html"
        },
        {
          icon: "📏",
          title: "Paragraf va Bo'sh joylar",
          content: "<p>Matnlarni xatboshilarga ajratish uchun <b>&lt;p&gt;</b> ishlatiladi. Agar shunchaki yangi qatorga tushish kerak bo'lsa <b>&lt;br&gt;</b> (yopilmaydigan teg) ishlatiladi.</p>",
          code: "<p>Bu birinchi qator.<br>Bu xuddi shu paragrafdagi ikkinchi qator.</p>\n<hr>\n<p>hr tegi esa gorizontal chiziq tortadi.</p>",
          language: "html"
        }
      ],
      task: {
        description: "Veb-saytingiz uchun yangiliklar maqolasini tuzing.",
        requirements: [
          "Bitta <h2> sarlavha yozing", 
          "Ostidan 2 ta turli xil <p> (paragraf) yozing",
          "Ikki paragraf orasini chiziq (<hr>) bilan ajrating"
        ],
        hints: ["<hr> tegi yopilmaydi — shunchaki <hr> yozing, xolos. <br> esa yangi qatorga tushiradi, chiziq tortmaydi."],
        mustInclude: ["<h2>", "<p>", "<hr>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "Matnni faqat yangi qatorga tushirish uchun (yangi paragraf ochmasdan) qaysi teg ishlatiladi?",
          options: ["<hr>", "<enter>", "<break>", "<br>"],
          correct: 3,
          explanation: "<br> (break) tegi matnni keyingi qatorga ko'chirib beradi."
        }
      ]
    },

    // ----------------------------------------
    // 4-DARS: Matn teglari (Formatlash)
    // ----------------------------------------
    4: {
      id: 4,
      title: "Matn teglari (Formatlash)",
      type: "programming",
      slides: [
        {
          icon: "✒️",
          title: "Qalin va Og'ma matnlar",
          content: "<p>Matn ichidagi so'zlarga urg'u berish uchun maxsus teglar bor. <br/><b>&lt;b&gt;</b> yoki <b>&lt;strong&gt;</b> so'zni qalin (bold) qiladi.<br/><b>&lt;i&gt;</b> yoki <b>&lt;em&gt;</b> so'zni og'ma (italic) qiladi.</p>"
        },
        {
          icon: "🖍️",
          title: "O'chirilgan va Belgilangan matn",
          content: "<p>Saytlarda chegirmalarni ko'rsatishda <b>&lt;del&gt;</b> (ustidan chizilgan) va e'tiborni tortish uchun <b>&lt;mark&gt;</b> (sariq fonli) teglaridan foydalanamiz.</p>",
          code: "<p>Eski narx: <del>100$</del></p>\n<p>Yangi narx: <mark>50$</mark></p>",
          language: "html"
        }
      ],
      task: {
        description: "Matn ichidagi muhim so'zlarni formatlang.",
        requirements: [
          "Bitta <p> ichida gap yozing", 
          "Gap ichidagi bitta so'zni qalin (<strong>) qiling",
          "Yana bitta so'zni sariq fonli (<mark>) qiling"
        ],
        hints: ["Teglarni matn ichida ochib, darhol so'z tugagach yoping."],
        mustInclude: ["<p>", "<strong>", "<mark>"],
        starterCode: "<p>Men React va Tailwind texnologiyalarini o'rganyapman.</p>"
      },
      quizQuestions: [
        {
          question: "Brauzerga matnning nafaqat qalin ko'rinishini, balki semantik jihatdan muhimligini ham bildiruvchi teg qaysi?",
          options: ["<b>", "<strong>", "<heavy>", "<mark>"],
          correct: 1,
          explanation: "<b> faqat vizual qalin qiladi, lekin <strong> ham vizual qalin qiladi, ham qidiruv tizimlariga bu so'z muhimligini bildiradi."
        }
      ]
    },

    // ----------------------------------------
    // 5-DARS: Havola va Rasmlar
    // ----------------------------------------
    5: {
      id: 5,
      title: "Havola va rasmlar",
      type: "programming",
      slides: [
        {
          icon: "🔗",
          title: "Havolalar (Links)",
          content: "<p>Bir sahifadan ikkinchisiga o'tish uchun <b>&lt;a&gt;</b> (anchor) tegi ishlatiladi. Manzil <b>href</b> atributiga yoziladi. Agar havola yangi oynada ochilishi kerak bo'lsa, <b>target=\"_blank\"</b> qo'shiladi.</p>",
          code: "<a href=\"https://google.com\" target=\"_blank\">Google ga o'tish</a>",
          language: "html"
        },
        {
          icon: "🖼️",
          title: "Rasmlar qo'yish",
          content: "<p>Saytga rasm joylash uchun <b>&lt;img&gt;</b> tegidan foydalaniladi. Bu teg yopilmaydi. Uning 2 ta asosiy atributi bor: <br/><b>src</b> - rasm joylashgan manzil. <br/><b>alt</b> - rasm yuklanmay qolsa o'rnida chiqadigan matn.</p>",
          code: "<img src=\"rasm.jpg\" alt=\"Bu yerda tabiat rasmi bor\">\n<img src=\"https://sayt.com/logo.png\" width=\"200\">",
          language: "html"
        }
      ],
      task: {
        description: "Sahifaga rasm va boshqa saytga o'tish havolasini qo'shing.",
        requirements: [
          "Bitta <img> tegi bilan ixtiyoriy rasm linkini joylang (src va alt bo'lishi shart)", 
          "Rasm ostida Youtube ga olib boruvchi <a> havolasini yarating"
        ],
        hints: ["Havola (a) va Rasm (img) yonma-yon tushib qolmasligi uchun orasiga <br> qo'shib yuborishingiz mumkin."],
        mustInclude: ["<img>", "<a>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "<a> tegida havolaning manzilini ko'rsatish uchun qaysi atribut ishlatiladi?",
          options: ["src", "link", "href", "url"],
          correct: 2,
          explanation: "Havolalar uchun 'href' (Hypertext REFerence) atributi ishlatiladi, rasmlar uchun esa 'src' (Source)."
        }
      ]
    },

    // ----------------------------------------
    // 6-DARS: Jadvallar
    // ----------------------------------------
    6: {
      id: 6,
      title: "Jadvallar (Tables)",
      type: "programming",
      slides: [
        {
          icon: "📊",
          title: "Jadval yaratish asoslari",
          content: "<p>Ma'lumotlarni qator va ustunlarga ajratish uchun <b>&lt;table&gt;</b> dan foydalanamiz. <br/><b>&lt;tr&gt;</b> (table row) - Qator yaratish.<br/><b>&lt;td&gt;</b> (table data) - Qator ichidagi yacheyka (ustun).<br/><b>&lt;th&gt;</b> (table header) - Jadval sarlavhasi (qalin yoziladi).</p>"
        },
        {
          icon: "🧮",
          title: "Oddiy jadval qolipi",
          content: "<p>Jadvallar mantiqan qatorlar va yacheykalardan tashkil topadi.</p>",
          code: "<table border=\"1\">\n  <tr>\n    <th>Ism</th>\n    <th>Yosh</th>\n  </tr>\n  <tr>\n    <td>Ali</td>\n    <td>20</td>\n  </tr>\n</table>",
          language: "html"
        }
      ],
      task: {
        description: "Foydalanuvchilar ro'yxati tushirilgan 2x2 o'lchamli jadval yarating.",
        requirements: [
          "Bitta <table> yarating", 
          "Birinchi qatorda 2 ta <th> (Dasturlash tili, Darajasi) bo'lsin",
          "Ikkinchi qatorda 2 ta <td> (Masalan: HTML, Yuqori) bo'lsin"
        ],
        hints: ["Har bir qator <tr> bilan boshlanib </tr> bilan tugashi shart."],
        mustInclude: ["<table>", "<th>", "<td>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "Jadvalda yangi QATOR ochish uchun qaysi tegdan foydalaniladi?",
          options: ["<table>", "<td>", "<tr>", "<th>"],
          correct: 2,
          explanation: "<tr> - Table Row so'zining qisqartmasi bo'lib, jadvalda yangi qator yaratish uchun javobgar."
        }
      ]
    },
    // ----------------------------------------
    // 7-DARS: Form elementlari
    // ----------------------------------------
    7: {
      id: 7,
      title: "Formalar (Foydalanuvchidan ma'lumot olish)",
      type: "programming",
      slides: [
        {
          icon: "📝",
          title: "Forma nima?",
          content: "<p>Foydalanuvchidan ma'lumotlarni qabul qilish (masalan, ro'yxatdan o'tish, login qilish) uchun <b>&lt;form&gt;</b> tegidan foydalanamiz. Uning ichida kiritish maydonlari bo'ladi.</p>"
        },
        {
          icon: "🔤",
          title: "Input turlari",
          content: "<p>Asosiy kiritish maydoni bu <b>&lt;input&gt;</b>. Uning <b>type</b> atributi orqali qanday ma'lumot kiritilishini belgilaymiz (matn, parol, email, raqam).</p>",
          code: "<form>\n  <input type=\"text\" placeholder=\"Ismingiz\">\n  <input type=\"password\" placeholder=\"Parolingiz\">\n  <button type=\"submit\">Yuborish</button>\n</form>",
          language: "html"
        }
      ],
      task: {
        description: "Oddiy Login formasini yarating.",
        requirements: [
          "Bitta <form> yarating", 
          "Ichida email va parol so'raydigan ikkita <input> bo'lsin",
          "Ma'lumotni jo'natish uchun 'Kirish' yozuvli <button> qo'shing"
        ],
        hints: ["<input> yopilmaydigan teg. Unga placeholder atributini qo'shsangiz, ichida yordamchi matn chiqadi."],
        mustInclude: ["<form>", "<input>", "<button>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "Foydalanuvchi parolni kiritayotganda belgilar yashirin (nuqta-nuqta) bo'lib chiqishi uchun qaysi atribut ishlatiladi?",
          options: ["type=\"hidden\"", "type=\"secret\"", "type=\"password\"", "class=\"hide\""],
          correct: 2,
          explanation: "type=\"password\" atributi kiritilayotgan matnni xavfsizlik uchun yashirib ko'rsatadi."
        }
      ]
    },

    // ----------------------------------------
    // 8-DARS: Validatsiya
    // ----------------------------------------
    8: {
      id: 8,
      title: "Formalarni tekshirish (Validatsiya)",
      type: "programming",
      slides: [
        {
          icon: "🛡️",
          title: "HTML5 Validatsiyasi",
          content: "<p>Foydalanuvchi noto'g'ri ma'lumot kiritmasligi yoki maydonni bo'sh qoldirmasligi uchun formani tekshirishimiz kerak. HTML buni avtomat qila oladi.</p>"
        },
        {
          icon: "✅",
          title: "Asosiy atributlar",
          content: "<p><b>required</b> - maydonni to'ldirish majburiy ekanligini bildiradi.<br/><b>minlength / maxlength</b> - eng kam yoki ko'p belgi soni.<br/><b>type=\"email\"</b> - faqat @ qatnashgan emailni qabul qiladi.</p>",
          code: "<form>\n  <input type=\"email\" required placeholder=\"Emailni kiriting\">\n  <input type=\"password\" minlength=\"8\" required>\n  <button type=\"submit\">Tasdiqlash</button>\n</form>",
          language: "html"
        }
      ],
      task: {
        description: "Avvalgi darsdagi Login formangizni xavfsizroq qiling.",
        requirements: [
          "Email kiritish maydoniga required qo'shing", 
          "Parol maydoniga kamida 6 ta belgi (minlength) talabini qo'ying va required qiling"
        ],
        hints: ["required atributiga qiymat berish shart emas, shunchaki required deb yozib ketsangiz yetarli."],
        mustInclude: [],
        starterCode: "<form>\n  <input type=\"email\" placeholder=\"Email\">\n  <input type=\"password\" placeholder=\"Parol\">\n  <button type=\"submit\">Kirish</button>\n</form>"
      },
      quizQuestions: [
        {
          question: "Maydonni to'ldirmasdan formani jo'natishning oldini oluvchi atribut qaysi?",
          options: ["mandatory", "important", "validate", "required"],
          correct: 3,
          explanation: "required atributi kiritish maydonini to'ldirishni majburiy qilib qo'yadi."
        }
      ]
    },

    // ----------------------------------------
    // 9-DARS: Semantik teglar
    // ----------------------------------------
    9: {
      id: 9,
      title: "Semantik teglar (HTML5)",
      type: "programming",
      slides: [
        {
          icon: "🏗️",
          title: "Semantika nima?",
          content: "<p>Eskidan saytning hamma qismi <b>&lt;div&gt;</b> (quti) orqali yasalardi. Bu brauzer va Google (SEO) uchun tushunarsiz. HTML5 da har bir qismning o'z ma'noli (semantik) tegi bor.</p>"
        },
        {
          icon: "🧭",
          title: "Asosiy semantik teglar",
          content: "<p><b>&lt;header&gt;</b> - Saytning eng tepa qismi (logotip va menyu).<br/><b>&lt;nav&gt;</b> - Navigatsiya (menyular ro'yxati).<br/><b>&lt;main&gt;</b> - Saytning asosiy kontenti.<br/><b>&lt;footer&gt;</b> - Saytning eng pastki qismi (mualliflik huquqi).</p>",
          code: "<header>\n  <nav>\n    <a href=\"/\">Bosh sahifa</a>\n  </nav>\n</header>\n<main>\n  <h1>Asosiy maqola</h1>\n</main>\n<footer>2026 Uzbekas</footer>",
          language: "html"
        }
      ],
      task: {
        description: "Semantik teglardan foydalanib to'g'ri arxitekturaga ega sahifa tuzing.",
        requirements: [
          "Tepada <header> ochib, ichiga bitta sarlavha yozing",
          "O'rtada <main> ochib, ichiga bitta <p> matn yozing",
          "Pastda <footer> ochib, 'Barcha huquqlar himoyalangan' deb yozing"
        ],
        hints: ["Bu teglar xuddi <div> kabi oddiy quti vazifasini bajaradi, faqat nomlari ma'noga ega."],
        mustInclude: ["<header>", "<main>", "<p>", "<footer>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "Saytning eng asosiy, takrorlanmas kontenti qaysi semantik teg ichiga yozilishi kerak?",
          options: ["<section>", "<main>", "<header>", "<div>"],
          correct: 1,
          explanation: "<main> tegi sahifaning eng asosiy mazmunini o'rab turishi uchun ishlatiladi."
        }
      ]
    },

    // ----------------------------------------
    // 10-DARS: Audio va Video
    // ----------------------------------------
    10: {
      id: 10,
      title: "Multimedia (Audio va Video)",
      type: "programming",
      slides: [
        {
          icon: "🎬",
          title: "Video va Audio teglari",
          content: "<p>Saytga to'g'ridan-to'g'ri musiqa yoki video joylash uchun <b>&lt;audio&gt;</b> va <b>&lt;video&gt;</b> teglaridan foydalanamiz. Ularning ishlashi <b>&lt;img&gt;</b> tegiga juda o'xshaydi.</p>"
        },
        {
          icon: "▶️",
          title: "Boshqaruv elementlari",
          content: "<p>Foydalanuvchi videoni puzaga qo'yishi yoki ovozini balandlatishi uchun <b>controls</b> atributini qo'shish shart. Aks holda video/audio ishlamay, yashirinib qoladi.</p>",
          code: "<video src=\"dars.mp4\" width=\"400\" controls></video>\n<br>\n<audio src=\"musiqa.mp3\" controls></audio>",
          language: "html"
        }
      ],
      task: {
        description: "Sahifaga musiqa pleerini qo'shing.",
        requirements: [
          "Bitta <audio> tegini yarating",
          "src atributiga 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' manzilini bering",
          "controls atributini qo'shishni unutmang"
        ],
        hints: ["controls atributiga qiymat kerak emas. Uning o'zini yozib qo'yish kifoya."],
        mustInclude: ["<audio>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "Video yoki audioda Pause/Play, Ovoz tugmalari ko'rinishi uchun qaysi atribut shart?",
          options: ["buttons", "show", "controls", "play"],
          correct: 2,
          explanation: "controls atributi brauzerga standart pleyer interfeysini ko'rsatishni buyuradi."
        }
      ]
    },

    // ----------------------------------------
    // 11-DARS: Iframe (Boshqa saytlarni ulash)
    // ----------------------------------------
    11: {
      id: 11,
      title: "Iframe (YouTube va Xaritalar)",
      type: "programming",
      slides: [
        {
          icon: "🪟",
          title: "Iframe nima?",
          content: "<p><b>&lt;iframe&gt;</b> — bu sahifangiz ichida boshqa bir sahifani (yoki saytni) oyna qilib ochib beruvchi teg. Odatda undan YouTube videolari yoki Google xaritalarini saytga ulashda keng foydalaniladi.</p>"
        },
        {
          icon: "🗺️",
          title: "Iframe ishlatish",
          content: "<p>Unga ham xuddi rasm kabi <b>src</b> (manzil) atributi beriladi, hamda <b>width</b> (kenglik) va <b>height</b> (balandlik) orqali o'lchami belgilanadi.</p>",
          code: "<iframe \n  src=\"https://uzbekas.uz\" \n  width=\"100%\" \n  height=\"400\">\n</iframe>",
          language: "html"
        }
      ],
      task: {
        description: "Sahifaga 500x300 o'lchamli Wikipedia saytini oyna qilib oching.",
        requirements: [
          "Bitta <iframe> yarating",
          "src atributiga 'https://uz.wikipedia.org' ni bering",
          "width ni 500, height ni 300 qilib bering"
        ],
        hints: ["Iframe juft teg, ya'ni uni albatta </iframe> qilib yopish kerak."],
        mustInclude: ["<iframe>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "YouTube videosini o'z saytingizga joylashtirish uchun odatda qaysi tegdan foydalaniladi?",
          options: ["<video>", "<youtube>", "<embed>", "<iframe>"],
          correct: 3,
          explanation: "YouTube va Google Maps o'z kodlarini ulash uchun standart <iframe> tegini taqdim etadi."
        }
      ]
    },

    // ----------------------------------------
    // 12-DARS: Yakuniy Loyiha
    // ----------------------------------------
    12: {
      id: 12,
      title: "Yakuniy Loyiha (Kichik Portfolio)",
      type: "programming",
      slides: [
        {
          icon: "🏆",
          title: "Tabriklaymiz!",
          content: "<p>Siz HTML kursining barcha asoslarini muvaffaqiyatli yakunladingiz! Endi siz har qanday saytning suyaklarini (strukturasi) bemalol qura olasiz.</p>"
        },
        {
          icon: "🚀",
          title: "Bilimlarni birlashtiramiz",
          content: "<p>Endigi navbat — o'rgangan barcha teglarni (Sarlavha, Rasm, Jadval, Forma) bitta loyihaga birlashtirish. Bu sizning IT sohasidagi birinchi portfoliongiz bo'ladi!</p>",
          code: "",
          language: "html"
        }
      ],
      task: {
        description: "Mukammal mini-portfolio yarating.",
        requirements: [
          "<header> ichida <h1> tagida Ismingizni yozing",
          "<main> ichida <p> bilan o'zingiz haqingizda qisqacha ma'lumot bering",
          "Saytning pastida kishi sizga xabar yozishi uchun <form> yarating (ichida input va button bo'lsin)"
        ],
        hints: ["O'zingizni erkin qo'ying. Xohlasangiz rasm (img) yoki qobiliyatlaringiz ro'yxatini (table) ham qo'shishingiz mumkin."],
        mustInclude: ["<header>", "<h1>", "<main>", "<p>", "<form>"],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Mening Portfoliom</title>\n</head>\n<body>\n\n  \n\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "HTML qaysi texnologiyalar bilan birgalikda 'Veb Dasturlashning Muqaddas Uchliligi'ni tashkil qiladi?",
          options: ["Python va Django", "CSS va JavaScript", "React va Node.js", "PHP va MySQL"],
          correct: 1,
          explanation: "HTML - strukturani, CSS - dizaynni, JavaScript - interaktiv mantiqni ta'minlaydi."
        }
      ]
    }
    
  }, // HTML kursi tugadi
  
  // ==========================================
  // 2 - CSS KURSI (courseId: 2)
  // ==========================================
  2: { 
    // ----------------------------------------
    // 1-DARS: CSS nima?
    // ----------------------------------------
    1: {
      id: 1,
      title: "CSS nima va u qanday ishlaydi?",
      type: "programming",
      slides: [
        {
          icon: "🎨",
          title: "Dizayn sehri",
          content: "<p><b>CSS</b> (Cascading Style Sheets) — bu veb-sahifalarga dizayn berish (rang, o'lcham, joylashuv) uchun ishlatiladigan tildir. Agar HTML saytning suyaklari bo'lsa, CSS uning ustidagi kiyimidir.</p>"
        },
        {
          icon: "🔗",
          title: "CSS ni ulash usullari",
          content: "<p>CSS ni HTML ga ulashning 3 xil usuli bor: <b>Inline</b> (teg ichida), <b>Internal</b> (head ichida &lt;style&gt; orqali) va <b>External</b> (alohida .css faylda). Amaliyotda har doim External usuli tavsiya etiladi, ammo o'rganish uchun hozir Internal ishlatamiz.</p>",
          code: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    h1 { color: red; }\n    p { font-size: 20px; }\n  </style>\n</head>\n<body>\n  <h1>Qizil sarlavha</h1>\n</body>\n</html>",
          language: "html"
        }
      ],
      task: {
        description: "Sahifadagi matnlarga CSS orqali dizayn bering.",
        requirements: [
          "<style> tegi ichida kod yozing",
          "<h1> sarlavhasining rangini ko'k (blue) qiling",
          "<p> matnining orqa fonini (background-color) sariq (yellow) qiling"
        ],
        hints: ["CSS xususiyatlari figurali qavslar { } ichida yoziladi va nuqtali vergul (;) bilan tugaydi."],
        mustInclude: ["<style>", "<h1>", "<p>"],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    /* CSS kodingizni shu yerga yozing */\n    \n  </style>\n</head>\n<body>\n  <h1>CSS Asoslari</h1>\n  <p>Men CSS o'rganishni boshladim!</p>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Veb-sahifaning ko'rinishi, ranglari va dizaynini qaysi til belgilab beradi?",
          options: ["HTML", "JavaScript", "Python", "CSS"],
          correct: 3,
          explanation: "CSS (Cascading Style Sheets) veb-sahifalarning vizual ko'rinishi va formatlash uchun javobgar tildir."
        }
      ]
    },

    // ----------------------------------------
    // 2-DARS: Selektorlar
    // ----------------------------------------
    2: {
      id: 2,
      title: "Selektorlar (Class va ID)",
      type: "programming",
      slides: [
        {
          icon: "🎯",
          title: "Selektor nima?",
          content: "<p>CSS da dizayn bermoqchi bo'lgan HTML elementimizni tutib olish uchun <b>selektorlardan</b> foydalanamiz. Shunchaki teg nomini yozsak, sahifadagi hamma shunday teglar o'zgarib ketadi.</p>"
        },
        {
          icon: "🏷️",
          title: "Class va ID",
          content: "<p>Aniq bir elementni tanlash uchun <b>class</b> (nuqta bilan) yoki <b>id</b> (panjara bilan) ishlatamiz. <b>Class</b> ko'p elementlarga berilishi mumkin, <b>ID</b> esa sahifada faqat bitta bo'lishi shart.</p>",
          code: "<style>\n  /* Tag selektor */\n  h1 { color: black; }\n  \n  /* Class selektor (Nuqta bilan) */\n  .maxsus-matn { color: blue; }\n\n  /* ID selektor (Panjara bilan) */\n  #yagona-tugma { background: red; }\n</style>",
          language: "css"
        }
      ],
      task: {
        description: "Class va ID lardan foydalanib elementlarga turli xil dizayn bering.",
        requirements: [
          ".box klassiga ega elementning kengligi (width) va balandligini (height) 100px qiling",
          ".box klassiga ega elementning background-color ini green qiling",
          "#special ID siga ega elementning rangini (color) white qiling"
        ],
        hints: ["Class uchun nuqta (.), ID uchun panjara (#) ishlatishni unutmang."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    /* CSS kodingizni shu yerga yozing */\n    \n  </style>\n</head>\n<body>\n  <div class=\"box\" id=\"special\">Maxsus quti</div>\n  <div class=\"box\">Oddiy quti</div>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "HTML dagi class=\"card\" elementini CSS da tanlab olish uchun qaysi belgi ishlatiladi?",
          options: ["#card", ".card", "*card", "card()"],
          correct: 1,
          explanation: "Class larni tanlash uchun har doim nuqta (.) belgisi ishlatiladi. Panjara (#) esa ID lar uchun."
        }
      ]
    },

    // ----------------------------------------
    // 3-DARS: Box Model
    // ----------------------------------------
    3: {
      id: 3,
      title: "Box Model (Quti modeli)",
      type: "programming",
      slides: [
        {
          icon: "📦",
          title: "Hamma narsa - Quti",
          content: "<p>CSS da har bir HTML elementi to'rtburchak quti (box) hisoblanadi. Bu quti 4 ta qismdan iborat: <b>Content</b> (Ichki matn/rasm), <b>Padding</b> (Ichki bo'shliq), <b>Border</b> (Chegara) va <b>Margin</b> (Tashqi bo'shliq).</p>"
        },
        {
          icon: "📏",
          title: "Padding va Margin",
          content: "<p><b>Padding</b> - Chegara va matn orasidagi masofa (elementni ichidan kattalashtiradi).<br/><b>Margin</b> - Chegaradan tashqaridagi masofa (elementni boshqa elementlardan uzoqlashtiradi).</p>",
          code: ".quti {\n  width: 200px;\n  padding: 20px; /* Ichkaridan 20px bo'sh joy */\n  border: 2px solid black; /* Qora chegara */\n  margin: 30px; /* Tashqaridan boshqalarni itarish */\n}",
          language: "css"
        }
      ],
      task: {
        description: "Quti modelidan foydalanib chiroyli knopka (button) yasang.",
        requirements: [
          ".btn klassiga ega tugmaga 15px padding bering",
          "Tugmaning chegarasini (border) yo'q qiling (none)",
          "Orqa fonini (background-color) ko'k (blue) va matn rangini (color) oq (white) qiling",
          "Yonidagi matndan uzoqlashishi uchun 20px margin bering"
        ],
        hints: ["Barcha o'lchamlar oxirida px (piksel) yozilishini unutmang."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .btn {\n      /* Kodingizni yozing */\n      \n    }\n  </style>\n</head>\n<body>\n  <button class=\"btn\">Meni bosing</button>\n  <span>Yonidagi matn</span>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Elementning chegarasi (border) va ichki kontenti (matni) orasidagi bo'shliq qanday ataladi?",
          options: ["Margin", "Spacing", "Padding", "Width"],
          correct: 2,
          explanation: "Padding elementning ichki chegarasi bo'lib, kontent va border orasidagi masofani belgilaydi."
        }
      ]
    },

    // ----------------------------------------
    // 4-DARS: Flex container
    // ----------------------------------------
    4: {
      id: 4,
      title: "Flexbox Asoslari (Flex Container)",
      type: "programming",
      slides: [
        {
          icon: "🗂️",
          title: "Flexbox nima?",
          content: "<p><b>Flexbox</b> (Flexible Box) - bu elementlarni qator yoki ustun shaklida juda oson va moslashuvchan (responsive) qilib joylashtirish imkonini beruvchi CSS texnologiyasi.</p>"
        },
        {
          icon: "↔️",
          title: "Asosiy buyruqlar",
          content: "<p>Elementlarni yonma-yon qilish uchun ularning otasiga (container) <b>display: flex;</b> beramiz.<br/><b>justify-content:</b> gorizontal joylashuvni boshqaradi (masalan: center, space-between).<br/><b>align-items:</b> vertikal joylashuvni boshqaradi (masalan: center, flex-end).</p>",
          code: ".container {\n  display: flex;\n  justify-content: center; /* Gorizontal o'rtaga */\n  align-items: center; /* Vertikal o'rtaga */\n  height: 100vh; /* Ekranni to'liq egallash */\n}",
          language: "css"
        }
      ],
      task: {
        description: "Flexbox yordamida ichki elementlarni qutining huddi o'rtasiga keltiring.",
        requirements: [
          ".container ga display: flex bering",
          "justify-content yordamida elementlarni gorizontal o'rtaga keltiring",
          "align-items yordamida ularni vertikal o'rtaga keltiring"
        ],
        hints: ["Markazga keltirish uchun ikkala xususiyatga ham 'center' qiymati beriladi."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .container {\n      height: 300px;\n      background-color: #eee;\n      /* Flex kodingiz bu yerga */\n      \n    }\n    .box {\n      width: 50px; height: 50px;\n      background-color: blue;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"box\"></div>\n  </div>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Flexbox ishga tushishi uchun ota elementga qanday buyruq berilishi shart?",
          options: ["flex-direction: row;", "align-items: center;", "display: block;", "display: flex;"],
          correct: 3,
          explanation: "Flexbox tizimini yoqish uchun har doim ota (container) elementga display: flex; beriladi."
        }
      ]
    },

    // ----------------------------------------
    // 5-DARS: Flex items
    // ----------------------------------------
    5: {
      id: 5,
      title: "Flex items (Ichki elementlarni boshqarish)",
      type: "programming",
      slides: [
        {
          icon: "🧩",
          title: "O'sish va Qisqarish",
          content: "<p>Ota elementga emas, aynan ichki elementlarga (items) ham alohida buyruqlar bersa bo'ladi. Ulardan eng asosiysi <b>flex-grow</b>. Bu elementning qolgan bo'sh joyni qanchalik egallab olishini belgilaydi.</p>"
        },
        {
          icon: "🔄",
          title: "Order (Tartib)",
          content: "<p>HTML da elementlar qanday ketma-ketlikda yozilgan bo'lsa, shunday chiqadi. Ammo flexbox dagi <b>order</b> xususiyati orqali ularning HTML ni o'zgartirmasdan, ekrandagi o'rnini (ketma-ketligini) o'zgartirish mumkin.</p>",
          code: ".item1 {\n  flex-grow: 1; /* Hamma bo'sh joyni oladi */\n}\n.item2 {\n  order: -1; /* Hamma elementlardan oldinga o'tadi */\n}",
          language: "css"
        }
      ],
      task: {
        description: "O'rtadagi element hamma bo'sh joyni egallab olsin va oxirgi element birinchiga o'tsin.",
        requirements: [
          ".middle elementiga flex-grow: 1 bering",
          ".last elementiga order yordamida shunday qiymat beringki, u birinchi bo'lib ko'rinsin"
        ],
        hints: ["Orderning standart qiymati 0. Uni boshiga o'tkazish uchun manfiy son (-1) berish mumkin."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .container { display: flex; gap: 10px; }\n    .box { padding: 20px; background: orange; }\n    \n    .middle {\n      /* Kodingizni yozing */\n    }\n    .last {\n      /* Kodingizni yozing */\n    }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"box\">Birinchi</div>\n    <div class=\"box middle\">O'rtadagi</div>\n    <div class=\"box last\">Oxirgi</div>\n  </div>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Elementga mavjud bo'sh joyni to'liq egallashni buyuruvchi xususiyat qaysi?",
          options: ["flex-wrap", "align-self", "flex-grow", "justify-content"],
          correct: 2,
          explanation: "flex-grow xususiyati elementning qolgan bo'sh hududni qanchalik qismini egallashini belgilaydi."
        }
      ]
    },

    // ----------------------------------------
    // 6-DARS: Amaliy misol (Navbar)
    // ----------------------------------------
    6: {
      id: 6,
      title: "Flexbox Amaliyoti (Menyu yasash)",
      type: "programming",
      slides: [
        {
          icon: "🛠️",
          title: "Haqiqiy loyiha",
          content: "<p>Deyarli barcha zamonaviy veb-saytlarning eng tepasidagi navigatsiya menyusi (Navbar) aynan Flexbox yordamida yasaladi.</p>"
        },
        {
          icon: "🌌",
          title: "Space-between sehri",
          content: "<p>Agar Navbarning chap tomonida Logotip, o'ng tomonida esa Menyular bo'lishini xohlasak, otasiga display: flex va <b>justify-content: space-between;</b> beramiz. Bu elementlarni ikki chetga surib tashlaydi.</p>",
          code: ".navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 20px;\n  background: #333;\n  color: white;\n}",
          language: "css"
        }
      ],
      task: {
        description: "Zamonaviy veb-sayt menyusini yarating.",
        requirements: [
          ".navbar klassiga display flex bering",
          "Logotip va menyularni ikki chekkaga ajratish uchun space-between ishlating",
          "Elementlar vertikal o'rtada bo'lishi uchun align-items: center bering"
        ],
        hints: ["Hamma ishlarni faqat .navbar klassi ichida qilasiz."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .navbar {\n      background-color: #1e293b;\n      color: white;\n      padding: 15px 30px;\n      /* Kodingizni yozing */\n      \n    }\n    .links { display: flex; gap: 20px; }\n  </style>\n</head>\n<body>\n  <nav class=\"navbar\">\n    <div class=\"logo\"><h1>Uzbekas</h1></div>\n    <div class=\"links\">\n      <span>Asosiy</span>\n      <span>Kurslar</span>\n      <span>Aloqa</span>\n    </div>\n  </nav>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Flexboxda elementlarni ikki chekkaga (biri boshiga, biri oxiriga) ajratib yuborish uchun justify-content ga qanday qiymat beriladi?",
          options: ["center", "space-around", "space-between", "flex-end"],
          correct: 2,
          explanation: "space-between elementlar orasida teng bo'shliq qoldirib, ularni ekranning ikki chetiga joylashtiradi."
        }
      ]
    },

    // ----------------------------------------
    // 7-DARS: Grid Asoslari
    // ----------------------------------------
    7: {
      id: 7,
      title: "Grid Asoslari",
      type: "programming",
      slides: [
        {
          icon: "🧮",
          title: "Grid nima o'zi?",
          content: "<p>Flexbox asosan bir o'lchamda (faqat qator yoki faqat ustun) ishlash uchun mo'ljallangan bo'lsa, <b>CSS Grid</b> bir vaqtning o'zida ham qator (row), ham ustunlar (column) bilan ishlashga imkon beradigan eng kuchli tizimdir.</p>"
        },
        {
          icon: "📐",
          title: "Ustunlar yaratish",
          content: "<p>Otaga <b>display: grid;</b> berilgach, <b>grid-template-columns</b> orqali nechta ustun bo'lishini va ularning kengligini aytamiz. <br/>Masalan: <i>100px 100px 100px</i> desak, 3 ta teng ustun ochiladi.</p>",
          code: ".grid-container {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr; /* 3 ta teng ustun (fraction) */\n  gap: 20px; /* Elementlar orasidagi masofa */\n}",
          language: "css"
        }
      ],
      task: {
        description: "CSS Grid yordamida mahsulotlar uchun 3 ustunli layout (to'r) yasang.",
        requirements: [
          ".grid-layout klassiga display: grid bering",
          "grid-template-columns yordamida 3 ta teng (1fr 1fr 1fr) ustun hosil qiling",
          "Kardlar yopishib qolmasligi uchun gap: 20px bering"
        ],
        hints: ["'fr' (fraction) Grid uchun maxsus o'lchov birligi bo'lib, bo'sh joyni teng qismlarga bo'ladi."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .grid-layout {\n      /* Grid kodingizni yozing */\n      \n    }\n    .card {\n      background: #3b82f6;\n      color: white;\n      padding: 30px;\n      text-align: center;\n      border-radius: 10px;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"grid-layout\">\n    <div class=\"card\">Kurs 1</div>\n    <div class=\"card\">Kurs 2</div>\n    <div class=\"card\">Kurs 3</div>\n    <div class=\"card\">Kurs 4</div>\n  </div>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Grid tizimida elementlar orasidagi bo'shliqni qaysi xususiyat orqali ochamiz?",
          options: ["margin", "padding", "space", "gap"],
          correct: 3,
          explanation: "Grid (va Flexbox) tizimida elementlar o'rtasidagi toza bo'shliqni ochish uchun 'gap' ishlatiladi."
        }
      ]
    },
    // ----------------------------------------
    // 8-DARS: Grid Areas
    // ----------------------------------------
    8: {
      id: 8,
      title: "Grid Areas (Hududlarni nomlash)",
      type: "programming",
      slides: [
        {
          icon: "🗺️",
          title: "Grid Areas nima?",
          content: "<p>Grid tizimining eng zo'r xususiyati shundaki, siz xuddi qog'ozga chizgandek, sayt hududlariga nom berib chiqishingiz va elementlarni o'sha nomga qarab joylashtirishingiz mumkin.</p>"
        },
        {
          icon: "🏗️",
          title: "Nomlash va Joylash",
          content: "<p>Otaga <b>grid-template-areas</b> orqali xarita tuzamiz. Bolalarga esa <b>grid-area</b> orqali o'sha xaritadan joy beramiz.</p>",
          code: ".container {\n  display: grid;\n  grid-template-areas: \n    'header header header'\n    'sidebar main main'\n    'footer footer footer';\n}\n\n.header { grid-area: header; }\n.main { grid-area: main; }",
          language: "css"
        }
      ],
      task: {
        description: "Grid Areas yordamida klassik sayt maketini (Header, Main, Footer) yasang.",
        requirements: [
          ".layout ga grid-template-areas orqali tepada 'header', o'rtada 'main', pastda 'footer' xaritasini chizing (har biri bittadan ustun bo'lsin)",
          ".header qismiga grid-area: header bering",
          ".main va .footer larga ham o'z nomini bering"
        ],
        hints: ["E'tibor bering, hudud nomlari qo'shtirnoq (' ') ichida yoziladi."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .layout {\n      display: grid;\n      gap: 10px;\n      /* Grid Areas kodingiz */\n\n    }\n    .box { padding: 20px; background: #3b82f6; color: white; text-align: center; }\n    .header { /* ... */ }\n    .main { /* ... */ }\n    .footer { /* ... */ }\n  </style>\n</head>\n<body>\n  <div class=\"layout\">\n    <div class=\"box header\">Tepa qism</div>\n    <div class=\"box main\">Asosiy qism</div>\n    <div class=\"box footer\">Pastki qism</div>\n  </div>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Grid ichidagi maxsus bolaga xaritadagi joyni ajratib berish uchun qaysi xususiyat ishlatiladi?",
          options: ["grid-template", "grid-column", "grid-area", "grid-name"],
          correct: 2,
          explanation: "grid-area orqali ota elementda belgilangan (grid-template-areas) nomli hududga bolani biriktirish mumkin."
        }
      ]
    },

    // ----------------------------------------
    // 9-DARS: Responsive
    // ----------------------------------------
    9: {
      id: 9,
      title: "Moslashuvchanlik (Responsive & Media Queries)",
      type: "programming",
      slides: [
        {
          icon: "📱",
          title: "Responsive dizayn",
          content: "<p>Veb-saytingiz ham kompyuterda, ham telefonda chiroyli ko'rinishi shart. Ekranning o'lchamiga qarab CSS kodlarini o'zgartirish uchun <b>Media Queries (@media)</b> ishlatiladi.</p>"
        },
        {
          icon: "📏",
          title: "@media qanday yoziladi?",
          content: "<p>Biz brauzerga \"Agar ekran kengligi 768px dan kichkina bo'lsa, quyidagi CSS kodlarni ishlat\" deb shart beramiz.</p>",
          code: "/* Oddiy holatda (Kompyuterda) qizil */\n.box { background: red; }\n\n/* Telefon ekranida ko'k bo'ladi */\n@media (max-width: 768px) {\n  .box {\n    background: blue;\n    flex-direction: column;\n  }\n}",
          language: "css"
        }
      ],
      task: {
        description: "Ekran qisqarganda (mobil versiyada) qutining rangi va hajmi o'zgaradigan qiling.",
        requirements: [
          "@media (max-width: 600px) qoidasini yozing",
          "Uning ichida .card klassining fonini (background-color) yashil (green) qiling",
          ".card kengligini (width) 100% qilib o'zgartiring"
        ],
        hints: ["Media query blokining o'z figurali qavslari {} bo'ladi va uning ichida yana elementning qavslari {} ochiladi."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .card {\n      background-color: blue;\n      width: 300px;\n      height: 200px;\n      color: white;\n      padding: 20px;\n    }\n    \n    /* Media Query ni shu yerga yozing */\n    \n  </style>\n</head>\n<body>\n  <div class=\"card\">Ekranni kichraytirib ko'ring!</div>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Media Queries da 'max-width: 768px' nimani anglatadi?",
          options: ["Ekran aniq 768px bo'lgandagina ishlaydi", "Ekran 768px dan katta bo'lganda ishlaydi", "Ekran 768px yoki undan kichik bo'lganda ishlaydi", "Ekran o'lchami muhim emas"],
          correct: 2,
          explanation: "max-width (maksimal kenglik) - ekran 768 piksel yoki undan kichik bo'lgan barcha holatlarda (asosan telefon va planshetlar) ishlaydi."
        }
      ]
    },

    // ----------------------------------------
    // 10-DARS: Transition
    // ----------------------------------------
    10: {
      id: 10,
      title: "Silliq o'zgarishlar (Transition)",
      type: "programming",
      slides: [
        {
          icon: "✨",
          title: "Hover va Transition",
          content: "<p>Element ustiga sichqoncha borganda (<b>:hover</b>) uning ko'rinishi o'zgarishi mumkin. Lekin bu o'zgarish keskin bo'lmasligi, silliq va chiroyli o'tishi uchun <b>transition</b> dan foydalanamiz.</p>"
        },
        {
          icon: "⏱️",
          title: "Qanday ishlatiladi?",
          content: "<p>Transition xususiyatiga nima o'zgarishi va qancha vaqt davom etishini yozamiz. Masalan, <i>transition: background 0.3s ease;</i></p>",
          code: ".btn {\n  background: blue;\n  /* Barcha o'zgarishlar 0.5 soniya davom etsin */\n  transition: all 0.5s ease; \n}\n\n.btn:hover {\n  background: red;\n}",
          language: "css"
        }
      ],
      task: {
        description: "Tugma ustiga borganda rangi silliq o'zgaradigan animatsiya qiling.",
        requirements: [
          ".btn klassiga transition: all 0.4s ease; qo'shing",
          ".btn:hover holati uchun background-color ni orange qiling",
          ".btn:hover da matn rangini (color) black qiling"
        ],
        hints: ["Transition doim elementning o'ziga beriladi, :hover qismiga emas."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .btn {\n      background-color: #3b82f6;\n      color: white;\n      padding: 15px 30px;\n      border: none;\n      border-radius: 8px;\n      cursor: pointer;\n      /* Transition qo'shing */\n      \n    }\n    \n    /* Hover holatini yozing */\n    \n  </style>\n</head>\n<body>\n  <button class=\"btn\">Meni silliq o'zgartir</button>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Element animatsiyasi qancha vaqt davom etishini qaysi xususiyat nazorat qiladi?",
          options: ["transition-delay", "transition-property", "transition-duration", "transition-timing"],
          correct: 2,
          explanation: "transition-duration (masalan 0.5s yoki 500ms) animatsiyaning qancha vaqt ichida sodir bo'lishini bildiradi."
        }
      ]
    },

    // ----------------------------------------
    // 11-DARS: @keyframes
    // ----------------------------------------
    11: {
      id: 11,
      title: "Murakkab animatsiyalar (@keyframes)",
      type: "programming",
      slides: [
        {
          icon: "🎬",
          title: "Kadrlar (Keyframes)",
          content: "<p>Transition faqat bitta holatdan ikkinchisiga o'tadi. Lekin uzluksiz, bir necha qadamli murakkab animatsiyalar (masalan, yurak urishi, aylanayotgan yuklanish oynasi) yaratish uchun <b>@keyframes</b> kerak.</p>"
        },
        {
          icon: "🎭",
          title: "Animatsiyani e'lon qilish",
          content: "<p>Avval @keyframes orqali animatsiya ssenariysini yozib olamiz (0% dan 100% gacha). Keyin uni elementga <b>animation</b> xususiyati bilan ulab qo'yamiz.</p>",
          code: "/* Ssenariy */\n@keyframes sakrash {\n  0% { margin-top: 0; }\n  50% { margin-top: -20px; }\n  100% { margin-top: 0; }\n}\n\n.koptok {\n  animation: sakrash 1s infinite; /* infinite - cheksiz takrorlash */\n}",
          language: "css"
        }
      ],
      task: {
        description: "Cheksiz miltillovchi (pulsatsiya) qiladigan doira yasang.",
        requirements: [
          "@keyframes pulse nomli animatsiya oching",
          "0% holatda background-color: blue bo'lsin",
          "50% holatda background-color: lightblue bo'lsin",
          "100% holatda yana blue ga qaytsin",
          ".circle klassiga shu animatsiyani (animation: pulse 2s infinite;) ulab qo'ying"
        ],
        hints: ["@keyframes har doim faylning alohida joyida yoziladi, boshqa klass ichida emas."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .circle {\n      width: 100px; height: 100px;\n      border-radius: 50%;\n      background-color: blue;\n      /* Animatsiyani ulang */\n      \n    }\n    \n    /* @keyframes yarating */\n    \n  </style>\n</head>\n<body>\n  <div class=\"circle\"></div>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Animatsiya hech qachon to'xtamasdan, cheksiz marta takrorlanishi uchun 'animation' xususiyatiga qaysi so'z qo'shiladi?",
          options: ["always", "loop", "infinite", "forever"],
          correct: 2,
          explanation: "infinite so'zi animatsiyaning takrorlanishlar soni cheksiz ekanligini bildiradi."
        }
      ]
    },

    // ----------------------------------------
    // 12-DARS: Transform
    // ----------------------------------------
    12: {
      id: 12,
      title: "Shaklni o'zgartirish (Transform)",
      type: "programming",
      slides: [
        {
          icon: "🌀",
          title: "Transform mo'jizalari",
          content: "<p>CSS dagi <b>transform</b> xususiyati elementlarni joyidan surish, aylantirish va kattalashtirish/kichiklashtirish uchun mo'ljallangan eng kuchli vositadir. Bu saytni buzib yubormaydi.</p>"
        },
        {
          icon: "🛠️",
          title: "Asosiy funksiyalar",
          content: "<p><b>translate(x, y)</b> - joyidan jildirish.<br/><b>rotate(deg)</b> - aylantirish (masalan: 45deg).<br/><b>scale(n)</b> - hajmini o'zgartirish (1.5 - bir yarim baravar katta).</p>",
          code: ".card:hover {\n  transform: scale(1.1) rotate(5deg);\n  /* Kattalashib, 5 gradusga qiyshayadi */\n}",
          language: "css"
        }
      ],
      task: {
        description: "Hover holatida kardni kattalashtiruvchi zamonaviy effekt yasang.",
        requirements: [
          ".box klassiga transition: transform 0.3s ease; bering",
          ".box:hover holati uchun transform: scale(1.2); bering",
          "Kard qiyalashi uchun scale yoniga rotate(-10deg) ham qo'shing"
        ],
        hints: ["Bir nechta transform effektlari orasiga vergul qo'yilmaydi, probel bilan yoziladi."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .box {\n      width: 150px; height: 200px;\n      background: linear-gradient(135deg, #f59e0b, #ef4444);\n      border-radius: 15px;\n      color: white;\n      display: flex; align-items: center; justify-content: center;\n      /* Transition yozing */\n      \n    }\n    \n    /* Hover holatini yozing */\n    \n  </style>\n</head>\n<body>\n  <div class=\"box\">Kard</div>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Elementni 2 barobar kattalashtirish uchun qaysi funksiyadan foydalaniladi?",
          options: ["size(2)", "zoom(200%)", "scale(2)", "enlarge(2)"],
          correct: 2,
          explanation: "scale() funksiyasi elementning masshtabini o'zgartiradi. scale(1) asl holati, scale(2) esa ikki barobar katta degani."
        }
      ]
    },

    // ----------------------------------------
    // 13-DARS: Yakuniy Loyiha
    // ----------------------------------------
    13: {
      id: 13,
      title: "Yakuniy Loyiha (CSS Maestrosi)",
      type: "programming",
      slides: [
        {
          icon: "🎓",
          title: "Ajoyib Natija!",
          content: "<p>Siz CSS ning barcha eng kerakli va zamonaviy xususiyatlarini (Flexbox, Grid, Animatsiyalar va Responsive dizayn) o'rganib chiqdingiz!</p>"
        },
        {
          icon: "🚀",
          title: "Dizaynni birlashtiramiz",
          content: "<p>Endi o'rgangan bilimlarimizdan foydalanib, chiroyli kard (Maxsulot yoki Kurs formati) yasashga harakat qilamiz. Box model, ranglar va hover effektlari yodingizdami?</p>",
          code: "/* CSS arsenalimiz: */\n.card {\n  display: flex;\n  padding: 20px;\n  transition: all 0.3s ease;\n}\n.card:hover {\n  transform: translateY(-10px);\n}\n@media (max-width: 600px) {\n  .card { flex-direction: column; }\n}",
          language: "css"
        }
      ],
      task: {
        description: "Zamonaviy, ustiga borganda ko'tariladigan (Hover lift) chiroyli quti (kard) yasang.",
        requirements: [
          ".kard klassiga oq fon, 20px padding va radius bering",
          "Kard ustiga borganda (hover) transform: translateY(-10px); ishlasin",
          "Bu jarayon silliq bo'lishi uchun transition ishlating",
          "Ixtiyoriy: Flexbox yordamida kard ichidagi matnni markazga keltiring"
        ],
        hints: ["O'zingizni erkin his qiling! Loyihani xohlaganingizcha bezating."],
        mustInclude: [],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background-color: #f1f5f9; padding: 50px; }\n    \n    /* Loyihangizni shu yerdan boshlang */\n    .kard {\n      \n    }\n    \n  </style>\n</head>\n<body>\n  <div class=\"kard\">\n    <h2>Mening zo'r kardim</h2>\n    <p>CSS juda qiziqarli til ekan!</p>\n  </div>\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "Veb-saytlarni yaratishda HTML va CSS ning qanday farqi bor?",
          options: ["HTML ranglarni, CSS animatsiyalarni belgilaydi", "HTML tuzilmani (skelet), CSS esa dizayn va ko'rinishni (teri/kiyim) belgilaydi", "Ular bir xil ishni bajaradi", "CSS faqat telefonlar uchun kerak"],
          correct: 1,
          explanation: "HTML - sayt strukturasini, CSS - vizual dizaynni (ranglar, o'lchamlar, joylashuv, animatsiyalar) ta'minlaydi."
        }
      ]
    }

  }, // CSS kursi tugadi
  // ==========================================
  // 3 - JAVASCRIPT TO'LIQ KURS (courseId: 3)
  // ==========================================
  3: {
    // ----------------------------------------
    // 1-DARS: JavaScript nima?
    // ----------------------------------------
    1: {
      id: 1,
      title: "JavaScript nima va u nima qila oladi?",
      type: "programming",
      slides: [
        {
          icon: "⚡",
          title: "Saytning miyasi",
          content: "<p><b>JavaScript (JS)</b> — bu veb-sahifalarga 'jon' kirituvchi dasturlash tili. HTML saytning suyagi, CSS uning dizayni bo'lsa, JS uning harakatlari va aqlidir (masalan: tugma bosilganda oyna ochilishi, ma'lumotlarni hisoblash).</p>"
        },
        {
          icon: "🖨️",
          title: "Konsol bilan ishlash",
          content: "<p>Dasturchilar kod qanday ishlayotganini ko'rish uchun <b>console.log()</b> buyrug'idan foydalanishadi. Bu buyruq natijani brauzerning maxsus 'Console' oynasiga chiqarib beradi.</p>",
          code: "// Ekranga yozuv chiqarish\nconsole.log('Salom, JavaScript!');\n\n// Matematik amal\nconsole.log(5 + 10);",
          language: "javascript"
        }
      ],
      task: {
        description: "Console yordamida o'zingiz haqingizda ma'lumot chiqaring.",
        requirements: [
          "console.log() yordamida ismingizni chiqaring",
          "Ikkinchi console.log() ichida tug'ilgan yilingizni (raqam ko'rinishida) chiqaring"
        ],
        hints: ["Matnlar (so'zlar) doim qo'shtirnoq (' ' yoki \" \") ichida yoziladi, raqamlarga esa qo'shtirnoq shart emas."],
        mustInclude: [],
        starterCode: "// Kodingizni shu yerga yozing\n\n"
      },
      quizQuestions: [
        {
          question: "JavaScriptda natijani dasturchi ko'rishi uchun qaysi buyruq orqali konsolga chiqariladi?",
          options: ["print()", "document.write()", "console.log()", "display()"],
          correct: 2,
          explanation: "console.log() — bu kodning qanday ishlayotganini va o'zgaruvchilar qiymatini tekshirish uchun eng ko'p ishlatiladigan buyruq."
        }
      ]
    },

    // ----------------------------------------
    // 2-DARS: O'zgaruvchilar
    // ----------------------------------------
    2: {
      id: 2,
      title: "O'zgaruvchilar (Variables)",
      type: "programming",
      slides: [
        {
          icon: "📦",
          title: "Qutilar",
          content: "<p>O'zgaruvchilar — bu kompyuter xotirasidagi ma'lumot saqlanadigan qutilar. Biz ularga nom beramiz va ichiga kerakli ma'lumotni solib qo'yamiz.</p>"
        },
        {
          icon: "🔑",
          title: "let va const",
          content: "<p>Zamonaviy JS da o'zgaruvchilar ikki xil ochiladi:<br/><b>let</b> - Qiymati keyinchalik o'zgarishi mumkin bo'lgan quti.<br/><b>const</b> - Qiymati hech qachon o'zgarmaydigan (konstanta) quti.</p>",
          code: "let yosh = 20;\nyosh = 21; // let ni o'zgartirish mumkin\n\nconst ism = 'Ali';\n// ism = 'Vali'; // XATO! const o'zgarmaydi\n\nconsole.log(ism, yosh);",
          language: "javascript"
        }
      ],
      task: {
        description: "O'zgaruvchilar ochib, ularni ekranga chiqaring.",
        requirements: [
          "'ism' nomli const o'zgaruvchi oching va o'z ismingizni bering",
          "'yosh' nomli let o'zgaruvchi oching",
          "Ikkala o'zgaruvchini console.log() orqali chiqaring"
        ],
        hints: ["const ni ochgan joyning o'zida unga qiymat berish shart."],
        mustInclude: [],
        starterCode: "// O'zgaruvchilarni e'lon qiling\n\n\n"
      },
      quizQuestions: [
        {
          question: "Dastur ishlashi davomida qiymatini umuman o'zgartirib bo'lmaydigan o'zgaruvchini qaysi so'z bilan ochamiz?",
          options: ["var", "let", "const", "static"],
          correct: 2,
          explanation: "const (constant) - o'zgarmas ma'lumotlarni saqlash uchun ishlatiladi."
        }
      ]
    },

    // ----------------------------------------
    // 3-DARS: Ma'lumot turlari
    // ----------------------------------------
    3: {
      id: 3,
      title: "Ma'lumot turlari (Data Types)",
      type: "programming",
      slides: [
        {
          icon: "🗂️",
          title: "Primitiv turlar",
          content: "<p>JS da qutining (o'zgaruvchining) ichiga har xil turdagi ma'lumotlarni solish mumkin. Eng ko'p ishlatiladiganlari:<br/><b>String</b> - Matn ('Salom')<br/><b>Number</b> - Raqam (25, 3.14)<br/><b>Boolean</b> - Mantiqiy (true yoki false)</p>"
        },
        {
          icon: "👻",
          title: "Bo'sh qiymatlar",
          content: "<p>Agar o'zgaruvchi ochilsayu ichiga hech narsa solinmasa, u <b>undefined</b> bo'ladi. Agar o'zimiz ataylab qutini bo'shatib qo'ymoqchi bo'lsak, unga <b>null</b> beramiz.</p>",
          code: "let ism = 'Olim'; // String\nlet narx = 1500; // Number\nlet uylanganmi = false; // Boolean\n\nlet x; \nconsole.log(x); // undefined\n\nlet pul = null; // Hozircha pul yo'q",
          language: "javascript"
        }
      ],
      task: {
        description: "Turli ma'lumot turlariga oid o'zgaruvchilar oching.",
        requirements: [
          "'kasb' nomli String (matn) o'zgaruvchi oching",
          "'tajriba' nomli Number (raqam) o'zgaruvchi oching",
          "'dasturchimi' nomli Boolean (true/false) o'zgaruvchi oching",
          "Barchasini konsolga chiqaring"
        ],
        hints: ["Boolean va Number turlari uchun qo'shtirnoq ishlatmang."],
        mustInclude: [],
        starterCode: "// O'zgaruvchilarni e'lon qiling\n\n\n// Ularni konsolga chiqaring\n"
      },
      quizQuestions: [
        {
          question: "Faqat 'rost' (true) yoki 'yolg'on' (false) qiymat qabul qiladigan ma'lumot turi qanday ataladi?",
          options: ["String", "Number", "Boolean", "Undefined"],
          correct: 2,
          explanation: "Boolean (Mantiqiy) tur faqat true yoki false qiymatlariga ega bo'ladi."
        }
      ]
    },

    // ----------------------------------------
    // 4-DARS: Operatorlar
    // ----------------------------------------
    4: {
      id: 4,
      title: "Operatorlar (Hisob-kitoblar)",
      type: "programming",
      slides: [
        {
          icon: "➕",
          title: "Matematik operatorlar",
          content: "<p>JS xuddi kalkulyator kabi ishlay oladi. Barcha oddiy amallar mavjud: <b>+</b> (qo'shish), <b>-</b> (ayirish), <b>*</b> (ko'paytirish), <b>/</b> (bo'lish). Shuningdek <b>%</b> (qoldiqni topish) ham bor.</p>"
        },
        {
          icon: "⚖️",
          title: "Taqqoslash",
          content: "<p>Ikkita narsani solishtirish uchun operatorlar:<br/><b>></b> (katta), <b><</b> (kichik).<br/><b>===</b> (qattiq tenglik: ham qiymati, ham turini tekshiradi).<br/><b>!==</b> (teng emas).</p>",
          code: "let a = 10;\nlet b = 5;\nconsole.log(a + b); // 15\n\nconsole.log(a > b); // true\nconsole.log(a === 10); // true",
          language: "javascript"
        }
      ],
      task: {
        description: "Matematik amallar bajarib, natijani tekshiring.",
        requirements: [
          "'x' va 'y' nomli o'zgaruvchilarga raqamlar bering",
          "Ularning yig'indisini 'natija' nomli o'zgaruvchiga saqlang va chiqaring",
          "'x' katta 'y' ekanligini taqqoslab konsolga chiqaring"
        ],
        hints: ["Taqqoslash natijasi doim Boolean (true/false) bo'ladi."],
        mustInclude: [],
        starterCode: "let x = 20;\nlet y = 15;\n\n// Kodingizni yozing\n"
      },
      quizQuestions: [
        {
          question: "JavaScriptda ikkita qiymatning nafaqat qiymati, balki MA'LUMOT TURI ham bir xilligini tekshiruvchi belgi qaysi?",
          options: ["=", "==", "===", "!=="],
          correct: 2,
          explanation: "=== (Qattiq tenglik) ham qiymatni, ham ma'lumot turini (masalan, raqam va matnni) tekshiradi."
        }
      ]
    },

    // ----------------------------------------
    // 5-DARS: Shart operatorlari (If/Else)
    // ----------------------------------------
    5: {
      id: 5,
      title: "Shart operatorlari (If / Else)",
      type: "programming",
      slides: [
        {
          icon: "🔀",
          title: "Qaror qabul qilish",
          content: "<p>Dasturlar har doim ham bir xil ishlayvermaydi. Agar qandaydir shart bajarilsa bir ishni, bajarilmasa boshqa ishni qilish uchun <b>if</b> (agar) va <b>else</b> (aks holda) operatorlari ishlatiladi.</p>"
        },
        {
          icon: "🚦",
          title: "If, Else If, Else",
          content: "<p>Shartlar qavs <b>()</b> ichida yoziladi. Agar shart 'true' bo'lsa, figurali qavs <b>{}</b> ichidagi kod ishlaydi.</p>",
          code: "let baho = 4;\n\nif (baho === 5) {\n  console.log('Ajoyib natija!');\n} else if (baho === 4) {\n  console.log('Yaxshi!');\n} else {\n  console.log('Ko\\'proq o\\'qishingiz kerak.');\n}",
          language: "javascript"
        }
      ],
      task: {
        description: "Foydalanuvchining yoshiga qarab tizimga kirishiga ruxsat bering.",
        requirements: [
          "'yosh' o'zgaruvchisiga qiymat bering",
          "Agar yosh 18 ga teng yoki katta bo'lsa (>=), konsolga 'Xush kelibsiz' deb chiqaring",
          "Aks holda (else), konsolga 'Kirish mumkin emas' deb chiqaring"
        ],
        hints: [">= (katta yoki teng) operatoridan foydalaning."],
        mustInclude: [],
        starterCode: "let yosh = 16;\n\n// If/Else kodingizni yozing\n\n"
      },
      quizQuestions: [
        {
          question: "Qaysi kalit so'z 'if' dagi birinchi shart noto'g'ri bo'lgan hollarda yangi qo'shimcha shartni tekshirish uchun ishlatiladi?",
          options: ["else", "then", "else if", "catch"],
          correct: 2,
          explanation: "else if - orqali bir nechta turli shartlarni ketma-ket tekshirish mumkin."
        }
      ]
    },

    // ----------------------------------------
    // 6-DARS: Funksiyalar
    // ----------------------------------------
    6: {
      id: 6,
      title: "Funksiyalar (Functions)",
      type: "programming",
      slides: [
        {
          icon: "⚙️",
          title: "Funksiya nima?",
          content: "<p><b>Funksiya</b> — bu qayta-qayta ishlatish mumkin bo'lgan kodlar bloki (kichik zavod). Biz unga xomashyo beramiz, u ichida ishlab bizga tayyor natija qaytaradi.</p>"
        },
        {
          icon: "📝",
          title: "E'lon qilish va Chaqirish",
          content: "<p>Funksiya yaratilganda o'z-o'zidan ishlamaydi. Uni ishlashi uchun nomi bilan chaqirishimiz kerak. Natijani tashqariga uzatish uchun <b>return</b> so'zi ishlatiladi.</p>",
          code: "// Funksiya e'lon qilish (qurish)\nfunction qoshish(son1, son2) {\n  return son1 + son2;\n}\n\n// Funksiyani chaqirish (ishlatish)\nlet natija = qoshish(10, 5);\nconsole.log(natija); // 15",
          language: "javascript"
        }
      ],
      task: {
        description: "Ikki sonni ko'paytirib beradigan funksiya yarating.",
        requirements: [
          "'kopaytirish' nomli funksiya yarating, u ikkita (a, b) parametr qabul qilsin",
          "Ichida a va b ni ko'paytirib, return orqali qaytaring",
          "Funksiyani chaqirib, natijani konsolga chiqaring"
        ],
        hints: ["Funksiya chaqirilayotganda uzatiladigan ma'lumotlar argumentlar deyiladi."],
        mustInclude: [],
        starterCode: "// Funksiyani yarating\n\n\n// Chaqiring va natijani ko'ring\n"
      },
      quizQuestions: [
        {
          question: "Funksiya ishlashni to'xtatib, o'zidan qandaydir natijani tashqariga (chaqirilgan joyga) uzatishi uchun qaysi so'z ishlatiladi?",
          options: ["export", "output", "break", "return"],
          correct: 3,
          explanation: "return so'zi funksiyaning ishlashini to'xtatadi va ko'rsatilgan qiymatni natija sifatida qaytaradi."
        }
      ]
    },

    // ----------------------------------------
    // 7-DARS: Arrow Functions
    // ----------------------------------------
    7: {
      id: 7,
      title: "Zamonaviy Funksiyalar (Arrow Functions)",
      type: "programming",
      slides: [
        {
          icon: "🏹",
          title: "Arrow Function nima?",
          content: "<p>ES6 versiyasidan boshlab JavaScriptda funksiyalarni yozishning yangi, qisqa va chiroyli usuli paydo bo'ldi. Bu <b>=></b> (yo'naltirgich yoki o'q) belgisi yordamida yozilgani uchun Arrow Function deyiladi.</p>"
        },
        {
          icon: "✂️",
          title: "Qisqartirish san'ati",
          content: "<p>Agar funksiya faqat bitta qatordan iborat bo'lsa, hatto figurali qavslar `{}` va `return` so'zini yozish ham shart emas!</p>",
          code: "// Eski usul\nfunction salom(ism) {\n  return 'Salom ' + ism;\n}\n\n// Yangi Arrow Function\nconst salomYangi = (ism) => 'Salom ' + ism;\n\nconsole.log(salomYangi('Ali'));",
          language: "javascript"
        }
      ],
      task: {
        description: "Oddiy funksiyani Arrow function ko'rinishiga o'tkazing.",
        requirements: [
          "'kvadrat' nomli arrow function yarating",
          "U bitta parametr (son) qabul qilsin",
          "Shu sonning kvadratini (o'zini o'ziga ko'paytirib) qaytarsin"
        ],
        hints: ["Eng qisqa usuldan foydalaning (return so'zisiz)."],
        mustInclude: [],
        starterCode: "// Buni Arrow function qiling:\n// function kvadrat(son) {\n//   return son * son;\n// }\n\nconst kvadrat = \n\nconsole.log(kvadrat(4));"
      },
      quizQuestions: [
        {
          question: "Arrow function qaysi maxsus belgi yordamida tuziladi?",
          options: ["->", "=>", "<=", "~>"],
          correct: 1,
          explanation: "Arrow function '=>' (Teng va Katta) belgilarini birlashtirish orqali yoziladi."
        }
      ]
    },
    // ----------------------------------------
    // 8-DARS: DOM nima?
    // ----------------------------------------
    8: {
      id: 8,
      title: "DOM nima? (Brauzerni boshqarish)",
      type: "programming",
      slides: [
        {
          icon: "🌳",
          title: "Daraxtsimon struktura",
          content: "<p><b>DOM</b> (Document Object Model) — bu siz yozgan HTML kodning JavaScript tushunadigan ko'rinishi. Brauzer HTMLni o'qib, uni xuddi daraxt kabi tuzib chiqadi va JavaScript orqali shu daraxtning xohlagan shoxini uzish, o'zgartirish yoki yangi shox qo'shish mumkin.</p>"
        },
        {
          icon: "🤖",
          title: "Document obyekti",
          content: "<p>JavaScriptda butun boshli HTML sahifamiz <b>document</b> degan maxsus obyekt ichida saqlanadi. Biz shu <code>document</code> orqali HTML elementlariga murojaat qilamiz.</p>",
          code: "// Butun HTML sahifani ko'rish\nconsole.log(document);\n\n// Sahifaning sarlavhasini (title) ko'rish\nconsole.log(document.title);",
          language: "javascript"
        }
      ],
      task: {
        description: "Console orqali butun veb-sahifa haqida ma'lumot oling.",
        requirements: [
          "document obyektini console.log orqali chiqaring",
          "Sahifaning joriy sarlavhasini (document.title) chiqaring"
        ],
        hints: ["JavaScriptda document so'zi doim brauzerning o'zi tomonidan taqdim etiladi, uni alohida ochish shart emas."],
        mustInclude: [],
        starterCode: "// Kodingizni yozing\n\n"
      },
      quizQuestions: [
        {
          question: "JavaScriptda HTML sahifaning barcha elementlariga kirish uchun qaysi maxsus ota obyekt ishlatiladi?",
          options: ["window", "html", "document", "browser"],
          correct: 2,
          explanation: "document obyekti — veb-sahifaning JS dagi vakili hisoblanadi va barcha HTML elementlari uning ichida yotadi."
        }
      ]
    },

    // ----------------------------------------
    // 9-DARS: Element tanlash
    // ----------------------------------------
    9: {
      id: 9,
      title: "Elementlarni tanlash",
      type: "programming",
      slides: [
        {
          icon: "🎯",
          title: "Qanday qilib elementni topamiz?",
          content: "<p>Sahifadagi h1 yoki button kabi elementlarni JS ga chaqirib olishning bir nechta usullari bor. Eng mashhurlari: <b>getElementById</b> (faqat ID orqali) va <b>querySelector</b> (xuddi CSS dagi kabi class yoki tag nomlari bilan).</p>"
        },
        {
          icon: "🎣",
          title: "querySelector sehri",
          content: "<p><b>querySelector()</b> faqat birinchi topgan elementni oladi. Agar bir xil class'li hamma elementlar kerak bo'lsa <b>querySelectorAll()</b> ishlatiladi.</p>",
          code: "// ID orqali tanlash\nconst tugma = document.getElementById('btn');\n\n// Class orqali tanlash (CSS ga o'xshab nuqta bilan)\nconst matn = document.querySelector('.matn');\n\nconsole.log(matn);",
          language: "javascript"
        }
      ],
      task: {
        description: "HTML dan maxsus elementni JavaScript orqali tanlab oling.",
        requirements: [
          "document.querySelector orqali '.title' klassiga ega elementni tanlab, 'sarlavha' o'zgaruvchisiga saqlang",
          "O'sha o'zgaruvchini konsolga chiqaring"
        ],
        hints: ["querySelector ichiga CSS selektori yoziladi, ya'ni class uchun nuqta (.) qatnashishi shart."],
        mustInclude: [],
        starterCode: "// Kodingizni yozing\n\n"
      },
      quizQuestions: [
        {
          question: "Sahifadagi bir nechta bir xil klassga ega elementlarning BARCHASINI bitta ro'yxat qilib olish uchun qaysi metod ishlatiladi?",
          options: ["querySelector", "getAll", "querySelectorAll", "findElements"],
          correct: 2,
          explanation: "querySelectorAll usuli berilgan shartga tushadigan barcha elementlarni to'plab (Array kabi) qaytaradi."
        }
      ]
    },

    // ----------------------------------------
    // 10-DARS: Events
    // ----------------------------------------
    10: {
      id: 10,
      title: "Hodisalar (Events)",
      type: "programming",
      slides: [
        {
          icon: "🖱️",
          title: "Hodisa nima?",
          content: "<p>Foydalanuvchi saytda nima ish qilsa (sichqonchani bosish, klaviaturada yozish, sahifani pastga tushirish) bularning barchasi <b>Event</b> (Hodisa) deyiladi.</p>"
        },
        {
          icon: "👂",
          title: "Quloq tutish (addEventListener)",
          content: "<p>Element biror hodisani kutishi uchun unga <b>addEventListener()</b> quloqchinini taqib qo'yamiz. U ikkita narsa so'raydi: qaysi hodisa va nima ish qilish kerakligi (funksiya).</p>",
          code: "const tugma = document.querySelector('.btn');\n\ntugma.addEventListener('click', function() {\n  console.log('Tugma bosildi!');\n});",
          language: "javascript"
        }
      ],
      task: {
        description: "Tugmaga bosilganda ishlaydigan hodisa (Event) yozing.",
        requirements: [
          "Sizga allaqachon 'btn' elementi berilgan",
          "Shu 'btn' ga addEventListener orqali 'click' (bosish) hodisasini qo'shing",
          "Tugma bosilganda konsolga 'JavaScript juda qiziq!' deb chiqsin"
        ],
        hints: ["addEventListener ning ikkinchi parametri funksiya (arrow function bo'lsa ham bo'ladi) bo'lishi kerak."],
        mustInclude: [],
        starterCode: "const btn = document.querySelector('.btn');\n\n// Hodisani qo'shing\n"
      },
      quizQuestions: [
        {
          question: "Biror input (kiritish maydoni) ichiga foydalanuvchi klaviaturada narsa yozayotganini qaysi hodisa (event) orqali ushlab olish mumkin?",
          options: ["click", "submit", "input (yoki keyup)", "hover"],
          correct: 2,
          explanation: "Input yoki keyup hodisalari orqali foydalanuvchi yozayotgan har bir harfni ushlab olish va tekshirish mumkin."
        }
      ]
    },

    // ----------------------------------------
    // 11-DARS: DOM o'zgartirish
    // ----------------------------------------
    11: {
      id: 11,
      title: "DOM ni o'zgartirish",
      type: "programming",
      slides: [
        {
          icon: "🪄",
          title: "Sehrgar kabi o'zgartirish",
          content: "<p>Biz elementni tanlab olgach, uning ichidagi matnni, rasmini yoki CSS stillarini to'g'ridan-to'g'ri JavaScriptdan turib o'zgartirishimiz mumkin.</p>"
        },
        {
          icon: "🎨",
          title: "Matn va Stil",
          content: "<p>Matnni o'zgartirish uchun <b>innerText</b> yoki <b>textContent</b>, CSS ni o'zgartirish uchun esa <b>style</b> xususiyati ishlatiladi.</p>",
          code: "const quti = document.querySelector('.box');\n\n// Matnini o'zgartirish\nquti.innerText = 'Yangi matn!';\n\n// Dizaynni o'zgartirish\nquti.style.backgroundColor = 'blue';\nquti.style.color = 'white';",
          language: "javascript"
        }
      ],
      task: {
        description: "JavaScript orqali HTML dagi matnni va uning rangini o'zgartiring.",
        requirements: [
          "Sizga berilgan 'title' elementining matnini (innerText) 'Uzbekas Pixel' ga o'zgartiring",
          "Uning rangini (style.color) 'red' qilib qo'ying"
        ],
        hints: ["JavaScriptda CSS xususiyatlari chiziqchasiz (camelCase) yoziladi. Masalan, background-color emas, backgroundColor."],
        mustInclude: [],
        starterCode: "const title = document.querySelector('.title');\n\n// Matn va rangni o'zgartiring\n"
      },
      quizQuestions: [
        {
          question: "HTML elementiga faqat oddiy matn emas, HTML teglar qatnashgan kodni tiqib yuborish uchun qaysi xususiyat ishlatiladi?",
          options: ["innerText", "innerHTML", "outerText", "textContent"],
          correct: 1,
          explanation: "innerHTML element ichiga nafaqat matn, balki <strong>, <br> kabi HTML teglarni ham vizual ishlab ko'rsatuvchi xususiyatdir."
        }
      ]
    },

    // ----------------------------------------
    // 12-DARS: Destructuring
    // ----------------------------------------
    12: {
      id: 12,
      title: "Destructuring (Obyektlarni parchalash)",
      type: "programming",
      slides: [
        {
          icon: "🗃️",
          title: "Parçalash san'ati",
          content: "<p>ES6 (Zamonaviy JS) dagi <b>Destructuring</b> — bu obyekt (yoki massiv) ichidagi kerakli ma'lumotlarni osongina sug'urib olib, alohida o'zgaruvchilarga saqlash usulidir. Bu kodingizni juda qisqa qiladi.</p>"
        },
        {
          icon: "✂️",
          title: "Qanday ishlaydi?",
          content: "<p>Eski usulda `user.ism`, `user.yosh` deb qayta-qayta yozish kerak edi. Yangi usulda figurli qavslar `{}` yordamida obyektning ichidan faqat kerakli kalit so'zlarni sug'urib olamiz.</p>",
          code: "const user = { ism: 'Ali', yosh: 25, kasb: 'Dasturchi' };\n\n// Destructuring\nconst { ism, kasb } = user;\n\nconsole.log(ism); // 'Ali'\nconsole.log(kasb); // 'Dasturchi'",
          language: "javascript"
        }
      ],
      task: {
        description: "Berilgan obyekt ichidan kerakli ma'lumotlarni destructuring orqali oling.",
        requirements: [
          "'avto' nomli obyektdan 'model' va 'yil' ni destructuring yordamida ajratib oling",
          "Olingan 'model' va 'yil' o'zgaruvchilarini konsolga chiqaring"
        ],
        hints: ["const { } = obyekt_nomi; sintaksisidan foydalaning."],
        mustInclude: [],
        starterCode: "const avto = { marka: 'Tesla', model: 'Model 3', yil: 2024, rang: 'oq' };\n\n// Destructuring qiling\n\n\n// Konsolga chiqaring\n"
      },
      quizQuestions: [
        {
          question: "Massivlar (Array) ni destructuring qilishda qanday qavslardan foydalaniladi?",
          options: ["{ }", "( )", "[ ]", "< >"],
          correct: 2,
          explanation: "Obyektlarni ajratishda { }, massivlarni ajratishda esa [ ] qavslar ishlatiladi (Masalan: const [a, b] = [10, 20])."
        }
      ]
    },

    // ----------------------------------------
    // 13-DARS: Spread & Rest
    // ----------------------------------------
    13: {
      id: 13,
      title: "Spread va Rest (...) operatori",
      type: "programming",
      slides: [
        {
          icon: "✨",
          title: "Uchta nuqta mo'jizasi",
          content: "<p>ES6 da kelgan <b>... (uchta nuqta)</b> operatori qayerda ishlatilishiga qarab yo <b>Spread</b> (yoyish) yoki <b>Rest</b> (yig'ish) vazifasini bajaradi.</p>"
        },
        {
          icon: "🥞",
          title: "Spread (Yoyish) qanday ishlaydi?",
          content: "<p>U massiv yoki obyekt ichidagi barcha elementlarni qolipidan chiqarib (yoyib) boshqa joyga osongina nusxalash yoki ulash imkonini beradi.</p>",
          code: "const sonlar1 = [1, 2, 3];\nconst sonlar2 = [4, 5];\n\n// Ikki massivni qisqa usulda birlashtirish\nconst barchaSonlar = [...sonlar1, ...sonlar2, 6];\n\nconsole.log(barchaSonlar); // [1, 2, 3, 4, 5, 6]",
          language: "javascript"
        }
      ],
      task: {
        description: "Spread (...) operatori orqali ikkita obyektni birlashtiring.",
        requirements: [
          "'user' va 'details' obyektlarini birlashtirib, 'fullUser' nomli yangi obyekt yarating",
          "Birlashtirishda ... operatoridan foydalaning",
          "'fullUser' ni konsolga chiqaring"
        ],
        hints: ["Obyekt ichida ... obyektNomi yozish orqali uning ichidagi hamma narsani shu yerga to'kib tashlash mumkin."],
        mustInclude: [],
        starterCode: "const user = { ism: 'Hasan', yosh: 22 };\nconst details = { kasb: 'Dizayner', shahar: 'Toshkent' };\n\n// Ikkita obyektni birlashtiring\nconst fullUser = \n\nconsole.log(fullUser);"
      },
      quizQuestions: [
        {
          question: "Agar funksiya argumentlari ichida ... operatori ishlatilsa (masalan: function hisobla(...sonlar)), u qanday ataladi?",
          options: ["Spread", "Destruct", "Rest", "Concat"],
          correct: 2,
          explanation: "Funksiya qabul qilayotgan qismda yozilgan ... operatori 'Rest' deyiladi va cheksiz miqdordagi argumentlarni bitta massivga yig'ib beradi."
        }
      ]
    },

    // ----------------------------------------
    // 14-DARS: Promise / Async
    // ----------------------------------------
    14: {
      id: 14,
      title: "Asinxron kod (Promise va Async/Await)",
      type: "programming",
      slides: [
        {
          icon: "⏳",
          title: "Sinxron va Asinxron",
          content: "<p>Odatda JS kodlari bittadan ketma-ket (sinxron) o'qiladi. Agar bitta qatorda internetdan katta ma'lumot yuklanayotgan bo'lsa, qolgan kodlar uni kutib sayt qotib qolishi mumkin. Shuning uchun biz <b>Asinxron</b> (kutib turmaydigan) kodlardan foydalanamiz.</p>"
        },
        {
          icon: "🤝",
          title: "Va'da (Promise)",
          content: "<p>Biron ishni boshlaganimizda JS bizga 'Kutib tur, natijasini keyin aytaman' deb <b>Promise</b> (Va'da) beradi. Uni osongina kutib olish uchun <b>async</b> va <b>await</b> so'zlaridan foydalanamiz.</p>",
          code: "// Funksiya oldidan async yoziladi\nasync function malumotOlish() {\n  console.log('Kutib turing...');\n  \n  // await so'zi faqat shu qatorni kutadi, saytni qotirmaydi\n  let natija = await internetdanYuklash(); \n  \n  console.log('Tayyor!', natija);\n}",
          language: "javascript"
        }
      ],
      task: {
        description: "Oddiy Promise yasab uni chaqiring.",
        requirements: [
          "'vada' deb nomlangan Promise obyekti sizga berilgan",
          "Undan javobni .then() orqali kutib oling va konsolga chiqaring",
          "Agar xato bo'lsa .catch() orqali xatoni konsolga chiqaring"
        ],
        hints: ["Promise bilan ishlashning eng oddiy usuli: vada.then(javob => console.log(javob))"],
        mustInclude: [],
        starterCode: "const vada = new Promise((resolve, reject) => {\n  setTimeout(() => resolve('Ma\\'lumot keldi!'), 1000);\n});\n\n// .then() va .catch() orqali javobni oling\n\n"
      },
      quizQuestions: [
        {
          question: "async funksiya doimo o'zidan qanday qiymat qaytaradi?",
          options: ["String", "Promise", "Function", "Undefined"],
          correct: 1,
          explanation: "Har qanday funksiya oldiga 'async' so'zi qo'shilsa, u avtomatik ravishda oddiy qiymat emas, doimo Promise qaytaradigan bo'lib qoladi."
        }
      ]
    },

    // ----------------------------------------
    // 15-DARS: Fetch API
    // ----------------------------------------
    15: {
      id: 15,
      title: "Fetch API (Internetdan ma'lumot olish)",
      type: "programming",
      slides: [
        {
          icon: "🌐",
          title: "API bilan gaplashish",
          content: "<p>Zamonaviy saytlar ma'lumotlarni (foydalanuvchilar, rasmlar, ob-havo) turli xil API (Backend) lardan tortib oladi. Buni amalga oshirish uchun JavaScriptdagi eng yaxshi qurol bu — <b>fetch()</b>.</p>"
        },
        {
          icon: "📥",
          title: "Fetch qanday ishlaydi?",
          content: "<p>fetch() doim asinxron ishlaydi, shuning uchun uni async/await bilan ishlatish qulay. Kelgan javob asosan JSON formatida bo'ladi va uni ham JS tushunadigan obyektga aylantirish kerak.</p>",
          code: "async function getUser() {\n  // 1. Manzildan tortib kelish\n  const response = await fetch('https://jsonplaceholder.typicode.com/users/1');\n  \n  // 2. JSON ni obyektga aylantirish\n  const data = await response.json();\n  \n  console.log(data.name);\n}\ngetUser();",
          language: "javascript"
        }
      ],
      task: {
        description: "Fetch API orqali ro'yhatdan foydalanuvchilar ma'lumotini oling.",
        requirements: [
          "'https://jsonplaceholder.typicode.com/users/2' manziliga fetch orqali so'rov yuboring",
          "Kelgan response'ni .json() qilib o'giring",
          "Foydalanuvchining ismini (data.name) konsolga chiqaring"
        ],
        hints: ["Bu ishlarni async funksiya ichida yozishni va await ishlatishni unutmang."],
        mustInclude: [],
        starterCode: "async function getData() {\n  // fetch orqali ma'lumot torting\n\n\n}\ngetData();"
      },
      quizQuestions: [
        {
          question: "Fetch API orqali olingan matn ko'rinishidagi ma'lumotni JavaScript obyekti (Array/Object) ko'rinishiga qaysi funksiya o'girib beradi?",
          options: [".text()", ".toString()", ".parse()", ".json()"],
          correct: 3,
          explanation: "Backenddan ma'lumot JSON (JavaScript Object Notation) matn formatida keladi, .json() funksiyasi esa uni biz ishlata oladigan tirik obyektga aylantiradi."
        }
      ]
    },
    // ----------------------------------------
    // 16-DARS: Amaliy Loyiha 1 - Todo App
    // ----------------------------------------
    16: {
      id: 16,
      title: "Amaliy Loyiha 1: Todo App (Vazifalar ro'yxati)",
      type: "programming",
      slides: [
        {
          icon: "📝",
          title: "Todo App nima?",
          content: "<p><b>Todo App</b> — bu har bir frontend dasturchi o'z karyerasida yasab ko'radigan eng birinchi va muhim loyihalardan biridir. Bu yerda siz qanday qilib foydalanuvchidan ma'lumot olishni va uni ekranga chiqarishni o'rganasiz.</p>"
        },
        {
          icon: "🛠️",
          title: "Asosiy Mantiq",
          content: "<p>Bizga bitta <b>input</b>, bitta <b>button</b> va vazifalar chiqadigan bitta <b>ul (ro'yxat)</b> kerak bo'ladi. Tugma bosilganda inputdagi yozuvni olib, yangi <b>li</b> elementi yaratib, ro'yxatga qo'shamiz.</p>",
          code: "const btn = document.querySelector('#addBtn');\nconst input = document.querySelector('#taskInput');\nconst list = document.querySelector('#taskList');\n\nbtn.addEventListener('click', () => {\n  // Yangi li yaratish va matn qo'yish\n  const li = document.createElement('li');\n  li.innerText = input.value;\n  \n  // Ro'yxatga qo'shish va inputni tozalash\n  list.appendChild(li);\n  input.value = '';\n});",
          language: "javascript"
        }
      ],
      task: {
        description: "DOM orqali ro'yxatga yangi vazifa qo'shadigan kod yozing.",
        requirements: [
          "'Vazifa 1' matniga ega yangi <li> elementi (document.createElement) yarating",
          "Yaratilgan elementni ekrandagi ro'yxatga (appendChild orqali) qo'shing"
        ],
        hints: ["Sizga ul elementi 'ruyxat' nomi bilan tanlab berilgan. Shunchaki yangi 'li' yasab unga ulang."],
        mustInclude: ["<li>"],
        starterCode: "const ruyxat = document.querySelector('#todoList');\n\n// 1. Yangi li element yarating\n\n// 2. Unga matn bering\n\n// 3. ruyxat ga appendChild qiling\n"
      },
      quizQuestions: [
        {
          question: "JavaScript yordamida HTML ichiga mutlaqo yangi teg (masalan <div> yoki <li>) yaratish uchun qaysi funksiya ishlatiladi?",
          options: ["document.addTag()", "document.newElement()", "document.createElement()", "document.make()"],
          correct: 2,
          explanation: "document.createElement('tegNomi') funksiyasi xotirada yangi HTML elementini yaratadi."
        }
      ]
    },

    // ----------------------------------------
    // 17-DARS: Amaliy Loyiha 2 - Weather App
    // ----------------------------------------
    17: {
      id: 17,
      title: "Amaliy Loyiha 2: Weather App (Ob-havo)",
      type: "programming",
      slides: [
        {
          icon: "☀️",
          title: "Real ma'lumotlar bilan ishlash",
          content: "<p>Bu loyihada biz internetdan, aniqrog'i <b>OpenWeather API</b> dan haqiqiy ob-havo ma'lumotlarini tortib kelib, ekranda ko'rsatamiz. Bu yerda <b>Fetch API</b> juda asqotadi.</p>"
        },
        {
          icon: "🌍",
          title: "API ga so'rov yuborish",
          content: "<p>Shahar nomini o'zgartirish orqali o'sha shaharning harorati va ob-havo holatini JSON formatida kutib olamiz va DOM orqali ekranga chizamiz.</p>",
          code: "async function getWeather(shahar) {\n  // API dan ma'lumot olish\n  let res = await fetch(`https://api.weatherapi.com/v1/current.json?key=SIZNING_KALITINGIZ&q=${shahar}`);\n  let data = await res.json();\n  \n  // Ekranga chiqarish\n  document.querySelector('.temp').innerText = data.current.temp_c + '°C';\n  document.querySelector('.city').innerText = data.location.name;\n}",
          language: "javascript"
        }
      ],
      task: {
        description: "Fetch yordamida soxta ob-havo ma'lumotini tortib kelib, DOM ga yozing.",
        requirements: [
          "Fetch orqali so'rov yuboring va natijani JSON qilib oling",
          "Kelgan ma'lumotdagi ob-havo darajasini ekrandagi (document.querySelector('.harorat')) elementning ichiga yozing"
        ],
        hints: ["Sizga qulay bo'lishi uchun API manzili berilgan. .json() qilishni unutmang."],
        mustInclude: [],
        starterCode: "const url = 'https://jsonplaceholder.typicode.com/users/1';\n\nasync function haroratniOlish() {\n  // Fetch kodini yozing\n  \n  \n}\nharoratniOlish();"
      },
      quizQuestions: [
        {
          question: "Fetch so'rovi manzil manziliga muvaffaqiyatli yetib borishi va javob qaytishini kutib turish uchun qaysi kalit so'z ishlatiladi?",
          options: ["pause", "wait", "await", "hold"],
          correct: 2,
          explanation: "await kalit so'zi asinxron operatsiya (masalan fetch) tugaguncha kodni o'sha qatorda kutib turadi."
        }
      ]
    },

    // ----------------------------------------
    // 18-DARS: Amaliy Loyiha 3 - Quiz App
    // ----------------------------------------
    18: {
      id: 18,
      title: "Amaliy Loyiha 3: Quiz App (Test ilovasi)",
      type: "programming",
      slides: [
        {
          icon: "🧠",
          title: "Holatni boshqarish (State Management)",
          content: "<p><b>Quiz App</b> mantiqiy jihatdan biroz murakkabroq. Biz dastur davomida qaysi savolda turganimizni (indeks) va foydalanuvchi nechta to'g'ri javob topganini (ball) kuzatib borishimiz kerak.</p>"
        },
        {
          icon: "🔄",
          title: "O'zgaruvchilarni yangilash",
          content: "<p>Buning uchun bizga let bilan ochilgan o'zgaruvchilar kerak. Har safar tugma bosilganda indeksni bittaga oshiramiz va massivdan keyingi savolni ekranga chiqaramiz.</p>",
          code: "let joriySavol = 0;\nlet ball = 0;\n\nfunction javobniTekshirish(tanlangan) {\n  if (tanlangan === savollar[joriySavol].togriJavob) {\n    ball++; // Ballni oshirish\n  }\n  joriySavol++; // Keyingi savolga o'tish\n  ekrangaChizish();\n}",
          language: "javascript"
        }
      ],
      task: {
        description: "Test ilovasining ball hisoblash mantig'ini yozing.",
        requirements: [
          "'ball' va 'savolIndeksi' nomli ikkita let o'zgaruvchi ochib, 0 ga tenglang",
          "'javobBering' nomli funksiya yarating. U chaqirilganda 'ball' va 'savolIndeksi' bittaga (++) oshsin"
        ],
        hints: ["O'zgaruvchini bittaga oshirish uchun uning yoniga ++ qo'yiladi (masalan, x++)."],
        mustInclude: [],
        starterCode: "// O'zgaruvchilarni oching\n\n\nfunction javobBering() {\n  // Mantiqni yozing\n  \n}\n\njavobBering();\nconsole.log('Ball:', ball, 'Savol:', savolIndeksi);"
      },
      quizQuestions: [
        {
          question: "JavaScriptda mavjud o'zgaruvchining qiymatini bittaga ko'paytirish (inkrement) uchun qaysi belgi ishlatiladi?",
          options: ["+1", "+=", "++", "add()"],
          correct: 2,
          explanation: "++ belgisi (inkrement operatori) o'zgaruvchining qiymatini 1 taga oshiradi (masalan: ball++)."
        }
      ]
    }
  }, // JAVASCRIPT KURSI TUGADI
  // ==========================================
  // 4 - REACT.JS ZAMONAVIY KURSI (courseId: 4)
  // ==========================================
  4: {
    // ----------------------------------------
    // 1-DARS: React nima?
    // ----------------------------------------
    1: {
      id: 1,
      title: "React nima va nima uchun u kerak?",
      type: "programming",
      slides: [
        {
          icon: "⚛️",
          title: "React afzalligi",
          content: "<p><b>React</b> — bu Facebook (Meta) tomonidan yaratilgan JavaScript kutubxonasi. U foydalanuvchi interfeyslarini (UI) tez, qulay va qayta ishlatiladigan qismlarga (komponentlarga) bo'lib chiqish uchun mo'ljallangan.</p>"
        },
        {
          icon: "🚀",
          title: "Virtual DOM sehri",
          content: "<p>Oddiy JavaScriptda (DOM) saytning bir joyi o'zgarsa, butun sahifa qayta yuklanishi mumkin. React esa <b>Virtual DOM</b> (xotiradagi nusxa) ishlatadi va faqat o'zgargan kichik qisminigina ekranda yangilaydi. Bu saytni juda tez qiladi!</p>",
          code: "// Reactda eng oddiy komponent\nfunction App() {\n  return <h1>Salom, React!</h1>;\n}\nexport default App;",
          language: "jsx"
        }
      ],
      task: {
        description: "Eng birinchi React komponentingizni e'lon qiling.",
        requirements: [
          "'App' nomli funksiya (komponent) yarating",
          "U return orqali <h1> tegi ichida 'Mening birinchi React dasturim' matnini qaytarsin",
          "Komponentni export default qiling"
        ],
        hints: ["Reactda komponent nomlari doim Katta harf bilan boshlanishi shart."],
        mustInclude: ["<h1>"],
        starterCode: "// Komponentni shu yerda yarating\n\n"
      },
      quizQuestions: [
        {
          question: "React texnologiyasining asosiy afzalligi va tez ishlashining siri nimada?",
          options: ["Serverda ishlashi", "Virtual DOM ishlatishi", "Faqat HTML dan iboratligi", "Ma'lumotlar bazasiga to'g'ridan-to'g'ri ulanishi"],
          correct: 1,
          explanation: "Virtual DOM — haqiqiy DOM ning xotiradagi nusxasi bo'lib, React faqat kerakli o'zgarishlarni solishtirib, tezkor yangilash imkonini beradi."
        }
      ]
    },

    // ----------------------------------------
    // 2-DARS: Vite setup
    // ----------------------------------------
    2: {
      id: 2,
      title: "React loyiha yaratish (Vite)",
      type: "programming",
      slides: [
        {
          icon: "⚡",
          title: "Nega aynan Vite?",
          content: "<p>Oldinlari React loyiha ochish uchun `create-react-app` ishlatilardi, lekin u hozir eskirgan va sekin. Hozirgi kunda eng zamonaviy va yashin tezligida ishlaydigan yig'uvchi (bundler) bu — <b>Vite</b> hisoblanadi.</p>"
        },
        {
          icon: "💻",
          title: "Loyiha o'rnatish bosqichlari",
          content: "<p>Terminalda quyidagi komandalarni ketma-ket yozish orqali yangi loyiha ochiladi va ishga tushiriladi:</p>",
          code: "npm create vite@latest mening-loyiham -- --template react\n\ncd mening-loyiham\nnpm install\nnpm run dev",
          language: "bash"
        }
      ],
      task: {
        description: "Terminal buyruqlarini eslab qoling. Yangi loyiha ochish komandasini yozing.",
        requirements: [
          "Vite orqali 'portfolio' nomli react loyiha yaratish buyrug'ini yozing",
          "Uning ichiga kirish (cd) va paketlarni o'rnatish (npm install) komandalarini yozing"
        ],
        hints: ["Bu amaliyot asosan xotirani charxlash uchun. Shunchaki terminal komandalarini izohsiz yozing."],
        mustInclude: [],
        starterCode: "/* Terminal komandalarini yozing */\n\n"
      },
      quizQuestions: [
        {
          question: "Vite orqali yaratilgan React loyihani kompyuterda (localhost) ishga tushirish uchun qaysi komanda yoziladi?",
          options: ["npm start", "npm run dev", "npm build", "vite start"],
          correct: 1,
          explanation: "Vite loyihalarida 'npm run dev' komandasi orqali dastur ishlab chiquvchi (development) rejimida ishga tushadi."
        }
      ]
    },

    // ----------------------------------------
    // 3-DARS: JSX
    // ----------------------------------------
    3: {
      id: 3,
      title: "JSX sintaksisi va qoidalari",
      type: "programming",
      slides: [
        {
          icon: "🧩",
          title: "HTML va JS duragayi",
          content: "<p><b>JSX</b> (JavaScript XML) — bu JavaScript fayli ichida HTML kodlarini yozish imkonini beruvchi maxsus sintaksis. U ko'rinishidan HTML ga o'xshaydi, lekin tagida JS yotadi.</p>"
        },
        {
          icon: "📏",
          title: "Asosiy qoidalar",
          content: "<p>1. <b>Bitta ota element:</b> Barcha HTML teglar bitta umumiy ota teg (masalan, div yoki <>) ichida bo'lishi shart.<br/>2. <b>Class o'rniga className:</b> JS da class zaxiralangan so'z bo'lgani uchun, JSX da className ishlatiladi.<br/>3. <b>Yopilishi shart:</b> Har bir teg (hatto img va input ham) /> bilan yopilishi shart.</p>",
          code: "function Profil() {\n  return (\n    <div className=\"kard\">\n      <h2>Ali</h2>\n      <img src=\"rasm.jpg\" alt=\"Ali\" />\n    </div>\n  );\n}",
          language: "jsx"
        }
      ],
      task: {
        description: "Xatoga yo'l qo'yilgan JSX kodini to'g'rilang.",
        requirements: [
          "Barcha elementlarni bitta ota o'rovchi (masalan: <> ... </>) ichiga oling",
          "class so'zini className ga almashtiring",
          "<img> tegini oxirida / bilan yoping"
        ],
        hints: ["Bo'sh teglar (<> va </>) Fragment deyiladi va ular ortiqcha div yaratmaslik uchun ishlatiladi."],
        mustInclude: ["<img>"],
        starterCode: "function User() {\n  return (\n    <h1 class=\"ism\">Hasan</h1>\n    <p>Dasturchi</p>\n    <img src=\"logo.png\">\n  );\n}"
      },
      quizQuestions: [
        {
          question: "Nima uchun JSX da oddiy 'class' o'rniga 'className' ishlatishga majburmiz?",
          options: ["Chunki React shunday xohlaydi", "HTML5 talabi shunday", "class so'zi JavaScriptda (Classlar yaratish uchun) allaqachon band qilingan", "CSS da adashib ketmaslik uchun"],
          correct: 2,
          explanation: "JavaScriptda 'class' so'zi zaxiralangan kalit so'z hisoblanadi. JSX kodlari aslida JS ga o'girilgani uchun xatolik bermasligi maqsadida 'className' ixtiro qilingan."
        }
      ]
    },

    // ----------------------------------------
    // 4-DARS: Komponentlar
    // ----------------------------------------
    4: {
      id: 4,
      title: "Komponentlar (Components)",
      type: "programming",
      slides: [
        {
          icon: "🧱",
          title: "G'ishtlar",
          content: "<p>Reactda butun sayt bitta katta faylda yozilmaydi. U mantiqan mustaqil, qayta ishlatish mumkin bo'lgan kichik bo'laklarga — <b>komponentlarga</b> bo'linadi (Masalan: Header, Sidebar, Footer, Button).</p>"
        },
        {
          icon: "🔄",
          title: "Qayta ishlatish",
          content: "<p>Bitta komponentni yasab olgach, uni xohlagancha marta o'zgaruvchi yoki teg kabi chaqirib ishlataveramiz.</p>",
          code: "function Tugma() {\n  return <button>Meni bosing</button>;\n}\n\nfunction App() {\n  return (\n    <div>\n      <Tugma />\n      <Tugma />\n    </div>\n  );\n}",
          language: "jsx"
        }
      ],
      task: {
        description: "Menyu uchun alohida Navbar komponenti yarating va uni asosiy App ichida ishlating.",
        requirements: [
          "'Navbar' nomli komponent yarating va u <nav> ichida 'Logo' va 'Menu' matnlarini qaytarsin",
          "'App' komponenti ichida o'sha <Navbar /> ni chaqirib qo'ying"
        ],
        hints: ["Komponentni chaqirganda o'z-o'zidan yopiluvchi teg (<Komponent />) ko'rinishida yozamiz."],
        mustInclude: ["<nav>", "<Navbar>"],
        starterCode: "// Navbar komponentini yarating\n\n\nfunction App() {\n  return (\n    <div>\n      {/* Navbarni shu yerda chaqiring */}\n      <main>Asosiy qism</main>\n    </div>\n  );\n}"
      },
      quizQuestions: [
        {
          question: "Reactda komponent qanday e'lon qilinadi?",
          options: ["Kichik harf bilan boshlanadigan oddiy o'zgaruvchi kabi", "Katta harf bilan boshlanadigan funksiya ko'rinishida", "Faqat class orqali", "<component> tegi orqali"],
          correct: 1,
          explanation: "React oddiy HTML teglar (div, span) va siz yasagan komponentlarni (Header, Button) ajrata olishi uchun komponent nomlari doim Katta harf bilan boshlanishi shart."
        }
      ]
    },

    // ----------------------------------------
    // 5-DARS: Props
    // ----------------------------------------
    5: {
      id: 5,
      title: "Props (Xususiyatlar uzatish)",
      type: "programming",
      slides: [
        {
          icon: "📬",
          title: "Tashqaridan ma'lumot olish",
          content: "<p>Komponentlar bir xil bo'laversa zerikarli. Ularni chaqirayotganda ichiga har xil ma'lumotlar berib yuborish uchun <b>props</b> (properties) ishlatamiz. Bu xuddi HTML teglarga atribut berishga o'xshaydi.</p>"
        },
        {
          icon: "🎁",
          title: "Props ni qabul qilish",
          content: "<p>Funksiya qavslari ichiga `props` yoziladi. JSX ichida esa JavaScript o'zgaruvchilarini ko'rsatish uchun <b>jingalak qavslar { }</b> dan foydalanamiz.</p>",
          code: "// Props qabul qiluvchi komponent\nfunction UserCard(props) {\n  return <h3>Salom, mening ismim {props.ism}</h3>;\n}\n\nfunction App() {\n  return (\n    <div>\n      <UserCard ism=\"Ali\" />\n      <UserCard ism=\"Vali\" />\n    </div>\n  );\n}",
          language: "jsx"
        }
      ],
      task: {
        description: "Komponentga props orqali ma'lumot uzating va uni destructuring qilib oling.",
        requirements: [
          "'Maxsulot' nomli komponent qavslari ichida (props) emas, to'g'ridan-to'g'ri ({ nom, narx }) deb destructuring qiling",
          "JSX ichida {nom} va {narx} o'zgaruvchilarini ko'rsating",
          "App ichida Maxsulot ni chaqirib, unga nom=\"Noutbuk\" va narx=\"1000\" qiymatlarini bering"
        ],
        hints: ["Destructuring bu `props.nom` o'rniga to'g'ridan-to'g'ri `nom` ishlatish imkonini beradi."],
        mustInclude: [],
        starterCode: "function Maxsulot() { // Shu yerga props yozing\n  return (\n    <div className=\"card\">\n      {/* nom va narxni chiqaring */}\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <>\n      {/* Maxsulot ni chaqiring va props bering */}\n    </>\n  );\n}"
      },
      quizQuestions: [
        {
          question: "JSX ichida JavaScript o'zgaruvchisi yoki hisob-kitoblarini (masalan, 2 + 2 yoki props.ism) ishlatish uchun ularni qanday qavs ichiga olish kerak?",
          options: ["( )", "[ ]", "< >", "{ }"],
          correct: 3,
          explanation: "Jingalak qavslar { } Reactga 'Bu yerda HTML emas, JavaScript o'qib hisobla' degan ishorani beradi."
        }
      ]
    },

    // ----------------------------------------
    // 6-DARS: useState
    // ----------------------------------------
    6: {
      id: 6,
      title: "useState (Komponent xotirasi)",
      type: "programming",
      slides: [
        {
          icon: "🧠",
          title: "Holat (State) nima?",
          content: "<p>Oddiy o'zgaruvchi (let x = 0) o'zgargani bilan ekrandagi yozuv o'z-o'zidan yangilanib qolmaydi. React o'zgarishlarni sezib, ekranni avtomat yangilashi (qayta chizishi) uchun <b>State</b> (holat) ishlatishimiz shart.</p>"
        },
        {
          icon: "🪝",
          title: "useState Hook'i",
          content: "<p><b>useState</b> funksiyasi bizga ikkita narsa beradi: 1-si o'zgaruvchining o'zi, 2-si uni o'zgartiradigan maxsus funksiya.</p>",
          code: "import { useState } from 'react';\n\nfunction Counter() {\n  // count = 0, uni o'zgartiruvchi esa setCount\n  const [count, setCount] = useState(0);\n\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Bosildi: {count}\n    </button>\n  );\n}",
          language: "jsx"
        }
      ],
      task: {
        description: "Tugma bosilganda soni ortib boradigan Counter (hisoblagich) yasang.",
        requirements: [
          "useState orqali 'son' nomli state yarating (boshlang'ich qiymati 0)",
          "<button> ga onClick hodisasini qo'shing",
          "Bosilganda 'setSon' orqali uni bittaga (son + 1) oshiring"
        ],
        hints: ["Destructuring formatini unutmang: const [son, setSon] = useState(0);"],
        mustInclude: ["<button>"],
        starterCode: "import { useState } from 'react';\n\nfunction Hisoblagich() {\n  // 1. Shu yerda useState oching\n  \n  return (\n    <div>\n      <h1>Sanoq: {/* sonni chiqaring */}</h1>\n      {/* 2. Tugmaga onClick yozing */}\n      <button>Oshirish</button>\n    </div>\n  );\n}\nexport default Hisoblagich;"
      },
      quizQuestions: [
        {
          question: "useState yordamida ochilgan state'ning qiymati qanday qilib to'g'ri o'zgartiriladi?",
          options: ["To'g'ridan-to'g'ri: count = 5;", "state.count = 5;", "Faqat o'zining ikkinchi funksiyasi orqali: setCount(5);", "updateState(count, 5);"],
          correct: 2,
          explanation: "React ekran (UI) ni yangilashi uchun qiymat har doim o'zining setter funksiyasi (masalan, setCount) orqali o'zgartirilishi shart."
        }
      ]
    },

    // ----------------------------------------
    // 7-DARS: State o'zgartirish (Inputs)
    // ----------------------------------------
    7: {
      id: 7,
      title: "State orqali Inputlarni boshqarish",
      type: "programming",
      slides: [
        {
          icon: "⌨️",
          title: "Controlled Components",
          content: "<p>Reactda input (kiritish maydonlari) o'z holicha yashashiga ruxsat berilmaydi. Inputdagi matn doimo Reactdagi bitta <b>state</b> ga ulanib turishi kerak. Bu 'Boshqariladigan komponent' deyiladi.</p>"
        },
        {
          icon: "🔄",
          title: "onChange hodisasi",
          content: "<p>Inputga narsa yozilganini <b>onChange</b> eventi ushlaydi. U <b>e.target.value</b> orqali yozilgan matnni olib, state ni yangilaydi.</p>",
          code: "function Forma() {\n  const [ism, setIsm] = useState('');\n\n  return (\n    <div>\n      <input \n        value={ism} \n        onChange={(e) => setIsm(e.target.value)} \n      />\n      <p>Salom, {ism}</p>\n    </div>\n  );\n}",
          language: "jsx"
        }
      ],
      task: {
        description: "Foydalanuvchi yozgan ismni real vaqtda ekranda chiqarib turadigan input yasang.",
        requirements: [
          "'matn' nomli state oching (boshlang'ich qiymat bo'sh string '')",
          "<input> ning value siga 'matn' ni bering",
          "onChange ichida 'setMatn(e.target.value)' qiling"
        ],
        hints: ["Event (e) degani bu foydalanuvchi amalga oshirgan harakat. e.target.value esa o'sha inputning ichidagi matn."],
        mustInclude: ["<input>"],
        starterCode: "import { useState } from 'react';\n\nfunction LiveText() {\n  // State ni oching\n  \n  return (\n    <div>\n      {/* Inputni sozlang */}\n      <input type=\"text\" placeholder=\"Nimadir yozing...\" />\n      \n      {/* Matnni chiqaring */}\n      <h2>Siz yozdingiz: </h2>\n    </div>\n  );\n}"
      },
      quizQuestions: [
        {
          question: "Input ichiga kiritilgan joriy matnni event orqali ushlab olish uchun qaysi xususiyatga murojaat qilinadi?",
          options: ["e.text", "e.target.value", "e.input.data", "e.getValue()"],
          correct: 1,
          explanation: "e.target - hodisa yuz bergan element (input) ni bildiradi, uning '.value' si esa o'sha input ichidagi qiymatni qaytaradi."
        }
      ]
    },

    // ----------------------------------------
    // 8-DARS: useEffect
    // ----------------------------------------
    8: {
      id: 8,
      title: "useEffect (Yon ta'sirlar)",
      type: "programming",
      slides: [
        {
          icon: "👁️",
          title: "useEffect nima?",
          content: "<p>Komponent ekranga birinchi marta chizilganda (tug'ilganda), yoki qandaydir state o'zgarganda orqa fonda nimanidir (masalan: serverdan API orqali ma'lumot yuklash) bajarish kerak bo'lsa <b>useEffect</b> ishlatiladi.</p>"
        },
        {
          icon: "🎯",
          title: "Bog'liqlik massivi (Dependency array)",
          content: "<p>useEffect oxiridagi bo'sh massiv <b>[]</b> - bu funksiya faqat sahifa ochilganda 1 marta ishlashini bildiradi. Agar uni ichiga qandaydir state yozilsa <b>[count]</b>, o'sha count o'zgargandagina ishlaydi.</p>",
          code: "import { useEffect, useState } from 'react';\n\nfunction Misol() {\n  const [data, setData] = useState(null);\n\n  useEffect(() => {\n    // Sahifa ochilishi bilan internetdan olib keladi\n    fetch('...').then(res => setData(res));\n  }, []); // Bo'sh massiv - faqat 1 marta ishlaydi\n}",
          language: "jsx"
        }
      ],
      task: {
        description: "Sahifa ochilishi bilan sarlavhani (document.title) o'zgartiruvchi useEffect yozing.",
        requirements: [
          "useEffect ichida document.title = 'Salom React' deb yozing",
          "useEffect faqat bir marta ishlashi uchun oxiriga bo'sh massiv [] qo'shing"
        ],
        hints: ["useEffect doim ikkita narsa oladi: 1-si Arrow function () => {}, 2-si massiv []."],
        mustInclude: [],
        starterCode: "import { useEffect } from 'react';\n\nfunction Dastur() {\n  // Shu yerda useEffect yozing\n  \n\n  return <h1>Sarlavha o'zgardi!</h1>;\n}"
      },
      quizQuestions: [
        {
          question: "useEffect faqatgina komponent ekranga birinchi marta chiqqanidagina ishlashi uchun uning ikkinchi parametriga nima yozilishi kerak?",
          options: ["Hech narsa", "[ ] (bo'sh massiv)", "true", "null"],
          correct: 1,
          explanation: "Bo'sh massiv [] Reactga bu effekt hech qaysi state ga bog'lanmaganligini va faqat Mount (birinchi marta chizilish) holatida ishlashini aytadi."
        }
      ]
    },

    // ----------------------------------------
    // 9-DARS: useRef va useMemo
    // ----------------------------------------
    9: {
      id: 9,
      title: "useRef va useMemo",
      type: "programming",
      slides: [
        {
          icon: "🔎",
          title: "useRef (DOM ga to'g'ridan-to'g'ri ulanish)",
          content: "<p>Odatda Reactda elementlarni DOM orqali (querySelector) ushlamaymiz. Lekin ba'zida (masalan, sahifa ochilganda inputga o'z-o'zidan fokus qaratish) elementga to'g'ridan-to'g'ri aralashish uchun <b>useRef</b> ishlatamiz. U state dan farqli ravishda qiymati o'zgarsa ekranni qayta chizmaydi (render qildirnaydi).</p>"
        },
        {
          icon: "🧠",
          title: "useMemo (Kodni tezlashtirish)",
          content: "<p>Agar bizda hisoblash juda qiyin bo'lgan (sekundlar oladigan) mantiq bo'lsa, uni har safar qaytadan hisoblayvermasdan, javobini xotiraga saqlab qolish (keshlash) uchun <b>useMemo</b> dan foydalanamiz.</p>",
          code: "const inputRef = useRef(null);\n\n// Inputga o'z-o'zidan kursor tushib turadi\nuseEffect(() => {\n  inputRef.current.focus();\n}, []);\n\nreturn <input ref={inputRef} />;",
          language: "jsx"
        }
      ],
      task: {
        description: "useRef yordamida tugma bosilganda inputga fokus (kursor) o'tadigan qiling.",
        requirements: [
          "'matnRef' nomli useRef oching",
          "<input> ning ref atributiga o'sha matnRef ni bering",
          "Tugma onClick bo'lganda 'matnRef.current.focus()' ni chaqiring"
        ],
        hints: ["useRef bilan ushlangan elementning ichki imkoniyatlariga doim '.current' orqali yetib boramiz."],
        mustInclude: ["<input>"],
        starterCode: "import { useRef } from 'react';\n\nfunction Fokus() {\n  // useRef oching\n  \n  const fokusQil = () => {\n    // Fokus mantig'i\n  };\n\n  return (\n    <div>\n      {/* ref ni ulang */}\n      <input type=\"text\" />\n      <button onClick={fokusQil}>Yozishni boshlash</button>\n    </div>\n  );\n}"
      },
      quizQuestions: [
        {
          question: "State (useState) va Ref (useRef) ning eng katta farqi nimada?",
          options: ["Ref ga faqat raqam saqlash mumkin", "State o'zgarsa komponent qayta chiziladi (re-render), Ref o'zgarsa qayta chizilmaydi", "Ref faqat matnlar uchun ishlatiladi", "Farqi yo'q"],
          correct: 1,
          explanation: "useState ma'lumoti o'zgarganda ekrandagi ma'lumotlar avtomat yangilanadi. useRef ning qiymati o'zgargani bilan komponent qayta chizilmaydi."
        }
      ]
    },

    // ----------------------------------------
    // 10-DARS: Custom Hooks
    // ----------------------------------------
    10: {
      id: 10,
      title: "Custom Hooks (O'z xuklaringizni yaratish)",
      type: "programming",
      slides: [
        {
          icon: "🛠️",
          title: "Nega u kerak?",
          content: "<p>Agar loyihada bitta mantiqni (masalan: API dan ma'lumot tortish yoki Dark Mode/Light Mode ni o'zgartirish) bir necha marta ishlatishga to'g'ri kelsa, uni alohida <b>Custom Hook</b> qilib yozib olinadi va barcha joyda qayta ishlatiladi.</p>"
        },
        {
          icon: "🧬",
          title: "Qoidasi",
          content: "<p>Custom Hook o'zida useState yoki useEffect kabi hooklarni jamlagan oddiy funksiyadir. Uning yagona qat'iy qoidasi — nomi albatta <b>use</b> so'zi bilan boshlanishi shart (masalan: useFetch, useTheme).</p>",
          code: "// Custom Hook yasash\nfunction useToggle(boshlangich = false) {\n  const [holat, setHolat] = useState(boshlangich);\n  const ozgartir = () => setHolat(!holat);\n  \n  return [holat, ozgartir];\n}\n\n// Ishlatilishi\nconst [yonish, toggleYonish] = useToggle(false);",
          language: "javascript"
        }
      ],
      task: {
        description: "Sahifa qorong'i yoki yorug' holatini o'zgartiruvchi Custom Hook yasang.",
        requirements: [
          "'useTheme' nomli funksiya yarating",
          "Uning ichida theme (boshlang'ich 'light') state'ni oching",
          "Kodni qisqartirish uchun 'light'ni 'dark'ga almashtiruvchi mantiq va themeni massiv [theme, toggleTheme] ko'rinishida return qiling"
        ],
        hints: ["Custom Hook lar oddiy mantiqiy funksiyalar bo'lgani uchun, ular JSX emas (ya'ni HTML) return qilmaydi."],
        mustInclude: [],
        starterCode: "import { useState } from 'react';\n\n// Shu yerda useTheme yarating\n\n\nfunction App() {\n  const [theme, toggleTheme] = useTheme();\n  \n  return (\n    <div className={theme}>\n      <button onClick={toggleTheme}>Temani O'zgartirish</button>\n    </div>\n  );\n}"
      },
      quizQuestions: [
        {
          question: "O'zimiz yaratgan Custom Hooklarning nomi qanday boshlanishi talab etiladi?",
          options: ["get", "fetch", "use", "make"],
          correct: 2,
          explanation: "React qoidalariga ko'ra, barcha hooklar 'use' bilan boshlanishi shart. Bu Linterlarga qoidalarni tekshirishga yordam beradi."
        }
      ]
    },
  // ----------------------------------------
    // 11-DARS: React Router DOM
    // ----------------------------------------
    11: {
      id: 11,
      title: "React Router (Sahifalar o'rtasida navigatsiya)",
      type: "programming",
      slides: [
        {
          icon: "🗺️",
          title: "SPA (Single Page Application)",
          content: "<p>Odatda saytlarda boshqa sahifaga o'tsangiz ekran oqarib, yangidan yuklanadi. React esa <b>SPA</b> (Yakka sahifali dastur) hisoblanadi. Sahifalar o'rtasida ko'chish ekran yangilanmasdan, juda tez sodir bo'lishi uchun bizga <b>React Router DOM</b> kutubxonasi kerak bo'ladi.</p>"
        },
        {
          icon: "🔗",
          title: "Link va Routes",
          content: "<p>Oddiy <b>&lt;a&gt;</b> tegi o'rniga biz <b>&lt;Link&gt;</b> dan foydalanamiz (u saytni yangilab yubormaydi). Qaysi link bosilganda qaysi komponent ochilishini esa <b>&lt;Routes&gt;</b> va <b>&lt;Route&gt;</b> orqali belgilaymiz.</p>",
          code: "import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <nav>\n        <Link to=\"/\">Bosh sahifa</Link>\n        <Link to=\"/about\">Biz haqimizda</Link>\n      </nav>\n      <Routes>\n        <Route path=\"/\" element={<Home />} />\n        <Route path=\"/about\" element={<About />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}",
          language: "jsx"
        }
      ],
      task: {
        description: "Sahifani yangilamaydigan ikkita havola (Link) yarating.",
        requirements: [
          "'/kurslar' manziliga olib boruvchi 'Kurslar' nomli <Link> yarating",
          "'/aloqa' manziliga olib boruvchi 'Aloqa' nomli <Link> yarating"
        ],
        hints: ["<Link> tegining manzil ko'rsatuvchi atributi 'href' emas, 'to' hisoblanadi."],
        mustInclude: ["<Link>"],
        starterCode: "import { Link } from 'react-router-dom';\n\nfunction Menyular() {\n  return (\n    <div className=\"flex gap-4\">\n      {/* Linklarni shu yerda yarating */}\n      \n    </div>\n  );\n}"
      },
      quizQuestions: [
        {
          question: "React dasturlarida sahifa yangilanib ketishining oldini olish uchun oddiy <a> tegi o'rniga qaysi komponent ishlatiladi?",
          options: ["<Router>", "<Navigate>", "<Href>", "<Link>"],
          correct: 3,
          explanation: "<Link> komponenti manzilni o'zgartiradi, lekin brauzerga sahifani qayta yuklashga ruxsat bermaydi. Shuning hisobiga React saytlar chaqmoqdek tez ishlaydi."
        }
      ]
    },

    // ----------------------------------------
    // 12-DARS: Context API
    // ----------------------------------------
    12: {
      id: 12,
      title: "Context API (Global holat)",
      type: "programming",
      slides: [
        {
          icon: "🌍",
          title: "Prop Drilling muammosi",
          content: "<p>Agar bizda bitta ma'lumot (masalan, foydalanuvchi ismi) eng tepa komponentda bo'lsa va u eng pastki 10-chi komponentga kerak bo'lib qolsa, uni har bir qavatdan <b>props</b> orqali o'tkazib borish juda azobli (Prop Drilling) hisoblanadi.</p>"
        },
        {
          icon: "📡",
          title: "Context bilan to'g'ridan-to'g'ri ulash",
          content: "<p><b>Context API</b> yordamida biz ma'lumotlarni \"Havoga\" (Global xotiraga) joylaymiz va xohlagan qavatdagi komponent uni <b>useContext()</b> orqali to'g'ridan-to'g'ri olib ishlataveradi.</p>",
          code: "import { createContext, useContext } from 'react';\n\n// 1. Context yaratish\nconst UserContext = createContext();\n\nfunction App() {\n  // 2. Ma'lumotni tarqatish (Provider)\n  return (\n    <UserContext.Provider value=\"Ali\">\n      <Profil />\n    </UserContext.Provider>\n  );\n}\n\nfunction Profil() {\n  // 3. Ma'lumotni qabul qilib olish\n  const ism = useContext(UserContext);\n  return <h1>Salom, {ism}</h1>;\n}",
          language: "jsx"
        }
      ],
      task: {
        description: "useContext orqali Global xotiradagi (Context) ma'lumotni tutib oling.",
        requirements: [
          "useContext ichiga 'ThemeContext' ni berib uni chaqiring va natijani 'theme' o'zgaruvchisiga oling",
          "Olingan 'theme' qiymatini <h1> ichida ekranga chiqaring"
        ],
        hints: ["useContext hooki qavslari ichiga qaysi Context dan ma'lumot olayotganingizni yozishingiz shart."],
        mustInclude: ["<h1>"],
        starterCode: "import { useContext } from 'react';\n// Faraz qiling ThemeContext allaqachon yaratilgan va export qilingan\nimport { ThemeContext } from './ThemeContext';\n\nfunction Navbar() {\n  // Theme ni shu yerda tutib oling\n  \n  return (\n    <nav>\n      <h1>Hozirgi tema: {/* theme ni chiqaring */}</h1>\n    </nav>\n  );\n}"
      },
      quizQuestions: [
        {
          question: "Komponentlar daraxtining xohlagan joyidan Global ma'lumotni (Contextni) o'qib olish uchun qaysi Hook ishlatiladi?",
          options: ["useGlobal", "useReducer", "useContext", "useState"],
          correct: 2,
          explanation: "useContext orqali Provider tarqatayotgan ma'lumotni xohlagan komponentda osongina tutib olish mumkin."
        }
      ]
    },

    // ----------------------------------------
    // 13-DARS: React va API
    // ----------------------------------------
    13: {
      id: 13,
      title: "React va API (Ma'lumot tortish)",
      type: "programming",
      slides: [
        {
          icon: "🌐",
          title: "Serverdan ma'lumot olish",
          content: "<p>Reactda tashqi APIlardan (masalan, ob-havo, kinolar bazasi) ma'lumotlarni qachon tortamiz? Albatta, sahifa birinchi marta ekranga chizilganda. Buning uchun <b>useEffect</b> va <b>fetch</b> larning kombinatsiyasidan foydalanamiz.</p>"
        },
        {
          icon: "⏳",
          title: "Loading va Error",
          content: "<p>Internet tezligi har xil bo'lishi mumkin. Shuning uchun foydalanuvchiga \"Yuklanmoqda...\" yozuvini ko'rsatish uchun alohida <b>isLoading</b> state saqlash professional yondashuv hisoblanadi.</p>",
          code: "function Users() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetch('https://jsonplaceholder.typicode.com/users')\n      .then(res => res.json())\n      .then(data => {\n        setUsers(data);\n        setLoading(false);\n      });\n  }, []); // Bo'sh massiv - 1 marta ishlaydi\n\n  if (loading) return <h2>Yuklanmoqda...</h2>;\n  \n  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\n}",
          language: "jsx"
        }
      ],
      task: {
        description: "Internetdan kelgan ma'lumotni ekranga 'map' orqali chizing.",
        requirements: [
          "Sizga allaqachon 'kinolar' arrayi (massivi) berilgan",
          "Uning ustidan .map() funksiyasi orqali yuring",
          "Har bir kino uchun bittadan <li> qaytaring va uning ichiga kino nomini (kino.nomi) yozing",
          "Har bir <li> ga takrorlanmas 'key' atributini (kino.id) berishni unutmang"
        ],
        hints: ["Reactda massivlarni ekranga chizishda har doim eng ota elementga 'key' berish shart."],
        mustInclude: ["<li>"],
        starterCode: "function MovieList() {\n  const kinolar = [\n    { id: 1, nomi: \"Avatar\" },\n    { id: 2, nomi: \"Titanik\" }\n  ];\n\n  return (\n    <ul>\n      {/* .map orqali kinolarni shu yerda chizing */}\n      \n    </ul>\n  );\n}"
      },
      quizQuestions: [
        {
          question: "Reactda massivdagi elementlarni (ro'yxatni) ekranga chizish uchun asosan qaysi JavaScript funksiyasi ishlatiladi?",
          options: ["forLoop", "map()", "filter()", "forEach()"],
          correct: 1,
          explanation: "map() funksiyasi massivdagi har bir ma'lumot uchun yangi JSX elementi (masalan <li> yoki <Card>) yaratib, ularni ekranga chiroyli qilib chizib beradi."
        }
      ]
    },

    // ----------------------------------------
    // 14-DARS: Loyiha 1 - Expense Tracker
    // ----------------------------------------
    14: {
      id: 14,
      title: "Amaliy Loyiha 1: Xarajatlar Hisoblagichi",
      type: "programming",
      slides: [
        {
          icon: "💰",
          title: "Expense Tracker",
          content: "<p>Keling, olgan bilimlarimizni birlashtirib, jami xarajatlarni hisoblaydigan dastur yozamiz. Bizga xarajatlar ro'yxatini saqlash uchun <b>state (massiv ko'rinishida)</b> kerak bo'ladi.</p>"
        },
        {
          icon: "➕",
          title: "Ro'yxatga yangi element qo'shish",
          content: "<p>Reactda state ni to'g'ridan-to'g'ri o'zgartirish mumkin emas (mutatsiya xatosi). Massivga yangi xarajat qo'shish uchun avval eskilarni <b>...spread</b> orqali yoyib, keyin yangisini qo'shamiz.</p>",
          code: "const [xarajatlar, setXarajatlar] = useState([\n  { id: 1, nom: 'Non', narx: 5000 }\n]);\n\nconst qoshish = (yangiXarajat) => {\n  // Eskilarini yoyish va yangisini qo'shish\n  setXarajatlar([...xarajatlar, yangiXarajat]);\n};",
          language: "jsx"
        }
      ],
      task: {
        description: "Yangi xarajat qo'shish mantiqini yozing.",
        requirements: [
          "'xarajatlar' state'iga yangi obyekt qo'shing",
          "setXarajatlar ichida massiv ochib [ ], avval ...xarajatlar deb eskilarni yoying",
          "Undan keyin vergul bilan 'yangiXarajat' obyektini kiriting"
        ],
        hints: ["Massivni yangilashda har doim spread (...) operatoridan foydalanishni odat qiling."],
        mustInclude: [],
        starterCode: "import { useState } from 'react';\n\nfunction Tracker() {\n  const [xarajatlar, setXarajatlar] = useState([{ id: 1, nom: 'Yo\\'lkira', narx: 2000 }]);\n\n  const qoshish = () => {\n    const yangiXarajat = { id: Date.now(), nom: 'Tushlik', narx: 25000 };\n    \n    // Shu yerda setXarajatlar orqali massivni yangilang\n    \n  };\n\n  return <button onClick={qoshish}>Qo'shish</button>;\n}"
      },
      quizQuestions: [
        {
          question: "Reactda state dagi massivga yangi element qo'shishning ENG TO'G'RI usuli qaysi?",
          options: ["state.push(yangiElement);", "setState(yangiElement);", "setState([...eskiState, yangiElement]);", "state[1] = yangiElement;"],
          correct: 2,
          explanation: "React State o'zgarganini bilishi uchun eski massivning yuzasini buzmasdan, mutlaqo yangi massiv yaratib (spread orqali) berish kerak."
        }
      ]
    },

    // ----------------------------------------
    // 15-DARS: Loyiha 2 - Kino Qidirish
    // ----------------------------------------
    15: {
      id: 15,
      title: "Amaliy Loyiha 2: Kino qidiruv (Movie Search)",
      type: "programming",
      slides: [
        {
          icon: "🎬",
          title: "Kino izlash ilovasi",
          content: "<p>Bu loyihada foydalanuvchi inputga yozgan kino nomini ushlab olib, maxsus API ga (masalan, OMDB) jo'natamiz va natijalarni chizamiz.</p>"
        },
        {
          icon: "🔍",
          title: "Formani yuborish (Submit)",
          content: "<p>Forma yuborilganda sahifa yangilanib ketmasligi uchun <b>e.preventDefault()</b> dan foydalanamiz. Shundan so'ng <code>fetch</code> orqali izlashni boshlaymiz.</p>",
          code: "const izlash = async (e) => {\n  e.preventDefault(); // Sahifa yangilanishini to'xtatadi\n  \n  const res = await fetch(`https://api.omdbapi.com/?s=${kinoNomi}&apikey=SizningKalit`);\n  const data = await res.json();\n  \n  setKinolar(data.Search || []);\n};",
          language: "jsx"
        }
      ],
      task: {
        description: "Forma jo'natilishi (Submit) hodisasini to'g'ri sozlang.",
        requirements: [
          "'onSubmit' qabul qiladigan funksiya ichida eng birinchi bo'lib e.preventDefault() ni chaqiring",
          "Shundan so'nggina console.log da izlanayotgan matnni chiqaring"
        ],
        hints: ["e (event) parametri formaning jo'natilish hodisasini o'zida saqlaydi."],
        mustInclude: [],
        starterCode: "import { useState } from 'react';\n\nfunction MovieSearch() {\n  const [qidiruv, setQidiruv] = useState('');\n\n  const handleIzlash = (e) => {\n    // 1. Sahifa yangilanishini to'xtating\n    \n    \n    console.log(\"Qidirilmoqda:\", qidiruv);\n  };\n\n  return (\n    <form onSubmit={handleIzlash}>\n      <input value={qidiruv} onChange={e => setQidiruv(e.target.value)} />\n      <button type=\"submit\">Izlash</button>\n    </form>\n  );\n}"
      },
      quizQuestions: [
        {
          question: "Formadagi <button type='submit'> bosilganda brauzer sahifani avtomatik ravishda qayta yuklab (refresh) yuboradi. Buni to'xtatish uchun Reactda nima ishlatiladi?",
          options: ["e.stopPropagation()", "e.stop()", "e.preventDefault()", "return false;"],
          correct: 2,
          explanation: "e.preventDefault() formaning standart xulq-atvorini (sahifani yangilashni) bekor qiladi, shunda biz malumotni o'zimiz asinxron jo'nata olamiz."
        }
      ]
    },

    // ----------------------------------------
    // 16-DARS: Loyiha 3 - Shopping Cart
    // ----------------------------------------
    16: {
      id: 16,
      title: "Amaliy Loyiha 3: Korzinka (Shopping Cart)",
      type: "programming",
      slides: [
        {
          icon: "🛒",
          title: "Online Do'kon mantig'i",
          content: "<p>E-commerce (online do'kon) saytlarining eng qiyin joyi — <b>Korzinka</b> (Cart) mantig'i. Foydalanuvchi maxsulotni tanlaganda, agar u korzinkada yo'q bo'lsa yangidan qo'shiladi, agar allaqachon bo'lsa, faqat uning <b>soni (quantity)</b> oshiriladi.</p>"
        },
        {
          icon: "🧮",
          title: "Maxsulotni topish va o'zgartirish",
          content: "<p>Buning uchun massiv ustida izlash (find) va xaritalash (map) amallaridan mukammal foydalanishimiz kerak.</p>",
          code: "const qoshish = (maxsulot) => {\n  const borMi = korzinka.find(item => item.id === maxsulot.id);\n  \n  if (borMi) {\n    // Bor bo'lsa sonini +1 qilamiz\n    setKorzinka(korzinka.map(item => \n      item.id === maxsulot.id ? { ...item, soni: item.soni + 1 } : item\n    ));\n  } else {\n    // Yo'q bo'lsa yangidan qo'shamiz\n    setKorzinka([...korzinka, { ...maxsulot, soni: 1 }]);\n  }\n};",
          language: "javascript"
        }
      ],
      task: {
        description: "Korzinkadan maxsulotni o'chirib tashlash mantig'ini yozing.",
        requirements: [
          "'ochirish' nomli funksiya sizga 'id' qabul qiladi",
          "setKorzinka ichida korzinka.filter() dan foydalaning",
          "Filter qoidasi: item.id teng EMAS (!==) bo'lganlarini qoldiring"
        ],
        hints: ["Filter funksiyasi qaysi elementlarning qoidasi true bo'lsa, o'shalardan iborat yangi massiv qaytaradi."],
        mustInclude: [],
        starterCode: "import { useState } from 'react';\n\nfunction Cart() {\n  const [korzinka, setKorzinka] = useState([\n    { id: 1, nom: 'Noutbuk', soni: 1 },\n    { id: 2, nom: 'Sichqoncha', soni: 2 }\n  ]);\n\n  const ochirish = (ochiriladiganId) => {\n    // Filter orqali tanlangan ID ni massivdan olib tashlang\n    setKorzinka(\n      \n    );\n  };\n\n  return <button onClick={() => ochirish(1)}>Noutbukni o'chirish</button>;\n}"
      },
      quizQuestions: [
        {
          question: "Reactda massiv ichidan ma'lum bir ID ga ega bo'lgan elementni o'chirib, qolganlaridan iborat YAYNGI massiv yaratish uchun qaysi funksiya eng ideal tanlov hisoblanadi?",
          options: ["splice()", "slice()", "delete", "filter()"],
          correct: 3,
          explanation: "filter() funksiyasi berilgan shartga javob bermaydigan elementlarni tushirib qoldirib, yangi massiv yaratadi. Bu Reactda state'dan ma'lumot o'chirishning eng zo'r yo'li."
        }
      ]
    }
  }, // REACT KURSI TUGADI
  // ==========================================
  // 5 - INGLIZ TILI KURSI (courseId: 5)
  // ==========================================
  5: {
    // ----------------------------------------
    // 1-DARS: Salomlashish
    // ----------------------------------------
    1: {
      id: 1,
      title: "Salomlashish va Tanishtirish",
      type: "language", // "language" bo'lgani uchun bunda Code Editor chiqmaydi!
      slides: [
        {
          icon: "👋",
          title: "Asosiy salomlashish",
          content: "<p>Ingliz tilida salomlashishning rasmiy va norasmiy turlari mavjud:</p><ul><li><b>Hello</b> - Salom (Barcha holatlarda)</li><li><b>Hi / Hey</b> - Salom (Do'stlar orasida)</li></ul>"
        },
        {
          icon: "🌅",
          title: "Kunning qismlariga ko'ra",
          content: "<p>Ertalabdan to kechgacha qanday salomlashamiz?</p><ul><li><b>Good morning</b> - Xayrli tong (soat 12:00 gacha)</li><li><b>Good afternoon</b> - Xayrli kun (12:00 dan 18:00 gacha)</li><li><b>Good evening</b> - Xayrli kech (18:00 dan keyin)</li></ul>"
        },
        {
          icon: "🤝",
          title: "Hol-ahvol so'rash",
          content: "<p><b>How are you?</b> (Qalaysiz? / Qanday ahvoldasiz?)<br/><br/>Javob berish uchun:<br/>- <b>I am fine, thank you.</b> (Yaxshiman, rahmat)<br/>- <b>Not bad.</b> (Yomon emas)<br/>- <b>And you?</b> (O'zingizchi?)</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Soat 14:00 da (Tushlikdan keyin) uchrashib qolgan odam bilan qanday salomlashish eng to'g'ri bo'ladi?",
          options: ["Good night", "Good afternoon", "Good morning", "Good evening"],
          correct: 1,
          explanation: "Kunduzi soat 12:00 dan 18:00 gacha bo'lgan oraliqda 'Good afternoon' (Xayrli kun) ishlatiladi."
        }
      ]
    },

    // ----------------------------------------
    // 2-DARS: Olmoshlar va To Be
    // ----------------------------------------
    2: {
      id: 2,
      title: "Kishilik olmoshlari va 'To Be' fe'li",
      type: "language",
      slides: [
        {
          icon: "👤",
          title: "Men, Sen, U",
          content: "<p>Ingliz tilida shaxslarni to'g'ri atash juda muhim:</p><ul><li><b>I</b> - Men</li><li><b>You</b> - Sen / Siz</li><li><b>We</b> - Biz</li><li><b>They</b> - Ular</li><li><b>He</b> - U (O'g'il bolaga)</li><li><b>She</b> - U (Qiz bolaga)</li><li><b>It</b> - U (Narsa-buyum va hayvonlarga)</li></ul>"
        },
        {
          icon: "🔗",
          title: "'To be' (Bo'lmoq) fe'li",
          content: "<p>Ingliz tilida gapda asosiy fe'l (masalan: yugurish, yeyish) bo'lmasa, har doim <b>'to be'</b> ishlatiladi. Uning 3 ta shakli bor: <b>am, is, are</b>.</p><p><b>I am</b> a student. (Men talabaman)<br/><b>He is</b> a doctor. (U shifokor)<br/><b>You are</b> my friend. (Sen mening do'stimsan)</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Quyidagi qaysi gap grammatik jihatdan to'g'ri yozilgan?",
          options: ["I is a teacher", "She are beautiful", "They am friends", "We are happy"],
          correct: 3,
          explanation: "We (Biz) ko'plikda bo'lgani uchun doim 'are' ishlatiladi. I bilan 'am', She/He/It bilan 'is' keladi."
        }
      ]
    },

    // ----------------------------------------
    // 3-DARS: Raqamlar
    // ----------------------------------------
    3: {
      id: 3,
      title: "Raqamlar va Sanash",
      type: "language",
      slides: [
        {
          icon: "🔢",
          title: "1 dan 10 gacha",
          content: "<p>Asosiy raqamlarni yodlab oling:</p><ul><li>1 - One, 2 - Two, 3 - Three</li><li>4 - Four, 5 - Five, 6 - Six</li><li>7 - Seven, 8 - Eight</li><li>9 - Nine, 10 - Ten</li></ul>"
        },
        {
          icon: "🔟",
          title: "11 dan 20 gacha",
          content: "<p>11 dan 19 gacha bo'lgan raqamlar asosan <b>-teen</b> qo'shimchasi bilan yasaladi (o'smir degan ma'noni ham bildiradi).</p><p>11 - Eleven, 12 - Twelve<br/>13 - Thirteen, 14 - Fourteen<br/>15 - Fifteen ... 20 - Twenty</p>"
        },
        {
          icon: "💯",
          title: "O'nliklar",
          content: "<p>O'nlik raqamlar (20, 30, 40) doim <b>-ty</b> qo'shimchasi bilan tugaydi.</p><p>30 - Thirty, 40 - Forty, 50 - Fifty.<br/><b>100 - One hundred.</b></p>"
        }
      ],
      quizQuestions: [
        {
          question: "Ingliz tilida '15' raqami qanday yoziladi?",
          options: ["Fiveteen", "Fifteen", "Fifty", "Five-ten"],
          correct: 1,
          explanation: "15 raqami 'Fifteen' deb yoziladi. Fiveteen degan so'z yo'q, Fifty esa 50 degani."
        }
      ]
    },

    // ----------------------------------------
    // 4-DARS: Present Simple
    // ----------------------------------------
    4: {
      id: 4,
      title: "Hozirgi oddiy zamon (Present Simple)",
      type: "language",
      slides: [
        {
          icon: "⏳",
          title: "Qachon ishlatiladi?",
          content: "<p><b>Present Simple</b> doimiy, har kuni takrorlanadigan odatlarni va umumiy haqiqatlarni aytish uchun ishlatiladi. Masalan: <i>Men har kuni maktabga boraman. Quyosh sharqdan chiqadi.</i></p>"
        },
        {
          icon: "➕",
          title: "Darak gap (Positive)",
          content: "<p>Qoidasi juda oddiy: Shaxs + Fe'l.<br/><b>I work</b> (Men ishlayman).<br/><b>They play</b> (Ular o'ynashadi).<br/><br/><i>Eslatma:</i> Agar shaxs He, She, It bo'lsa, fe'lga <b>-s</b> qo'shiladi!<br/><b>He works</b>. <b>She plays</b>.</p>"
        },
        {
          icon: "➖",
          title: "Inkor gap (Negative)",
          content: "<p>Inkor qilish uchun <b>do not (don't)</b> yoki <b>does not (doesn't)</b> ishlatiladi.</p><p>I don't work. (Men ishlamayman)<br/>He doesn't play. (U o'ynamaydi)</p>"
        }
      ],
      quizQuestions: [
        {
          question: "'Mening akam Toshkentda yashaydi' gapining to'g'ri tarjimasini toping:",
          options: ["My brother live in Tashkent", "My brother living in Tashkent", "My brother lives in Tashkent", "My brother is live in Tashkent"],
          correct: 2,
          explanation: "'My brother' uchinchi shaxs birlik (He) bo'lgani uchun, fe'lga (live) '-s' qo'shimchasi qo'shilishi shart."
        }
      ]
    },

    // ----------------------------------------
    // 5-DARS: Daily Routine
    // ----------------------------------------
    5: {
      id: 5,
      title: "Kundalik rejim (Daily Routine)",
      type: "language",
      slides: [
        {
          icon: "⏰",
          title: "Ertalabki odatlar",
          content: "<ul><li><b>Wake up</b> - Uyg'onmoq</li><li><b>Get up</b> - O'rindan turmoq</li><li><b>Wash face</b> - Yuzni yuvmoq</li><li><b>Brush teeth</b> - Tishlarni yuvmoq</li><li><b>Have breakfast</b> - Nonushta qilmoq</li></ul><p><i>Misol:</i> I wake up at 7 o'clock. (Men soat 7 da uyg'onaman).</p>"
        },
        {
          icon: "🏫",
          title: "Kun davomida",
          content: "<ul><li><b>Go to school / work</b> - Maktabga/ishga bormoq</li><li><b>Have lunch</b> - Tushlik qilmoq</li><li><b>Come home</b> - Uyga qaytmoq</li><li><b>Do homework</b> - Uy vazifasini qilmoq</li><li><b>Have dinner</b> - Kechki ovqatni yemoq</li><li><b>Go to bed</b> - Uxlashga yotmoq</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Ingliz tilida 'Kechki ovqat yemoq' qanday aytiladi?",
          options: ["Have breakfast", "Have dinner", "Have lunch", "Eat night"],
          correct: 1,
          explanation: "Breakfast (Nonushta), Lunch (Tushlik), Dinner esa (Kechki ovqat) degani."
        }
      ]
    },

    // ----------------------------------------
    // 6-DARS: Yo'nalishlar
    // ----------------------------------------
    6: {
      id: 6,
      title: "Sayohat va Yo'nalishlar",
      type: "language",
      slides: [
        {
          icon: "📍",
          title: "Manzilni so'rash",
          content: "<p>Chet elda adashib qolmaslik uchun eng kerakli savollar:</p><ul><li><b>Where is the...?</b> - ... qayerda joylashgan? (<i>Where is the hotel?</i>)</li><li><b>How can I go to...?</b> - ... ga qanday borsam bo'ladi?</li><li><b>Excuse me, is there a bank near here?</b> - Kechirasiz, shu atrofda bank bormi?</li></ul>"
        },
        {
          icon: "🧭",
          title: "Yo'nalishni tushuntirish",
          content: "<ul><li><b>Go straight</b> - To'g'riga yuring</li><li><b>Turn left</b> - Chapga buriling</li><li><b>Turn right</b> - O'ngga buriling</li><li><b>It is on your left</b> - U sizning chap tomoningizda bo'ladi</li><li><b>Next to...</b> - ...ning yonida</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Xaritadan qarab odamga 'Chapga buriling va to'g'riga yuring' demoqchisiz. Qanday aytasiz?",
          options: ["Turn right and go back", "Go straight and turn right", "Turn left and go straight", "Turn left and stop"],
          correct: 2,
          explanation: "'Turn left' - chapga burilmoq, 'Go straight' - to'g'riga yurmoq degani."
        }
      ]
    },

    // ----------------------------------------
    // 7-DARS: Oila a'zolari
    // ----------------------------------------
    7: {
      id: 7,
      title: "Oila a'zolari (Family members)",
      type: "language",
      slides: [
        {
          icon: "👨‍👩‍👧‍👦",
          title: "Asosiy oila a'zolari",
          content: "<p>Oila a'zolarini ingliz tilida qanday ataymiz?</p><ul><li><b>Family</b> - Oila</li><li><b>Parents</b> - Ota-ona</li><li><b>Father / Dad</b> - Ota / Dada</li><li><b>Mother / Mom</b> - Ona / Oyi</li><li><b>Child / Children</b> - Bola / Bolalar</li></ul>"
        },
        {
          icon: "👦👧",
          title: "Aka-uka, opa-singillar",
          content: "<ul><li><b>Brother</b> - Aka yoki uka</li><li><b>Sister</b> - Opa yoki singil</li><li><b>Son</b> - O'g'il farzand</li><li><b>Daughter</b> - Qiz farzand</li></ul><p><i>Misol:</i> I have two brothers and one sister. (Mening ikkita akam va bitta opam bor).</p>"
        },
        {
          icon: "👴👵",
          title: "Qarindoshlar",
          content: "<ul><li><b>Grandfather</b> - Bobo</li><li><b>Grandmother</b> - Buvi</li><li><b>Uncle</b> - Amaki yoki Tog'a</li><li><b>Aunt</b> - Xola yoki Amma</li><li><b>Cousin</b> - Amakivachcha, xolavachcha</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Ingliz tilida 'Qiz farzand' qanday aytiladi?",
          options: ["Sister", "Son", "Girl", "Daughter"],
          correct: 3,
          explanation: "'Daughter' qiz farzandni, 'Son' esa o'g'il farzandni bildiradi. 'Sister' bu opa-singil."
        }
      ]
    },

    // ----------------------------------------
    // 8-DARS: Ranglar va Kiyimlar
    // ----------------------------------------
    8: {
      id: 8,
      title: "Ranglar va Kiyimlar (Colors and Clothes)",
      type: "language",
      slides: [
        {
          icon: "🎨",
          title: "Asosiy Ranglar",
          content: "<p>Dunyoni ranglarsiz tasavvur qilib bo'lmaydi:</p><ul><li><b>Red</b> - Qizil</li><li><b>Blue</b> - Ko'k</li><li><b>Green</b> - Yashil</li><li><b>Yellow</b> - Sariq</li><li><b>Black</b> - Qora</li><li><b>White</b> - Oq</li></ul>"
        },
        {
          icon: "👕",
          title: "Kiyim-kechak",
          content: "<ul><li><b>Shirt</b> - Ko'ylak (erkaklar)</li><li><b>T-shirt</b> - Futbolka</li><li><b>Dress</b> - Ko'ylak (ayollar)</li><li><b>Trousers / Pants</b> - Shim</li><li><b>Shoes</b> - Oyoq kiyim</li><li><b>Hat</b> - Shlyapa / Bosh kiyim</li></ul>"
        },
        {
          icon: "👗",
          title: "Sifat va Ot",
          content: "<p>Ingliz tilida rang doimo narsadan oldin aytiladi!</p><p><b>A red shirt</b> - Qizil ko'ylak (Shirt red - XATO!)<br/><b>Black shoes</b> - Qora oyoq kiyim.</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Tarjimani toping: 'Mening ko'k shimim bor'",
          options: ["I have blue trousers", "I have trousers blue", "My trousers is blue", "I am blue trousers"],
          correct: 0,
          explanation: "Sifat (rang) doim otdan (buyumdan) oldin keladi va shaxsning borligini aytish uchun 'have' ishlatiladi."
        }
      ]
    },

    // ----------------------------------------
    // 9-DARS: Oziq-ovqat
    // ----------------------------------------
    9: {
      id: 9,
      title: "Oziq-ovqat va Ichimliklar (Food and Drinks)",
      type: "language",
      slides: [
        {
          icon: "🍽️",
          title: "Ovqatlanish vaqtlari",
          content: "<p>Inglizlar kuniga 3 marta asosiy ovqatlanishadi:</p><ul><li><b>Breakfast</b> - Nonushta</li><li><b>Lunch</b> - Tushlik</li><li><b>Dinner</b> - Kechki ovqat</li></ul><p><i>Savol:</i> What do you want for dinner? (Kechki ovqatga nima xohlaysiz?)</p>"
        },
        {
          icon: "🍎",
          title: "Mevalar va Sabzavotlar",
          content: "<ul><li><b>Apple</b> - Olma</li><li><b>Banana</b> - Banan</li><li><b>Orange</b> - Apelsin</li><li><b>Potato</b> - Kartoshka</li><li><b>Tomato</b> - Pomidor</li><li><b>Onion</b> - Piyoz</li></ul>"
        },
        {
          icon: "☕",
          title: "Ichimliklar",
          content: "<ul><li><b>Water</b> - Suv</li><li><b>Tea</b> - Choy</li><li><b>Coffee</b> - Qahva</li><li><b>Milk</b> - Sut</li><li><b>Juice</b> - Sharbat</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Ertalabki soat 08:00 dagi ovqatlanish qanday ataladi?",
          options: ["Dinner", "Lunch", "Breakfast", "Snack"],
          correct: 2,
          explanation: "Ertalabki nonushta - Breakfast, Kunduzgi tushlik - Lunch, Kechki ovqat esa Dinner deyiladi."
        }
      ]
    },

    // ----------------------------------------
    // 10-DARS: Present Continuous
    // ----------------------------------------
    10: {
      id: 10,
      title: "Hozirgi davomiy zamon (Present Continuous)",
      type: "language",
      slides: [
        {
          icon: "🏃‍♂️",
          title: "Ayni damda qilinayotgan ish",
          content: "<p><b>Present Continuous</b> — aynan hozirgi daqiqada sodir bo'layotgan ishlarni aytish uchun ishlatiladi. Masalan: <i>Men hozir dars qilyapman. U uxlayapti.</i></p>"
        },
        {
          icon: "➕",
          title: "Yasalishi (Darak gap)",
          content: "<p>Qoidasi: <b>Shaxs + am/is/are + fe'l(-ing)</b></p><p><b>I am reading.</b> (Men o'qiyapman)<br/><b>He is playing.</b> (U o'ynayapti)<br/><b>They are eating.</b> (Ular ovqatlanishyapti)</p>"
        },
        {
          icon: "❓",
          title: "Inkor va So'roq",
          content: "<p>Inkor qilish uchun to be (am, is, are) dan keyin <b>not</b> qo'shiladi.<br/><i>He is not (isn't) sleeping.</i> (U uxlamayapti).</p><p>So'roq gapda to be oldinga chiqadi:<br/><i>Are you listening?</i> (Siz eshitayapsizmi?)</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Qaysi gap to'g'ri va 'U hozir televizor ko'ryapti' degan ma'noni beradi?",
          options: ["He watch TV", "He watching TV", "He is watch TV", "He is watching TV"],
          correct: 3,
          explanation: "Present Continuous da to be (is) va fe'lga qo'shilgan (-ing) bir vaqtda kelishi shart. Shuning uchun 'He is watching TV' to'g'ri."
        }
      ]
    },

    // ----------------------------------------
    // 11-DARS: Vaqt
    // ----------------------------------------
    11: {
      id: 11,
      title: "Vaqtni aytish (Telling the Time)",
      type: "language",
      slides: [
        {
          icon: "⌚",
          title: "Soat necha bo'ldi?",
          content: "<p><b>What time is it?</b> - Soat necha bo'ldi?<br/>Javob berish har doim <b>\"It is...\"</b> bilan boshlanadi.</p><p>Agar soat roppa-rosa bo'lsa, <b>o'clock</b> so'zini qo'shamiz:<br/>It is five o'clock. (Soat roppa-rosa 5:00).</p>"
        },
        {
          icon: "🌗",
          title: "Yarim va Chorak",
          content: "<p><b>Half past</b> - Yarimta o'tdi (30 minut).<br/><i>It is half past four (4:30).</i></p><p><b>A quarter past</b> - Chorak o'tdi (15 minut).<br/><i>It is a quarter past two (2:15).</i></p>"
        },
        {
          icon: "⏱️",
          title: "O'tdi va Qoldi (Past & To)",
          content: "<p>Daqiqalar 30 gacha bo'lsa <b>past</b> (o'tdi), 30 dan oshsa <b>to</b> (kam) ishlatiladi.</p><p>It is ten past six (6:10).<br/>It is twenty to eight (7:40 - 8 ga 20 ta kam).</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Soat 03:30 (Uch yarim) ni ingliz tilida qanday aytamiz?",
          options: ["It is three thirty", "It is half past three", "Ikkala javob ham to'g'ri", "It is thirty past three"],
          correct: 2,
          explanation: "Ingliz tilida raqamlarni oddiy o'qish (three thirty) ham, grammatik usul (half past three) ham mutlaqo to'g'ri hisoblanadi."
        }
      ]
    },

    // ----------------------------------------
    // 12-DARS: Kunlar va Oylar
    // ----------------------------------------
    12: {
      id: 12,
      title: "Hafta kunlari va Oylar (Days and Months)",
      type: "language",
      slides: [
        {
          icon: "📅",
          title: "Hafta kunlari (Days of the week)",
          content: "<p>Kunlar doim <b>Katta harf</b> bilan yoziladi va <b>on</b> predlogi bilan ishlatiladi (<i>on Monday</i>).</p><ul><li><b>Monday</b> - Dushanba</li><li><b>Tuesday</b> - Seshanba</li><li><b>Wednesday</b> - Chorshanba</li><li><b>Thursday</b> - Payshanba</li><li><b>Friday</b> - Juma</li><li><b>Saturday</b> - Shanba</li><li><b>Sunday</b> - Yakshanba</li></ul>"
        },
        {
          icon: "❄️☀️",
          title: "Fasllar (Seasons)",
          content: "<p>Yilda 4 ta fasl bor (Fasllar bilan <b>in</b> ishlatiladi):</p><ul><li><b>Spring</b> - Bahor</li><li><b>Summer</b> - Yoz</li><li><b>Autumn / Fall</b> - Kuz</li><li><b>Winter</b> - Qish</li></ul>"
        },
        {
          icon: "📆",
          title: "Oylar (Months)",
          content: "<p>Oylar bilan ham <b>in</b> predlogi ishlatiladi (<i>in January</i>).<br/><br/>January (Yanvar), February (Fevral), March (Mart), April (Aprel), May (May), June (Iyun), July (Iyul), August (Avgust), September (Sentabr), October (Oktabr), November (Noyabr), December (Dekabr).</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Siz Chorshanba kuni do'stingiz bilan uchrashmoqchisiz. Qanday aytasiz?",
          options: ["See you in Wednesday", "See you on Wednesday", "See you at Wednesday", "See you Wednesday"],
          correct: 1,
          explanation: "Hafta kunlari (Monday, Tuesday...) oldidan har doim 'on' predlogi ishlatiladi."
        }
      ]
    },
    // ----------------------------------------
    // B1 DARAJASI (O'rta daraja)
    // ----------------------------------------

    // 13-DARS: Past Simple va Past Continuous
    // ----------------------------------------
    13: {
      id: 13,
      title: "O'tgan zamonlar (Past Simple vs Past Continuous)",
      type: "language",
      slides: [
        {
          icon: "⏪",
          title: "Past Simple (Oddiy o'tgan zamon)",
          content: "<p><b>Past Simple</b> o'tmishda tugallangan, aniq vaqti ma'lum bo'lgan ish-harakatlar uchun ishlatiladi.</p><p><i>Yasalishi:</i> To'g'ri fe'llarga <b>-ed</b> qo'shiladi (work -> worked), noto'g'ri fe'llarning esa 2-shakli olinadi (go -> went).</p><p><b>I visited London last year.</b> (Men o'tgan yili Londonga bordim).</p>"
        },
        {
          icon: "⏳",
          title: "Past Continuous (Davomiy o'tgan zamon)",
          content: "<p><b>Past Continuous</b> o'tmishning aniq bir vaqtida davom etayotgan jarayonlarni bildiradi.</p><p><i>Yasalishi:</i> <b>was/were + verb(-ing)</b></p><p><b>I was watching TV at 8 PM yesterday.</b> (Kecha soat 8 da men televizor ko'rayotgan edim).</p>"
        },
        {
          icon: "🔗",
          title: "Ikkalasini birga ishlatish",
          content: "<p>Ko'pincha uzoq davom etayotgan jarayonni (Past Continuous), qisqa harakat (Past Simple) bo'lib yuborganda ular birgalikda keladi.</p><p><b>I was reading a book when the phone rang.</b><br/>(Telefon jiringlaganida, men kitob o'qiyotgan edim).</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Quyidagi qaysi gap o'tmishda davom etayotgan jarayonni bildiradi?",
          options: ["She cooked dinner yesterday.", "She is cooking dinner now.", "She was cooking dinner when I arrived.", "She cooks dinner every day."],
          correct: 2,
          explanation: "Past Continuous (was cooking) jarayonni bildiradi va ko'pincha Past Simple (when I arrived) bilan birga kelib, harakatning bo'linganini ko'rsatadi."
        }
      ]
    },

    // ----------------------------------------
    // 14-DARS: Present Perfect
    // ----------------------------------------
    14: {
      id: 14,
      title: "Tugallangan hozirgi zamon (Present Perfect)",
      type: "language",
      slides: [
        {
          icon: "✅",
          title: "Present Perfect nima?",
          content: "<p>Bu zamon o'zbek tiliga tushuntirish eng qiyin zamonlardan biri, chunki u o'tmishda sodir bo'lgan, lekin <b>natijasi hozirgi kunga ta'sir qilayotgan</b> yoki <b>hayotiy tajribani</b> aytish uchun ishlatiladi.</p>"
        },
        {
          icon: "➕",
          title: "Yasalishi",
          content: "<p>Qoidasi: <b>have/has + fe'lning 3-shakli (V3/ed)</b></p><p><b>I have lost my keys.</b> (Kalitimni yo'qotib qo'ydim - natija: hozir uyga kirolmayapman).<br/><b>She has visited Paris three times.</b> (U Parijda 3 marta bo'lgan - hayotiy tajriba).</p>"
        },
        {
          icon: "⏰",
          title: "Muhim so'zlar",
          content: "<p>Present Perfect asosan quyidagi so'zlar bilan keladi:</p><ul><li><b>Just</b> - hozirgina (I have just eaten)</li><li><b>Already</b> - allaqachon (I have already finished)</li><li><b>Yet</b> - hali (I haven't done it yet) - faqat inkor va so'roqda</li><li><b>Ever / Never</b> - hech / hech qachon</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "'Siz hech qachon sushi yeganmisiz?' deb so'rash uchun qaysi zamon va so'zlar ishlatiladi?",
          options: ["Did you ever eat sushi?", "Have you ever eaten sushi?", "Do you ever eat sushi?", "Are you ever eating sushi?"],
          correct: 1,
          explanation: "Hayotiy tajribani so'rash uchun doim Present Perfect (Have you ever + V3) ishlatiladi."
        }
      ]
    },

    // ----------------------------------------
    // 15-DARS: Modal fe'llar (B1)
    // ----------------------------------------
    15: {
      id: 15,
      title: "Modal fe'llar (Must, Should, Have to)",
      type: "language",
      slides: [
        {
          icon: "🚦",
          title: "Majburiyat (Must vs Have to)",
          content: "<p>Ikkala so'z ham 'kerak/shart' ma'nosini bildiradi, lekin farqi bor:</p><ul><li><b>Must</b> - Ichki majburiyat yoki qat'iy qoida. <i>(I must study hard. - Yaxshi o'qishim shart!)</i></li><li><b>Have to</b> - Tashqi majburiyat (qonun, ish, birov aytgani uchun). <i>(I have to wear a uniform at work. - Ishda forma kiyishga majburman.)</i></li></ul>"
        },
        {
          icon: "💡",
          title: "Maslahat (Should)",
          content: "<p><b>Should</b> - maslahat berish uchun ishlatiladi ('kerak' deb tarjima qilinadi, lekin majburiy emas).</p><p><b>You look tired. You should go to bed.</b><br/>(Charchagan ko'rinasan. Uxlashga yotishing kerak).</p>"
        },
        {
          icon: "🚫",
          title: "Taqiq (Mustn't vs Don't have to)",
          content: "<p>Bu yerda juda ehtiyot bo'lish kerak!</p><ul><li><b>Mustn't</b> - Qat'iy taqiq (Mumkin emas!). <i>You mustn't smoke here.</i></li><li><b>Don't have to</b> - Majbur emassan (qilsang ham mayli, lekin shart emas). <i>You don't have to come early.</i></li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "'Ertaga yakshanba, shuning uchun men barvaqt turishga MAJBUR EMASMAN' deyish uchun qaysi birini ishlatasiz?",
          options: ["I mustn't wake up early", "I shouldn't wake up early", "I don't have to wake up early", "I can't wake up early"],
          correct: 2,
          explanation: "Majburiyat yo'qligini bildirish uchun 'don't have to' ishlatiladi. 'Mustn't' qilsang jazolanasan degan ma'noni berib qo'yadi."
        }
      ]
    },

    // ----------------------------------------
    // B2 DARAJASI (Yuqori-o'rta daraja)
    // ----------------------------------------

    // 16-DARS: Conditionals
    // ----------------------------------------
    16: {
      id: 16,
      title: "Shart gaplar (Conditionals 1 & 2)",
      type: "language",
      slides: [
        {
          icon: "🔮",
          title: "First Conditional (Haqiqiy shart)",
          content: "<p>Kelajakda sodir bo'lishi ehtimoli juda yuqori bo'lgan haqiqiy shartlar.</p><p><i>Formulasi:</i> <b>If + Present Simple, will + verb</b></p><p><b>If it rains, we will stay at home.</b><br/>(Agar yomg'ir yog'sa, biz uyda qolamiz).</p>"
        },
        {
          icon: "💭",
          title: "Second Conditional (Xayoliy shart)",
          content: "<p>Hozirgi yoki kelajakdagi haqiqatga to'g'ri kelmaydigan, faqat xayol qilinayotgan vaziyatlar.</p><p><i>Formulasi:</i> <b>If + Past Simple, would + verb</b></p><p><b>If I had a million dollars, I would buy a big house.</b><br/>(Agar million dollarim bo'lganida edi, katta uy sotib olar edim).</p>"
        },
        {
          icon: "🎭",
          title: "Maslahat berish siri",
          content: "<p>Birovga maslahat berishda 2-shart gapdan juda chiroyli foydalanish mumkin:</p><p><b>If I were you, I wouldn't do that.</b><br/>(Sening o'rningda bo'lganimda, bu ishni qilmagan bo'lardim).</p><p><i>Eslatma:</i> Second Conditional'da 'was' o'rniga barcha shaxslar uchun 'were' ishlatish grammatik jihatdan to'g'riroq.</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Ayni damda sizda mashina yo'q. Shuni xayol qilib: 'Agar mashinam bo'lganda, ishga haydab borardim' deb qanday aytasiz?",
          options: ["If I have a car, I will drive to work.", "If I had a car, I would drive to work.", "If I will have a car, I drive to work.", "If I had a car, I will drive to work."],
          correct: 1,
          explanation: "Haqiqatdan yiroq, xayoliy holatlar (Second Conditional) uchun If qismida Past Simple (had), asosiy qismda esa 'would + fe'l' ishlatiladi."
        }
      ]
    },

    // ----------------------------------------
    // 17-DARS: Passive Voice
    // ----------------------------------------
    17: {
      id: 17,
      title: "Majhul nisbat (Passive Voice)",
      type: "language",
      slides: [
        {
          icon: "🔄",
          title: "Passive Voice nima?",
          content: "<p>Gapda ish-harakatni <b>KIM</b> bajargani emas, nima ish <b>QILINGANI</b> muhimroq bo'lganda Majhul nisbat ishlatiladi. Rasmiy matnlar va yangiliklarda juda ko'p uchraydi.</p><p><i>Aktiv:</i> Shakespeare wrote Hamlet. (Shekspir Hamletni yozgan).<br/><i>Passiv:</i> <b>Hamlet was written by Shakespeare.</b> (Hamlet Shekspir tomonidan yozilgan).</p>"
        },
        {
          icon: "➕",
          title: "Yasalishi",
          content: "<p>Barcha zamonlar uchun asosiy qoida: <b>to be (zamoniga qarab) + V3 (fe'lning 3-shakli)</b>.</p><ul><li><b>Present:</b> The room <i>is cleaned</i> every day. (Xona har kuni tozalanadi)</li><li><b>Past:</b> The room <i>was cleaned</i> yesterday. (Xona kecha tozalandi)</li><li><b>Future:</b> The room <i>will be cleaned</i> tomorrow. (Xona ertaga tozalanadi)</li></ul>"
        },
        {
          icon: "🕵️",
          title: "'By' predlogi",
          content: "<p>Agar baribir ishni kim bajarganini aytmoqchi bo'lsak, gapning oxirida <b>by</b> (tomonidan) predlogidan foydalanamiz.</p><p>The window was broken <b>by the boy</b>. (Oyna bola tomonidan sindirildi).</p>"
        }
      ],
      quizQuestions: [
        {
          question: "'Kitoblar o'tgan yili nashr etilgan' gapini ingliz tilida to'g'ri ayting:",
          options: ["The books are published last year", "The books published last year", "The books were published last year", "The books was published last year"],
          correct: 2,
          explanation: "O'tgan zamon majhul nisbati (Past Passive) 'was/were + V3' bilan yasaladi. 'Books' ko'plikda bo'lgani uchun 'were published' to'g'ri bo'ladi."
        }
      ]
    },

    // ----------------------------------------
    // 18-DARS: Reported Speech
    // ----------------------------------------
    18: {
      id: 18,
      title: "O'zlashtirma gap (Reported Speech)",
      type: "language",
      slides: [
        {
          icon: "🗣️",
          title: "Birovning gapini yetkazish",
          content: "<p>Birovning aytgan gapini boshqa odamga aytib berayotganda <b>Reported Speech</b> (O'zlashtirma gap) ishlatiladi.</p><p>Buning asosiy qoidasi — <b>zamonlarning bir qadam orqaga siljishidir (Backshift)</b>.</p>"
        },
        {
          icon: "⏪",
          title: "Zamonlar qanday siljiydi?",
          content: "<p>Agar gapiruvchi 'Men charchadim' (Present) desa, siz yetkazayotganda 'U charchaganligini aytdi' (Past) deysiz.</p><ul><li><b>Present Simple ➔ Past Simple:</b> \"I like apples\" ➔ He said (that) he <i>liked</i> apples.</li><li><b>Present Cont ➔ Past Cont:</b> \"I am working\" ➔ She said she <i>was working</i>.</li><li><b>Will ➔ Would:</b> \"I will help\" ➔ He said he <i>would</i> help.</li></ul>"
        },
        {
          icon: "🕰️",
          title: "Vaqt so'zlarining o'zgarishi",
          content: "<p>O'zlashtirma gapda vaqt va joy bildiruvchi so'zlar ham o'zgaradi:</p><ul><li><b>Today</b> ➔ That day (O'sha kuni)</li><li><b>Tomorrow</b> ➔ The next day (Keyingi kuni)</li><li><b>Yesterday</b> ➔ The day before (Oldingi kuni)</li><li><b>Here</b> ➔ There (U yerda)</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Ali aytdi: 'I am reading a book today'. Buni o'zlashtirma gapga qanday to'g'ri o'tkazasiz?",
          options: ["Ali said that he is reading a book today.", "Ali said that he was reading a book that day.", "Ali said that I was reading a book today.", "Ali said that he reads a book that day."],
          correct: 1,
          explanation: "Present Continuous (am reading) ➔ Past Continuous (was reading) ga aylanadi. Vaqt so'zi 'today' ➔ 'that day' ga o'zgarishi shart."
        }
      ]
    }
  },
  // ==========================================
  // 6 - RUS TILI KURSI (courseId: 6)
  // ==========================================
  6: {
    // ----------------------------------------
    // KIRISH BO'LIMI
    // ----------------------------------------
    1: {
      id: 1,
      title: "Rus alifbosi (Кириллица)",
      type: "language",
      slides: [
        {
          icon: "🔤",
          title: "Kirill alifbosi bilan tanishuv",
          content: "<p>Rus alifbosi <b>33 ta harfdan</b> iborat bo'lib, ular 3 guruhga bo'linadi:</p><ul><li><b>10 ta unli</b> (А, Е, Ё, И, О, У, Ы, Э, Ю, Я)</li><li><b>21 ta undosh</b> (Б, В, Г, Д, Ж...)</li><li><b>2 ta belgi</b> (Ъ - qattiq belgi, Ь - yumshatish belgisi). Bu belgilarning o'z ovozi yo'q, ular faqat o'zidan oldingi harfning qanday o'qilishini belgilaydi.</li></ul>"
        },
        {
          icon: "⚠️",
          title: "Adashtiruvchi harflar (Ehtiyot bo'ling!)",
          content: "<p>Ba'zi ruscha harflar lotin alifbosiga o'xshasa-da, mutlaqo boshqacha o'qiladi:</p><ul><li><b>В</b> — [V] deb o'qiladi (Masalan: Вода - Voda)</li><li><b>Н</b> — [N] deb o'qiladi (Masalan: Нос - Nos)</li><li><b>Р</b> — [R] deb o'qiladi (Masalan: Рука - Ruka)</li><li><b>С</b> — [S] deb o'qiladi (Masalan: Сок - Sok)</li><li><b>У</b> — [U] deb o'qiladi (Masalan: Утро - Utro)</li><li><b>Х</b> — [X] deb o'qiladi (Masalan: Хлеб - Xleb)</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Rus tilidagi 'В' va 'Р' harflari qanday o'qiladi?",
          options: ["B va P", "V va R", "V va P", "B va R"],
          correct: 1,
          explanation: "Rus alifbosida В harfi [V] (Вода), Р harfi esa [R] (Рука) deb o'qiladi."
        }
      ]
    },
    2: {
      id: 2,
      title: "Talaffuz qoidalari (Произношение)",
      type: "language",
      slides: [
        {
          icon: "🗣️",
          title: "Urg'u (Ударение) - Eng muhim qoida",
          content: "<p>Rus tilida urg'u so'zning xohlagan bo'g'iniga tushishi mumkin va u so'zning ma'nosini butunlay o'zgartirib yuboradi:</p><ul><li><b>зАмок</b> (ZAmak) — qasr, saroy</li><li><b>замОк</b> (zamOk) — qulf</li></ul><p><i>Maslahat: Yangi so'z yodlaganda doim urg'usi bilan yodlang!</i></p>"
        },
        {
          icon: "🔄",
          title: "O harfining A ga aylanishi (Reduksiya)",
          content: "<p>Bu qoidani bilmasangiz, rus tilida chiroyli gapira olmaysiz:</p><p>Agar <b>О</b> harfiga urg'u tushsa, u aniq <b>[O]</b> deb o'qiladi (Masalan: Д<b>о</b>м).<br/>Ammo, agar <b>О</b> harfiga urg'u TUSHMASA, u <b>[A]</b> kabi o'qiladi!</p><p><i>Misol:</i> <b>Молоко</b> so'zida urg'u eng oxirgi 'O' ga tushadi. Shuning uchun u <i>[MalakO]</i> deb o'qiladi.</p>"
        }
      ],
      quizQuestions: [
        {
          question: "'Хорошо' (Yaxshi) so'zida urg'u eng oxirgi 'О' ga tushadi. Bu so'z qanday talaffuz qilinadi?",
          options: ["XoroshO", "XarashO", "XaroshA", "XarashA"],
          correct: 1,
          explanation: "Urg'u tushmagan birinchi va ikkinchi 'О' harflari reduksiyaga uchrab 'А' deb o'qiladi: Xa-ra-shO."
        }
      ]
    },
    3: {
      id: 3,
      title: "Salomlashish (Приветствия)",
      type: "language",
      slides: [
        {
          icon: "🤝",
          title: "Rasmiy va Hurmat bilan (Sizlab)",
          content: "<p>O'zingizdan kattalarga, notanish insonlarga yoki rasmiy joylarda ishlatiladigan so'zlar:</p><ul><li><b>Здравствуйте</b> (Zdrastvuyte) - Assalomu alaykum (So'zma-so'z: Sog' bo'ling)</li><li><b>Доброе утро</b> (Dobroye utro) - Xayrli tong</li><li><b>Добрый день</b> (Dobriy den) - Xayrli kun</li><li><b>Добрый вечер</b> (Dobriy vecher) - Xayrli kech</li></ul>"
        },
        {
          icon: "👋",
          title: "Do'stona va Norasmiy (Senlab)",
          content: "<p>Do'stlar, oila a'zolari va tengdoshlarga nisbatan ishlatiladi:</p><ul><li><b>Привет</b> (Privet) - Salom</li><li><b>Здорово</b> (Zdarova) - Qalay (Juda norasmiy, yigitlar orasida)</li></ul>"
        },
        {
          icon: "🚶‍♂️",
          title: "Xayrlashish (Прощание)",
          content: "<ul><li><b>До свидания</b> (Do svidaniya) - Xayr, ko'rishguncha (Rasmiy)</li><li><b>Пока</b> (Poka) - Xayr (Do'stona)</li><li><b>До завтра</b> (Do zavtra) - Ertagacha</li><li><b>Спокойной ночи</b> (Spokoynoy nochi) - Xayrli tun</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Ishxonangizga yangi rahbar keldi. U bilan birinchi marta ko'rishganingizda qanday salomlashasiz?",
          options: ["Привет, начальник!", "Добрый день, как дела?", "Здравствуйте!", "Пока!"],
          correct: 2,
          explanation: "Rasmiy holatlarda va o'zidan kattalarga nisbatan eng to'g'ri va xushmuomala salomlashish bu 'Здравствуйте' dir."
        }
      ]
    },

    // ----------------------------------------
    // GRAMMATIKA BO'LIMI
    // ----------------------------------------
    4: {
      id: 4,
      title: "Ot va sifat (Jinslar / Роды)",
      type: "language",
      slides: [
        {
          icon: "🚹",
          title: "Uchta Jins (Три рода)",
          content: "<p>Rus tilining eng katta siri: hamma so'zlar (hatto jonsiz narsalar ham) jinsga ega! Ularni so'zning oxirgi harfiga qarab aniqlaymiz:</p><p><b>1. Мужской род (O'g'il bola)</b> - Asosan undosh harf va 'й' bilan tugaydi.<br/><i>Дом (Uy), Стол (Stol), Чай (Choy), Музей (Muzey).</i></p><p><b>2. Женский род (Qiz bola)</b> - Asosan 'а' yoki 'я' bilan tugaydi.<br/><i>Машина (Mashina), Книга (Kitob), Семья (Oila).</i></p><p><b>3. Средний род (O'rta)</b> - Asosan 'о' yoki 'е' bilan tugaydi.<br/><i>Окно (Deraza), Море (Dengiz), Яблоко (Olma).</i></p>"
        },
        {
          icon: "🎨",
          title: "Sifatlarning moslashishi",
          content: "<p>Sifat (Qanday? Qanaqa?) doim o'zi ta'riflayotgan otning jinsiga moslashib oxirini o'zgartiradi:</p><ul><li><b>Мужской:</b> Красив<b>ый</b> дом (Chiroyli uy)</li><li><b>Женский:</b> Красив<b>ая</b> машина (Chiroyli mashina)</li><li><b>Средний:</b> Красив<b>ое</b> окно (Chiroyli deraza)</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "'Умный' (Aqlli) sifatini 'Студентка' (Talaba qiz) so'ziga qanday qilib to'g'ri moslashtiramiz?",
          options: ["Умный студентка", "Умная студентка", "Умное студентка", "Умные студентка"],
          correct: 1,
          explanation: "Студентка so'zi 'А' bilan tugagani uchun Женский род (Qiz bola) ga kiradi. Sifat ham unga moslashib 'Умная' bo'ladi."
        }
      ]
    },
    5: {
      id: 5,
      title: "Padejlar (Падежи - Kelishiklar)",
      type: "language",
      slides: [
        {
          icon: "🧩",
          title: "Padej nima o'zi?",
          content: "<p>Rus tilida gapdagi so'zlar bir-biri bilan mantiqan bog'lanishi uchun ularning oxiri (qo'shimchasi) o'zgaradi. Masalan, O'zbek tilidagi <i>Maktab<b>ga</b>, Maktab<b>da</b>, Maktab<b>dan</b></i> qo'shimchalarini rus tilida Padejlar va Predloglar bajaradi. Rus tilida jami <b>6 ta padej</b> bor.</p>"
        },
        {
          icon: "📍",
          title: "Предложный падеж (O'rin-payt)",
          content: "<p><b>Где?</b> (Qayerda?) savoliga javob beradi va 'В' (ichida) yoki 'На' (ustida) predloglari bilan keladi. So'z oxiriga asosan <b>-Е</b> qo'shiladi.</p><ul><li>Школа ➔ Я <b>в школЕ</b> (Men maktabdaman)</li><li>Ташкент ➔ Он живет <b>в ТашкентЕ</b> (U Toshkentda yashaydi)</li><li>Работа ➔ Мы <b>на работЕ</b> (Biz ishdami)</li></ul>"
        },
        {
          icon: "🎯",
          title: "Винительный падеж (Tushum)",
          content: "<p><b>Кого? Что? Куда?</b> (Kimni? Nimani? Qayerga?) savoliga javob beradi.</p><p><i>Qoida (Qiz bola jinsi uchun):</i> 'А' harfi <b>У</b> ga, 'Я' harfi esa <b>Ю</b> ga aylanadi.</p><ul><li>Я люблю <b>мамУ</b> (Men onamni sevaman).</li><li>Я читаю <b>книгУ</b> (Men kitobni o'qiyapman).</li><li>Я иду в <b>школУ</b> (Men maktabga ketyapman).</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Men restoranda ovqatlanayapman. To'g'ri tarjimani toping:",
          options: ["Я кушаю в ресторан", "Я кушаю в ресторану", "Я кушаю в ресторане", "Я кушаю на ресторан"],
          correct: 2,
          explanation: "Qayerda? (Где?) savoliga Предложный падеж javob beradi va so'z oxiri '-Е' ga o'zgaradi: В ресторане."
        }
      ]
    },
    6: {
      id: 6,
      title: "Fe'llar (Глаголы)",
      type: "language",
      slides: [
        {
          icon: "🏃",
          title: "Fe'lning noaniq shakli (Инфинитив)",
          content: "<p>Lug'atlardagi barcha ruscha fe'llar asosan <b>-ТЬ</b> bilan tugaydi (O'zbek tilidagi -moq kabi).<br/><i>Masalan: Читать (O'qimoq), Работать (Ishlamoq), Писать (Yozmoq).</i></p>"
        },
        {
          icon: "🔄",
          title: "Hozirgi zamonda tuslanishi (1-guruh)",
          content: "<p>Shaxsga qarab fe'lning oxiri o'zgaradi (Читать - O'qimoq fe'li misolida):</p><ul><li><b>Я</b> чита<b>ю</b> (Men o'qiyapman)</li><li><b>Ты</b> чита<b>ешь</b> (Sen o'qiyapsan)</li><li><b>Он/Она</b> чита<b>ет</b> (U o'qiyapti)</li><li><b>Мы</b> чита<b>ем</b> (Biz o'qiyapmiz)</li><li><b>Вы</b> чита<b>ете</b> (Siz o'qiyapsiz)</li><li><b>Они</b> чита<b>ют</b> (Ular o'qiyapti)</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "'Работать' (Ishlamoq) fe'lini 'Ular' (Они) olmoshi uchun qanday tuslaysiz?",
          options: ["Они работает", "Они работаю", "Они работают", "Они работаем"],
          correct: 2,
          explanation: "1-guruh fe'llarida 'Они' (Ular) shaxsi uchun qo'shimcha doim -ЮТ yoki -УТ bo'ladi: Они работают."
        }
      ]
    },
    7: {
      id: 7,
      title: "Sonlar (Числа)",
      type: "language",
      slides: [
        {
          icon: "1️⃣",
          title: "0 dan 10 gacha",
          content: "<p>0-Ноль, 1-Один, 2-Два, 3-Три, 4-Четыре, 5-Пять, 6-Шесть, 7-Семь, 8-Восемь, 9-Девять, 10-Десять.</p>"
        },
        {
          icon: "📈",
          title: "11 dan 19 gacha (O'smirlar)",
          content: "<p>Buning siri oson: Asosiy sonning orqasiga <b>-надцать</b> qo'shiladi.<br/>Один<b>надцать</b> (11), Две<b>надцать</b> (12), Три<b>надцать</b> (13), Пят<b>надцать</b> (15)...</p>"
        },
        {
          icon: "💯",
          title: "O'nliklar va Yuzliklar",
          content: "<p>O'nliklar asosan -дцать yoki -десят bilan tugaydi: Двадцать (20), Тридцать (30), Сорок (40 - istisno), Пятьдесят (50).</p><p>Yuzliklar: Сто (100), Двести (200), Триста (300), Пятьсот (500).</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Rus tilida '55' raqami qanday aytiladi?",
          options: ["Пятьдесят пять", "Пятьнадцать пять", "Пятьдесят и пять", "Пять пятьдесят"],
          correct: 0,
          explanation: "O'nlik (Пятьдесят - 50) va birlik (пять - 5) yonma-yon qo'yiladi. O'rtasiga 'va' (и) qo'shilmaydi."
        }
      ]
    },

    // ----------------------------------------
    // SUHBAT BO'LIMI
    // ----------------------------------------
    8: {
      id: 8,
      title: "Tanishish (Знакомство)",
      type: "language",
      slides: [
        {
          icon: "🤝",
          title: "Ism so'rash va aytish",
          content: "<p><b>Как вас зовут?</b> - Ismingiz nima? (Sizlab)<br/><b>Как тебя зовут?</b> - Isming nima? (Senlab)<br/>Javob: <b>Меня зовут...</b> (Mening ismim...)</p><p><b>Очень приятно!</b> - Tanishganimdan xursandman!</p>"
        },
        {
          icon: "🌍",
          title: "Qayerdansiz va Yosh",
          content: "<p><b>Откуда вы?</b> - Siz qayerdansiz?<br/><b>Я из Узбекистана.</b> - Men O'zbekistondanman.</p><p><b>Сколько вам лет?</b> - Yoshingiz nechada?<br/><b>Мне 25 лет.</b> - Men 25 yoshdaman. (Diqqat: Я 25 лет дейилмайди! Мне - Menga deb ishlatiladi).</p>"
        }
      ],
      quizQuestions: [
        {
          question: "O'z yoshingizni rus tilida qanday qilib to'g'ri aytasiz?",
          options: ["Я 20 лет", "Мой возраст 20", "Мне 20 лет", "У меня 20 лет"],
          correct: 2,
          explanation: "Rus tilida yosh doimo 'Мне' (Menga) olmoshi orqali aytiladi. Со'зма-сo'з: Menga 20 yosh bo'ldi."
        }
      ]
    },
    9: {
      id: 9,
      title: "Yo'l so'rash (Ориентация в городе)",
      type: "language",
      slides: [
        {
          icon: "🗺️",
          title: "Manzilni topish",
          content: "<p>Ko'chada begona joyni qidirayotganda ishlatiladigan eng muhim iboralar:</p><ul><li><b>Извините, где находится метро?</b> - Kechirasiz, metro qayerda joylashgan?</li><li><b>Как дойти до аптеки?</b> - Dorixonagacha qanday borsam bo'ladi?</li><li><b>Это далеко отсюда?</b> - Bu yerdan uzoqmi?</li></ul>"
        },
        {
          icon: "🧭",
          title: "Yo'nalishlar (Направления)",
          content: "<ul><li><b>Идите прямо</b> - To'g'riga yuring.</li><li><b>Поверните направо</b> - O'ngga buriling.</li><li><b>Поверните налево</b> - Chapga buriling.</li><li><b>Перейдите дорогу</b> - Yo'lning u betiga o'ting.</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Sizga 'Поверните налево, а затем идите прямо' deyishdi. Siz qayoqqa yurishingiz kerak?",
          options: ["O'ngga burilib, to'xtash", "To'g'riga yurib, chapga burilish", "Chapga burilib, keyin to'g'riga yurish", "Orqaga qaytish"],
          correct: 2,
          explanation: "Налево - chapga, Прямо - to'g'riga degani."
        }
      ]
    },
    10: {
      id: 10,
      title: "Do'konda (В магазине)",
      type: "language",
      slides: [
        {
          icon: "🛒",
          title: "Narx va Xarid",
          content: "<p><b>Сколько это стоит?</b> - Bu qancha turadi?<br/><b>Я хочу купить...</b> - Men ... sotib olmoqchiman.<br/><b>Покажите мне, пожалуйста, это.</b> - Iltimos, menga shuni ko'rsating.</p>"
        },
        {
          icon: "👕",
          title: "Kiyim kechak va O'lcham",
          content: "<p><b>Можно примерить?</b> - Kiyib ko'rsam bo'ladimi?<br/><b>Где примерочная?</b> - Kiyinib ko'rish xonasi qayerda?<br/><b>У вас есть размер побольше/поменьше?</b> - Sizda kattaroq/kichikroq o'lchami bormi?</p>"
        },
        {
          icon: "💳",
          title: "To'lov",
          content: "<p><b>Можно оплатить картой?</b> - Karta orqali to'lasam bo'ladimi?<br/><b>Только наличные.</b> - Faqat наqd pul.<br/><b>Возьмите сдачу.</b> - Qaytiminizni oling.</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Kiyim do'konida yoqqan kiyimni kiyib ko'rmoqchisiz. Qanday ruxsat so'raysiz?",
          options: ["Сколько это стоит?", "Можно оплатить?", "Можно примерить?", "Дайте мне это."],
          correct: 2,
          explanation: "Примерить - o'lchab (kiyib) ko'rmoq degani. Можно примерить? - Kiyib ko'rsam bo'ladimi?"
        }
      ]
    },
    11: {
      id: 11,
      title: "Mehmonxona (В гостинице)",
      type: "language",
      slides: [
        {
          icon: "🏨",
          title: "Joy band qilish (Бронирование)",
          content: "<p><b>Здравствуйте! У меня забронирован номер.</b> - Assalomu alaykum! Menda xona band qilingan.<br/><b>На чьё имя?</b> - Kimning nomiga?<br/><b>Есть ли свободные номера?</b> - Bo'sh xonalar bormi?</p>"
        },
        {
          icon: "🛏️",
          title: "Xona turlari va Xizmatlar",
          content: "<p><b>Одноместный номер</b> - Bir kishilik xona.<br/><b>Двухместный номер</b> - Ikki kishilik xona.<br/><b>Завтрак включён в стоимость?</b> - Nonushta narxning ichidami?<br/><b>Во сколько выезд (чек-аут)?</b> - Mehmonxonadan chiqish soat nechada?</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Siz ertalabki ovqat pul ichidami yoki yo'qmi bilmoqchisiz. Qanday so'raysiz?",
          options: ["Где ресторан?", "Сколько стоит обед?", "Завтрак включён в стоимость?", "У вас есть номер?"],
          correct: 2,
          explanation: "Завтрак - Nonushta. Включён в стоимость - narxga kiritilganmi? degan ma'noni beradi."
        }
      ]
    },

    // ----------------------------------------
    // BIZNES BO'LIMI
    // ----------------------------------------
    12: {
      id: 12,
      title: "Ish muloqoti (Собеседование)",
      type: "language",
      slides: [
        {
          icon: "💼",
          title: "Ishga joylashish (Трудоустройство)",
          content: "<p>Ish qidirayotganda va suhbatda (собеседование) sizga kerak bo'ladigan iboralar:</p><ul><li><b>Я ищу работу.</b> - Men ish qidiryapman.</li><li><b>У меня есть высшее образование.</b> - Menda oliy ma'lumot bor.</li><li><b>Мой опыт работы составляет 3 года.</b> - Mening ish tajribam 3 yilni tashkil etadi.</li></ul>"
        },
        {
          icon: "📊",
          title: "Shartlar",
          content: "<ul><li><b>Какая будет зарплата?</b> - Oylik maosh qancha bo'ladi?</li><li><b>Какой график работы?</b> - Ish grafigi qanday?</li><li><b>Полная занятость / Частичная занятость</b> - To'liq ish kuni / Yarim stavka.</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Suhbatdosh sizdan 'Какой у вас опыт работы?' deb so'radi. U nimani bilmoqchi?",
          options: ["Sizning oylik maoshingizni", "Sizning ma'lumotingizni", "Sizning yoshingizni", "Sizning ish tajribangizni"],
          correct: 3,
          explanation: "Опыт работы - o'zbek tiliga 'Ish tajribasi' deb tarjima qilinadi."
        }
      ]
    },
    13: {
      id: 13,
      title: "Hujjatlar bilan ishlash (Документы)",
      type: "language",
      slides: [
        {
          icon: "📁",
          title: "Asosiy hujjatlar",
          content: "<p>Rossiyada yoki rusiyzabon kompaniyalarda hujjatlar bilan ishlash tez-tez uchraydi:</p><ul><li><b>Паспорт</b> - Pasport</li><li><b>Договор / Контракт</b> - Shartnoma</li><li><b>Заявление</b> - Ariza</li><li><b>Справка</b> - Ma'lumotnoma</li></ul>"
        },
        {
          icon: "🖊️",
          title: "Harakatlar",
          content: "<ul><li><b>Заполните эту анкету.</b> - Ushbu anketani to'ldiring.</li><li><b>Поставьте подпись здесь.</b> - Shu yerga imzo qo'ying.</li><li><b>Нужна печать.</b> - Muhr kerak.</li><li><b>Сделайте ксерокопию.</b> - Kserokopiya (nusxa) qiling.</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Sizdan ariza yozishni so'rashdi. Rus tilida 'Ariza' nima deyiladi?",
          options: ["Договор", "Справка", "Заявление", "Анкета"],
          correct: 2,
          explanation: "Заявление - o'zbek tilida Ariza degan ma'noni bildiradi."
        }
      ]
    },
    14: {
      id: 14,
      title: "TORFL (ТРКИ - Imtihonga tayyorgarlik)",
      type: "language",
      slides: [
        {
          icon: "🎓",
          title: "ТРКИ nima?",
          content: "<p><b>ТРКИ</b> (Тест по русскому языку как иностранному) yoki inglizcha <b>TORFL</b> — bu rus tilini xorijiy til sifatida bilish darajasini aniqlovchi xalqaro rasmiy davlat imtihonidir (Xuddi IELTS kabi).</p>"
        },
        {
          icon: "📝",
          title: "Imtihon qismlari (Субтесты)",
          content: "<p>Imtihon 5 ta qismdan iborat bo'lib, har biridan kamida 66% olish kerak:</p><ol><li><b>Лексика. Грамматика</b> (Lug'at va Grammatika)</li><li><b>Чтение</b> (O'qish va matnni tushunish)</li><li><b>Аудирование</b> (Tinglab tushunish)</li><li><b>Письмо</b> (Xat yoki insho yozish)</li><li><b>Говорение</b> (Gapirish, monolog va dialog)</li></ol>"
        },
        {
          icon: "📈",
          title: "Darajalar",
          content: "<p>Rossiya universitetlariga kirish uchun odatda B1 (1-daraja), magistratura va mutaxassislik uchun esa B2 (2-daraja) talab qilinadi.</p><ul><li><b>А1, А2</b> - Boshlang'ich va Asosiy</li><li><b>В1 (ТРКИ-1)</b> - Birinchi daraja</li><li><b>В2 (ТРКИ-2)</b> - Ikkinchi daraja</li><li><b>С1, С2</b> - Erkin so'zlashish</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "TORFL (ТРКИ) imtihonining 'Tinglab tushunish' (Listening) qismi rus tilida nima deb ataladi?",
          options: ["Чтение", "Говорение", "Письмо", "Аудирование"],
          correct: 3,
          explanation: "Аудирование - (Audio so'zidan olingan) eshitib tushunish qobiliyatini tekshiruvchi bo'limdir."
        }
      ]
    }
  }, // RUS TILI KURSI TUGADI
  // ==========================================
  // 7 - FRANSUZ TILI KURSI (courseId: 7)
  // ==========================================
  7: {
    // ----------------------------------------
    // ASOSLAR
    // ----------------------------------------
    1: {
      id: 1,
      title: "Fransuz alifbosi va o'qish qoidalari",
      type: "language",
      slides: [
        {
          icon: "🔤",
          title: "Lotin alifbosi, lekin...",
          content: "<p>Fransuz alifbosi ham ingliz tili kabi <b>26 ta harfdan</b> iborat. Lekin ularning talaffuzi va o'qilish qoidalari butunlay boshqacha. Eng asosiy qoida: <b>So'z oxiridagi undosh harflar (s, t, d, p, x, z) asosan o'qilmaydi!</b></p>"
        },
        {
          icon: "👄",
          title: "Burun tovushlari",
          content: "<p>Fransuz tilining go'zalligi uning burun (nazal) tovushlaridadir. Agar unli harfdan keyin 'n' yoki 'm' kelsa, ular burundan aytiladi:</p><ul><li><b>un</b> (in) - un</li><li><b>bon</b> (yaxshi) - bon</li><li><b>vin</b> (vino) - van</li></ul>"
        },
        {
          icon: "✨",
          title: "Urg'u belgilari (Accents)",
          content: "<p>Harflar ustida maxsus belgilar keladi va ular o'qilishni o'zgartiradi:</p><ul><li><b>é (Accent aigu)</b> - o'zbekchadagi sof 'e' kabi o'qiladi (Masalan: <i>café</i>)</li><li><b>è (Accent grave)</b> - cho'ziqroq 'e' (Masalan: <i>mère</i> - ona)</li><li><b>ç (Cédille)</b> - 'c' harfi 'k' emas, doim 's' o'qilishi uchun qo'yiladi (Masalan: <i>garçon</i> - bola).</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Fransuz tilining eng asosiy o'qish qoidalaridan biri qaysi?",
          options: ["Hamma harflar yozilganidek o'qiladi", "So'z oxiridagi undosh harflar odatda o'qilmaydi", "So'z boshidagi harflar tushirib qoldiriladi", "Burun tovushlari umuman ishlatilmaydi"],
          correct: 1,
          explanation: "Fransuz tilida so'z oxirida keladigan s, t, d kabi undoshlar asosan talaffuz qilinmaydi (Masalan: Paris - 'Pari' o'qiladi)."
        }
      ]
    },
    2: {
      id: 2,
      title: "Bonjour! (Salomlashish va murojaat)",
      type: "language",
      slides: [
        {
          icon: "🥖",
          title: "Asosiy salomlashish",
          content: "<p>Fransuzlarda salomlashish juda muhim odat:</p><ul><li><b>Bonjour</b> (Bonjur) - Assalomu alaykum / Xayrli tong / Xayrli kun</li><li><b>Salut</b> (Salyu) - Salom (Faqat yaqin do'stlar orasida)</li><li><b>Bonsoir</b> (Bonsuar) - Xayrli kech</li></ul>"
        },
        {
          icon: "🎩",
          title: "Hurmat bilan murojaat",
          content: "<p>Fransuzlar notanish odamlarga har doim unvon bilan murojaat qilishadi:</p><ul><li><b>Monsieur</b> (Mosyo) - Janob</li><li><b>Madame</b> (Madam) - Xonim (Turmush qurgan yoki yoshi katta ayol)</li><li><b>Mademoiselle</b> (Mademuazel) - Qiz bola (Turmushga chiqmagan)</li></ul><p><i>Misol: Bonjour, Monsieur!</i></p>"
        },
        {
          icon: "🗣️",
          title: "Ahvol so'rash",
          content: "<p>Ahvol so'rashning eng mashhur va oson usuli:</p><ul><li><b>Comment ça va?</b> (Komon sa va?) - Qalaysiz? Ishlar qalay?</li><li>Javob: <b>Ça va bien, merci!</b> (Sa va byen, mersi) - Yaxshi, rahmat!</li><li><b>Et vous?</b> (E vu?) - O'zingizchi? (Sizlab)</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Ko'chada notanish erkak kishidan yo'l so'ramoqchisiz. Unga qanday murojaat qilasiz?",
          options: ["Salut, garçon!", "Bonjour, Madame!", "Bonjour, Monsieur!", "Ça va?"],
          correct: 2,
          explanation: "Erkak kishiga hurmat bilan murojaat qilish uchun 'Monsieur' (Janob) so'zi ishlatiladi."
        }
      ]
    },
    3: {
      id: 3,
      title: "Sonlar (Les nombres)",
      type: "language",
      slides: [
        {
          icon: "1️⃣",
          title: "1 dan 10 gacha",
          content: "<p>0 - Zéro (Zero), 1 - Un (An), 2 - Deux (Dyo), 3 - Trois (Trua), 4 - Quatre (Katr), 5 - Cinq (Sank), 6 - Six (Sis), 7 - Sept (Set), 8 - Huit (Uit), 9 - Neuf (Nyof), 10 - Dix (Dis).</p>"
        },
        {
          icon: "🔟",
          title: "O'nliklar va Murakkab sonlar",
          content: "<p>20 - Vingt (Van)<br/>30 - Trente (Trant)<br/>40 - Quarante (Karant)<br/>50 - Cinquante (Sankant)<br/>60 - Soixante (Suasant)</p>"
        },
        {
          icon: "🤯",
          title: "70, 80 va 90 mo'jizasi",
          content: "<p>Fransuz tilida 70, 80, 90 sonlari o'ziga xos matematik usulda aytiladi!</p><ul><li><b>70 = 60 + 10</b> (Soixante-dix)</li><li><b>80 = 4 x 20</b> (Quatre-vingts)</li><li><b>90 = 4 x 20 + 10</b> (Quatre-vingt-dix)</li></ul><p>Shuning uchun 99 raqami: 4x20+10+9 (Quatre-vingt-dix-neuf) bo'ladi!</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Fransuz tilida '80' raqami qanday tuzilgan?",
          options: ["Huitante (Sakkizta o'n)", "Quatre-vingts (To'rtta yigirma)", "Soixante-vingt (Oltmish va yigirma)", "Septante-dix (Yetmish va o'n)"],
          correct: 1,
          explanation: "Fransuzlar 80 raqamini Quatre-vingts (4 ta 20 lik) deb ataydilar."
        }
      ]
    },
    4: {
      id: 4,
      title: "Ranglar (Les couleurs)",
      type: "language",
      slides: [
        {
          icon: "🎨",
          title: "Asosiy ranglar",
          content: "<ul><li><b>Rouge</b> (Ruj) - Qizil</li><li><b>Bleu</b> (Blyo) - Ko'k</li><li><b>Vert</b> (Ver) - Yashil</li><li><b>Jaune</b> (Jon) - Sariq</li><li><b>Noir</b> (Nuar) - Qora</li><li><b>Blanc</b> (Blan) - Oq</li></ul>"
        },
        {
          icon: "👗",
          title: "Jinsga moslashish",
          content: "<p>Fransuz tilida ranglar (sifatlar) otning jinsiga moslashadi. Qiz bola (Jenskiy) rodidagi so'zlar uchun rang oxiriga <b>-e</b> qo'shiladi.</p><ul><li>Un stylo vert (Yashil ruchka - Muzhskoy)</li><li>Une pomme vert<b>e</b> (Yashil olma - Jenskiy)</li><li>Un chat noir (Qora mushuk) ➔ Une robe noir<b>e</b> (Qora ko'ylak)</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "'Blanc' (Oq) rangini qiz bola (Jenskiy) rodidagi otga qanday moslashtiramiz?",
          options: ["Blanco", "Blanca", "Blanche", "Blanc"],
          correct: 2,
          explanation: "Blanc so'zi qiz bola rodida maxsus shaklga: Blanche (Blansh) ga o'zgaradi."
        }
      ]
    },

    // ----------------------------------------
    // GRAMMATIKA
    // ----------------------------------------
    5: {
      id: 5,
      title: "Artikllar (Les articles)",
      type: "language",
      slides: [
        {
          icon: "📌",
          title: "Nega artikl kerak?",
          content: "<p>Fransuz tilida otlar yolg'iz o'zi ishlatilmaydi, ularning oldida doim <b>Artikl</b> bo'lishi shart. Artikl otning <b>Muzhskoy</b> yoki <b>Jenskiy</b> rodda ekanligini hamda <b>Birlik</b> yoki <b>Ko'plik</b>da ekanligini ko'rsatadi.</p>"
        },
        {
          icon: "🔍",
          title: "Noaniq artikllar (Un, Une, Des)",
          content: "<p>Ingliz tilidagi 'a/an' ga o'xshaydi. Predmet bizga notanish bo'lganda ishlatiladi.</p><ul><li><b>Un</b> - Muzhskoy rod, birlik (Un garçon - qandaydir bola)</li><li><b>Une</b> - Jenskiy rod, birlik (Une fille - qandaydir qiz)</li><li><b>Des</b> - Ko'plik, jinsning qizig'i yo'q (Des livres - qandaydir kitoblar)</li></ul>"
        },
        {
          icon: "🎯",
          title: "Aniqlik artikllari (Le, La, Les)",
          content: "<p>Ingliz tilidagi 'the' ga o'xshaydi. Aniq, biz bilgan predmetlar uchun:</p><ul><li><b>Le</b> - Muzhskoy rod (Le père - Ota)</li><li><b>La</b> - Jenskiy rod (La mère - Ona)</li><li><b>L'</b> - Agar so'z unli harf bilan boshlansa, Le/La qisqaradi (L'école - Maktab)</li><li><b>Les</b> - Ko'plik (Les amis - Do'stlar)</li></ul>"
        }
      ],
      quizQuestions: [
        {
          question: "Agar so'z unli (A, E, I, O, U) harf bilan boshlansa va biz Aniq artikl ishlatmoqchi bo'lsak qaysi shaklni tanlaymiz?",
          options: ["Le", "La", "L'", "Les"],
          correct: 2,
          explanation: "Unli harf oldida Le va La artikllari qisqarib L' ga aylanadi (Masalan: l'ami - do'st)."
        }
      ]
    },
    6: {
      id: 6,
      title: "Être va Avoir (Eng muhim fe'llar)",
      type: "language",
      slides: [
        {
          icon: "👑",
          title: "Fransuz tilining shohlari",
          content: "<p>Fransuz tilida ikkita eng ko'p ishlatiladigan va barcha zamonlarni yasashda yordam beradigan fe'l bor:<br/>1. <b>Être</b> (Etr) - Bo'lmoq (Inglizchadagi to be)<br/>2. <b>Avoir</b> (Avuar) - Bor bo'lmoq (Inglizchadagi to have)</p>"
        },
        {
          icon: "👤",
          title: "Être - Bo'lmoq tuslanishi",
          content: "<p>Je suis (Menman)<br/>Tu es (Sensan)<br/>Il/Elle est (U)<br/>Nous sommes (Bizmiz)<br/>Vous êtes (Sizsiz)<br/>Ils/Elles sont (Ulardir)</p><p><i>Misol: Je suis étudiant. (Men talabaman).</i></p>"
        },
        {
          icon: "🤲",
          title: "Avoir - Bor bo'lmoq tuslanishi",
          content: "<p>J'ai (Menda bor)<br/>Tu as (Senda bor)<br/>Il/Elle a (Unda bor)<br/>Nous avons (Bizda bor)<br/>Vous avez (Sizda bor)<br/>Ils/Elles ont (Ularda bor)</p><p><i>Misol: J'ai un chat. (Menda bitta mushuk bor). Yoshni aytishda ham avoir ishlatiladi: J'ai 20 ans (Men 20 yoshdaman).</i></p>"
        }
      ],
      quizQuestions: [
        {
          question: "Fransuz tilida o'z yoshingizni aytish uchun qaysi fe'ldan foydalanasiz?",
          options: ["Être (Men ... yoshman)", "Avoir (Menda ... yosh bor)", "Parler (Men ... yosh gapiraman)", "Aller (Men ... yosh boraman)"],
          correct: 1,
          explanation: "Fransuzlar yoshni aytishda doim Avoir (Bor bo'lmoq) fe'lini ishlatadilar: 'J'ai 25 ans' (Menda 25 yosh bor)."
        }
      ]
    },
    7: {
      id: 7,
      title: "Présent (Hozirgi zamon)",
      type: "language",
      slides: [
        {
          icon: "⏳",
          title: "Fe'llarning guruhlari",
          content: "<p>Fransuz tilida fe'llar oxirgi harflariga qarab 3 guruhga bo'linadi:<br/>1. <b>-ER</b> bilan tugaydiganlar (eng ko'p, qoidaviy)<br/>2. <b>-IR</b> bilan tugaydiganlar<br/>3. <b>-RE</b>, <b>-OIR</b> bilan tugaydigan (noto'g'ri) fe'llar.</p>"
        },
        {
          icon: "🗣️",
          title: "1-Guruh: -ER fe'llari (Parler - Gapirmoq)",
          content: "<p>Hozirgi zamonda tuslash uchun fe'lning oxiridagi -er olib tashlanadi va quyidagi qo'shimchalar qo'shiladi:<br/>Je parl<b>e</b> (Men gapiryapman)<br/>Tu parl<b>es</b><br/>Il/Elle parl<b>e</b><br/>Nous parl<b>ons</b><br/>Vous parl<b>ez</b><br/>Ils/Elles parl<b>ent</b> (-ent hech qachon o'qilmaydi!)</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Qoidaviy -ER bilan tugaydigan fe'llarning ko'plik (Ils/Elles) shaklidagi -ent qo'shimchasi qanday o'qiladi?",
          options: ["'an' deb burundan", "'ent' deb to'liq", "O'qilmaydi (jim)", "'e' deb qisqa"],
          correct: 2,
          explanation: "Fransuz tilida fe'llarni tuslaganda 3-shaxs ko'plikdagi -ent qo'shimchasi YAZILADI, lekin HECH QACHON o'qilmaydi."
        }
      ]
    },
    8: {
      id: 8,
      title: "Sifatlar (Les adjectifs)",
      type: "language",
      slides: [
        {
          icon: "🌟",
          title: "Sifatlarning joylashuvi",
          content: "<p>Ingliz tilidan farqli o'laroq, fransuz tilida <b>sifatlar asosan otdan (predmetdan) KEYIN keladi!</b></p><p>Masalan:<br/>Un livre <b>intéressant</b> (Qiziqarli kitob)<br/>Une voiture <b>rapide</b> (Tezkor mashina)</p>"
        },
        {
          icon: "⚠️",
          title: "Istisnolar (BAGS qoidasi)",
          content: "<p>Faqatgina juda ko'p ishlatiladigan, qisqa sifatlar otdan OLDIN keladi. Buni BAGS qoidasi orqali eslab qolish oson:<br/><b>B</b>eauty (Go'zallik: beau, joli)<br/><b>A</b>ge (Yosh: jeune, vieux, nouveau)<br/><b>G</b>oodness (Yaxshilik: bon, mauvais)<br/><b>S</b>ize (Hajm: petit, grand)</p><p><i>Un petit garçon</i> (Kichkina bola - oldin keldi).</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Qaysi turdagi sifatlar fransuz tilida otdan OLDIN keladi?",
          options: ["Rangni bildiruvchi sifatlar", "Hamma sifatlar", "Millatni bildiruvchi sifatlar", "Go'zallik, yosh, yaxshilik va hajmni bildiruvchi qisqa sifatlar (BAGS)"],
          correct: 3,
          explanation: "Asosiy qoidaga ko'ra sifatlar otdan keyin keladi, faqat BAGS guruhiga kiruvchi eng ko'p ishlatiladigan sifatlar oldin keladi."
        }
      ]
    },

    // ----------------------------------------
    // SUHBAT
    // ----------------------------------------
    9: {
      id: 9,
      title: "Tanishish va Ism so'rash",
      type: "language",
      slides: [
        {
          icon: "🤝",
          title: "Ism so'rash",
          content: "<p><b>Comment vous appelez-vous?</b> - Ismingiz nima? (Rasmiy, sizlab)<br/><b>Comment t'appelles-tu?</b> - Isming nima? (Senlab)<br/>Javob: <b>Je m'appelle...</b> - Mening ismim...</p>"
        },
        {
          icon: "🌍",
          title: "Qayerdansiz?",
          content: "<p><b>D'où venez-vous?</b> - Siz qayerdansiz?<br/><b>Je viens d'Ouzbékistan.</b> - Men O'zbekistondanman.<br/><b>Enchanté(e)!</b> - Tanishganimdan xursandman!</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Siz fransuz kishisi bilan tanishdingiz. 'Tanishganimdan xursandman' deyish uchun nima deysiz?",
          options: ["Bonjour", "Merci", "Enchanté", "Comment ça va"],
          correct: 2,
          explanation: "Enchanté - inglizchadagi 'Nice to meet you' ma'nosini beradi va tanishuvda ishlatiladi."
        }
      ]
    },
    10: {
      id: 10,
      title: "Yo'l so'rash (Les directions)",
      type: "language",
      slides: [
        {
          icon: "🗺️",
          title: "Manzilni topish",
          content: "<p><b>Excusez-moi, où est la Tour Eiffel?</b> - Kechirasiz, Eyfel minorasi qayerda?<br/><b>Où se trouve le métro?</b> - Metro qayerda joylashgan?</p>"
        },
        {
          icon: "🧭",
          title: "Yo'nalish ko'rsatish",
          content: "<p><b>Allez tout droit.</b> - To'g'riga yuring.<br/><b>Tournez à gauche.</b> - Chapga buriling.<br/><b>Tournez à droite.</b> - O'ngga buriling.<br/><b>C'est à côté de...</b> - ...ning yonida.</p>"
        }
      ],
      quizQuestions: [
        {
          question: "'Tournez à gauche' qanday ma'noni anglatadi?",
          options: ["O'ngga buriling", "Chapga buriling", "To'g'riga yuring", "To'xtang"],
          correct: 1,
          explanation: "Gauche - chap, Droite - o'ng degani."
        }
      ]
    },
    11: {
      id: 11,
      title: "Restoranda (Au restaurant)",
      type: "language",
      slides: [
        {
          icon: "🍽️",
          title: "Buyurtma berish",
          content: "<p>Fransuzlar hech qachon \"Menga bering\" demaydi, ular muloyimlik bilan \"Men xohlardim\" deyishadi:<br/><b>Je voudrais un café, s'il vous plaît.</b> - Men qahva xohlagan edim, iltimos.<br/><b>Avez-vous le menu?</b> - Menyu bormi?</p>"
        },
        {
          icon: "💵",
          title: "Hisobni so'rash",
          content: "<p>Ovqatlanib bo'lgach eng muhim ibora:<br/><b>L'addition, s'il vous plaît!</b> - Hisobni keltiring, iltimos!<br/><b>C'est délicieux!</b> - Bu juda mazali!</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Restoranda buyurtma berishda eng muloyim va to'g'ri boshlanish qaysi?",
          options: ["Donnez-moi... (Menga bering)", "Je veux... (Men xohlayman)", "Je voudrais... (Men xohlardim)", "Apportez... (Keltiring)"],
          correct: 2,
          explanation: "'Je voudrais' (Men xohlagan edim) restoranda xizmat ko'rsatuvchiga hurmat bilan murojaat qilishning yagona to'g'ri yo'lidir."
        }
      ]
    },

    // ----------------------------------------
    // MADANIYAT
    // ----------------------------------------
    12: {
      id: 12,
      title: "Fransiya va Parij haqida",
      type: "language",
      slides: [
        {
          icon: "🇫🇷",
          title: "Fransiya ramzlari",
          content: "<p>Fransiyaning poytaxti <b>Parij</b>. U \"Nur shahri\" (La Ville Lumière) deb ataladi. Asosiy ramzlari: Eyfel minorasi (La Tour Eiffel), Luvr muzeyi (Le Louvre) va Sena daryosi (La Seine).</p>"
        },
        {
          icon: "🏛️",
          title: "Tarixiy fakt",
          content: "<p>1789-yildagi Fransuz inqilobining shiori butun dunyoga ma'lum: <b>Liberté, Égalité, Fraternité</b> (Erkinlik, Tenglik, Birodarlik). Bu so'zlar har bir Fransiya tangasi va davlat binolarida yozilgan.</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Fransiya davlatining rasmiy shiori nima?",
          options: ["Kamon va Qilich", "Erkinlik, Tenglik, Birodarlik", "Kuch birlikda", "Tarix va Madaniyat"],
          correct: 1,
          explanation: "Liberté, Égalité, Fraternité - Fransuz Respublikasining asosiy va rasmiy shiori hisoblanadi."
        }
      ]
    },
    13: {
      id: 13,
      title: "Fransuz oshxonasi (Gastronomie)",
      type: "language",
      slides: [
        {
          icon: "🥐",
          title: "Nonushta va Non",
          content: "<p>Fransuzlar uchun <b>Baguette</b> (uzun fransuz noni) va <b>Croissant</b> (kruassan) muqaddasdir. Ular odatda ertalab qahvaga botirib yeyiladi.</p>"
        },
        {
          icon: "🧀",
          title: "Pishloq va Vino",
          content: "<p>Fransiyada yilning har bir kuni uchun alohida turdagi <b>Fromage</b> (Pishloq) mavjud (400 dan ortiq turlari bor!). Shuningdek, ular <b>Escargot</b> (shilliqqurt) va <b>Cuisses de grenouille</b> (qurbaqa oyoqlari) kabi delikateslari bilan ham mashhur.</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Fransuz madaniyatida deyarli har bir taom bilan tortiladigan mashhur uzun non nima deb ataladi?",
          options: ["Croissant", "Baguette", "Fromage", "Macaron"],
          correct: 1,
          explanation: "Baguette - Fransuzlarning sevimli va mashhur kundalik noni."
        }
      ]
    },
    14: {
      id: 14,
      title: "DELF / DALF Imtihonlari",
      type: "language",
      slides: [
        {
          icon: "📜",
          title: "DELF nima?",
          content: "<p>Ingliz tilida IELTS bo'lganidek, Fransuz tilini chet tili sifatida bilishni isbotlovchi yagona xalqaro davlat diplomi bu <b>DELF</b> (Diplôme d'Études en Langue Française) dir.</p>"
        },
        {
          icon: "📈",
          title: "Darajalar",
          content: "<p>Imtihon umrbod beriladi (IELTS kabi 2 yilda kuymaydi!). U quyidagi darajalarga bo'linadi:<br/>DELF A1 va A2 (Boshlang'ich)<br/>DELF B1 va B2 (Mustaqil - Universitetlarga kirish uchun yetarli)<br/>DALF C1 va C2 (Professional).</p>"
        }
      ],
      quizQuestions: [
        {
          question: "Fransuz tilini bilish darajasini aniqlovchi rasmiy davlat imtihoni va diplomi nima deb ataladi?",
          options: ["IELTS", "TORFL", "DELF/DALF", "TEF"],
          correct: 2,
          explanation: "Fransiya ta'lim vazirligi tomonidan beriladigan rasmiy diplom bu DELF (va yuqori darajalar uchun DALF) hisoblanadi."
        }
      ]
    }
  },// FRANSUZ TILI KURSI TUGADI
  // ==========================================
  // 8 - HTML5 VA ZAMONAVIY VEB (courseId: 8)
  // ==========================================
  8: {
    // ----------------------------------------
    // 1-DARS: HTML5 nima?
    // ----------------------------------------
    1: {
      id: 1,
      title: "HTML5 nima va uning afzalliklari",
      type: "programming",
      slides: [
        {
          icon: "🚀",
          title: "Vebning yangi davri",
          content: "<p><b>HTML5</b> — bu HTML ning eng so'nggi va eng mukammal versiyasidir. U nafaqat sahifa tuzilishini, balki qidiruv tizimlari (Google) uchun saytni tushunarli qilishni, video/audio pleyerlarni o'zida jamlashni va mobil qurilmalarga yaxshi moslashishni ta'minlaydi.</p>"
        },
        {
          icon: "📄",
          title: "DOCTYPE e'loni",
          content: "<p>Eski HTML versiyalarida sahifa qolipi (DOCTYPE) juda uzun va murakkab edi. HTML5 da esa u juda qisqa va aniq: <b>&lt;!DOCTYPE html&gt;</b>. Bu brauzerga \"Men eng zamonaviy HTML ishlatyapman\" degan ishorani beradi.</p>",
          code: "<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>HTML5 Sahifa</title>\n</head>\n<body>\n  <h1>Salom, HTML5!</h1>\n</body>\n</html>",
          language: "html"
        }
      ],
      task: {
        description: "Mukammal HTML5 qolipini yarating.",
        requirements: [
          "<!DOCTYPE html> orqali hujjat turini HTML5 qilib belgilang",
          "<html> tegiga lang=\"uz\" atributini qo'shing",
          "<head> ichida <meta charset=\"UTF-8\"> ni yozing (bu barcha tillardagi harflarni, jumladan o'zbekcha o', g' larni to'g'ri o'qish uchun kerak)"
        ],
        hints: ["Meta teglar yopilmaydi."],
        mustInclude: ["<!DOCTYPE html>", "<html>", "<head>", "<meta>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "Brauzerga sahifa aynan HTML5 versiyasida yozilganini bildirish uchun hujjatning eng tepasida qaysi teg yoziladi?",
          options: ["<html version=\"5\">", "<!DOCTYPE html>", "<?xml version=\"1.0\">", "<meta type=\"html5\">"],
          correct: 1,
          explanation: "<!DOCTYPE html> e'loni barcha zamonaviy brauzerlarga hujjatni HTML5 standartida o'qishni buyuradi."
        }
      ]
    },

    // ----------------------------------------
    // 2-DARS: Semantik teglar
    // ----------------------------------------
    2: {
      id: 2,
      title: "Semantik teglar (Tog'ri arxitektura)",
      type: "programming",
      slides: [
        {
          icon: "🏗️",
          title: "Semantika nima?",
          content: "<p>Eskidan saytning barcha qismlari <b>&lt;div&gt;</b> (quti) yordamida yasalardi. Lekin Google qaysi div menyu, qaysi biri maqola ekanini tushunmas edi. <b>Semantik teglar</b> — o'z nomida ma'no tashiydigan va sayt arxitekturasini tushunarli qiladigan teglardir.</p>"
        },
        {
          icon: "🧭",
          title: "Asosiy qismlar",
          content: "<p>Saytni to'g'ri bo'laklash uchun quyidagi teglardan foydalanamiz:</p><ul><li><b>&lt;header&gt;</b> - Bosh qism (Logotip va menyu)</li><li><b>&lt;nav&gt;</b> - Navigatsiya (Linklar ro'yxati)</li><li><b>&lt;main&gt;</b> - Asosiy takrorlanmas kontent</li><li><b>&lt;article&gt;</b> - Mustaqil maqola yoki yangilik</li><li><b>&lt;footer&gt;</b> - Pastki qism (Mualliflik huquqi)</li></ul>",
          code: "<header>\n  <nav>\n    <a href=\"/\">Bosh sahifa</a>\n  </nav>\n</header>\n<main>\n  <article>\n    <h2>Bugungi yangiliklar</h2>\n    <p>HTML5 juda zo'r...</p>\n  </article>\n</main>\n<footer>&copy; 2026 Uzbekas</footer>",
          language: "html"
        }
      ],
      task: {
        description: "Semantik teglardan foydalanib blog sahifasi strukturasini yarating.",
        requirements: [
          "<header> ichida <h1> sarlavha yozing",
          "<main> ichida <article> oching va uning ichiga bitta <p> matn yozing",
          "Sayt oxirida <footer> yarating"
        ],
        hints: ["Bu teglar vizual jihatdan hech narsani o'zgartirmaydi (xuddi div kabi ishlaydi), lekin qidiruv tizimlari (SEO) uchun juda muhim."],
        mustInclude: ["<header>", "<h1>", "<main>", "<article>", "<p>", "<footer>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "Saytdagi asosiy menyu linklari (Navigatsiya) qaysi semantik teg ichiga o'ralishi kerak?",
          options: ["<menu>", "<header>", "<nav>", "<links>"],
          correct: 2,
          explanation: "<nav> (navigation) tegi aynan sayt bo'ylab harakatlanish havolalarini o'z ichiga olish uchun mo'ljallangan."
        }
      ]
    },

    // ----------------------------------------
    // 3-DARS: Zamonaviy Formalar
    // ----------------------------------------
    3: {
      id: 3,
      title: "Zamonaviy Formalar (HTML5 Inputs)",
      type: "programming",
      slides: [
        {
          icon: "📝",
          title: "Yangi Input turlari",
          content: "<p>HTML5 gacha biz asosan <i>type=\"text\"</i> yoki <i>password</i> ishlatardik. HTML5 da telefonlarda qulay klaviaturalar ochilishi va avtomatik tekshirish uchun yangi turlar qo'shildi.</p>"
        },
        {
          icon: "📅",
          title: "Eng kerakli turlar",
          content: "<ul><li><b>type=\"email\"</b> - Faqat elektron pochta formatini qabul qiladi.</li><li><b>type=\"number\"</b> - Faqat raqam yozish mumkin (kamaytirish/ko'paytirish tugmalari chiqadi).</li><li><b>type=\"date\"</b> - Chiroyli kalendar (Data picker) ochib beradi.</li><li><b>type=\"color\"</b> - Rang tanlash oynasini ochadi.</li></ul>",
          code: "<form>\n  <label>Tug'ilgan kuningiz:</label>\n  <input type=\"date\">\n  <br>\n  <label>Sevimli rangingiz:</label>\n  <input type=\"color\">\n  <br>\n  <button type=\"submit\">Yuborish</button>\n</form>",
          language: "html"
        }
      ],
      task: {
        description: "Foydalanuvchidan tug'ilgan sanasi va emailini so'raydigan zamonaviy forma yasang.",
        requirements: [
          "<form> yarating",
          "Email kiritish uchun type=\"email\" va required atributli input qo'shing",
          "Tug'ilgan sana uchun type=\"date\" li input qo'shing",
          "Yuborish uchun <button> qo'shing"
        ],
        hints: ["required atributi orqali brauzerning o'zi email xato yozilganini tekshirib (validatsiya qilib) beradi."],
        mustInclude: ["<form>", "<button>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "Foydalanuvchiga sana (yil, oy, kun) tanlash uchun maxsus kalendar interfeysini ochib beruvchi input turi qaysi?",
          options: ["type=\"calendar\"", "type=\"time\"", "type=\"datetime\"", "type=\"date\""],
          correct: 3,
          explanation: "type=\"date\" zamonaviy brauzerlarda va mobil telefonlarda qulay kalendar (Date picker) ochib beradi."
        }
      ]
    },

    // ----------------------------------------
    // 4-DARS: Audio va Video
    // ----------------------------------------
    4: {
      id: 4,
      title: "Multimedia (Audio va Video)",
      type: "programming",
      slides: [
        {
          icon: "🎬",
          title: "Pleyerlarsiz multimedia",
          content: "<p>Oldin saytga video qo'yish uchun Flash kabi qo'shimcha dasturlar kerak edi. HTML5 orqali <b>&lt;video&gt;</b> va <b>&lt;audio&gt;</b> teglari yordamida to'g'ridan-to'g'ri fayllarni o'qitish mumkin.</p>"
        },
        {
          icon: "⚙️",
          title: "Boshqaruv atributlari",
          content: "<p>Multimedia teglari ko'rinishi va ishlashi uchun maxsus atributlar kerak:</p><ul><li><b>controls</b> - Pleyer tugmalarini (Play, Pause, Ovoz) ko'rsatadi.</li><li><b>autoplay</b> - Sahifa ochilganda o'z-o'zidan boshlanadi.</li><li><b>loop</b> - Tugagach, yana boshidan qaytaradi.</li><li><b>muted</b> - Ovozni o'chirib qo'yadi.</li></ul>",
          code: "<video src=\"dars.mp4\" width=\"500\" controls poster=\"rasm.jpg\">\n  Sizning brauzeringiz videoni qo'llab-quvvatlamaydi.\n</video>\n\n<audio src=\"musiqa.mp3\" controls loop></audio>",
          language: "html"
        }
      ],
      task: {
        description: "Sahifaga avtomatik qayta-qayta takrorlanadigan audio pleyer joylang.",
        requirements: [
          "<audio> tegini yarating",
          "src atributiga 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' ni bering",
          "Foydalanuvchi ko'rishi uchun 'controls' atributini bering",
          "Musiqa tugagach o'zidan o'zi qaytadan boshlanishi uchun 'loop' atributini qo'shing"
        ],
        hints: ["Atributlarni ketma-ket, probel bilan yozib ketaverasiz (Masalan: <audio src=\"...\" controls loop>)."],
        mustInclude: ["<audio>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "Video yoki audioni tugagandan so'ng yana boshidan avtomatik ravishda boshlash uchun qaysi atribut ishlatiladi?",
          options: ["autoplay", "repeat", "loop", "restart"],
          correct: 2,
          explanation: "loop atributi multimedia faylini cheksiz marta takrorlanishiga (aylanib ishlashiga) xizmat qiladi."
        }
      ]
    },

    // ----------------------------------------
    // 5-DARS: Canvas Asoslari
    // ----------------------------------------
    5: {
      id: 5,
      title: "Grafika va Chizish (<canvas>)",
      type: "programming",
      slides: [
        {
          icon: "🖌️",
          title: "Canvas nima?",
          content: "<p><b>&lt;canvas&gt;</b> (Matoh / Polotno) — bu HTML5 ning eng katta yangiliklaridan biri. Bu teg sahifada bo'sh oyna ajratib beradi va siz JavaScript yordamida uning ichiga turli xil shakllar, grafiklar yoki hatto o'yinlar chizishingiz mumkin.</p>"
        },
        {
          icon: "📐",
          title: "Qanday ishlaydi?",
          content: "<p>HTML da faqat &lt;canvas&gt; tegining o'zi (ID va o'lcham bilan) yoziladi. Ichiga chizish ishlari esa JS da bajariladi.</p>",
          code: "\n<canvas id=\"meningCanvasim\" width=\"200\" height=\"100\" style=\"border:1px solid #000;\"></canvas>\n\n\n<script>\n  var c = document.getElementById(\"meningCanvasim\");\n  var ctx = c.getContext(\"2d\");\n  ctx.fillStyle = \"#FF0000\";\n  ctx.fillRect(0, 0, 150, 75); // Qizil to'rtburchak chizish\n</script>",
          language: "html"
        }
      ],
      task: {
        description: "Sahifada qora hoshiyaga ega bo'sh Canvas hududini yarating.",
        requirements: [
          "<canvas> tegini yarating",
          "Kengligini (width) 300, balandligini (height) 200 qilib bering",
          "Ko'rinib turishi uchun style=\"border: 2px solid black;\" atributini bering"
        ],
        hints: ["Canvas juft teg, uni </canvas> bilan yopish esdan chiqmasin."],
        mustInclude: ["<canvas>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "<canvas> tegi ichida bevosita shakllar va animatsiyalar chizish uchun qaysi texnologiya (til) qo'llaniladi?",
          options: ["CSS", "PHP", "JavaScript", "Python"],
          correct: 2,
          explanation: "<canvas> shunchaki bo'sh quti (konteyner) yaratadi, uning ichiga haqiqiy chizish ishlari doim JavaScript yordamida bajariladi."
        }
      ]
    },

    // ----------------------------------------
    // 6-DARS: Iframe va Xaritalar
    // ----------------------------------------
    6: {
      id: 6,
      title: "Iframe (YouTube va Google Maps)",
      type: "programming",
      slides: [
        {
          icon: "🪟",
          title: "Oyna ichida oyna",
          content: "<p><b>&lt;iframe&gt;</b> — bu o'z saytingiz ichida mutlaqo boshqa bir saytni (yoki uning bir qismini) oyna qilib ochib beruvchi HTML tegidir.</p>"
        },
        {
          icon: "🗺️",
          title: "Xarita va Videolar ulash",
          content: "<p>Bugungi kunda har bir biznes saytida ularning manzilini ko'rsatuvchi Google xaritasi (Maps) va YouTube videolari mavjud. Ular aynan iframe yordamida oson joylashtiriladi.</p>",
          code: "\n<iframe src=\"https://uz.wikipedia.org\" width=\"100%\" height=\"300\"></iframe>\n\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/dQw4w9WgXcQ\" allowfullscreen></iframe>",
          language: "html"
        }
      ],
      task: {
        description: "Sahifaga 400x300 o'lchamli Wikipedia saytini oyna qilib oching.",
        requirements: [
          "Bitta <iframe> yarating",
          "src atributiga 'https://uz.wikipedia.org' ni bering",
          "width ni 400, height ni 300 qilib bering"
        ],
        hints: ["Iframe juft teg, ya'ni uni albatta </iframe> qilib yopish kerak."],
        mustInclude: ["<iframe>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "YouTube videosini o'z saytingizga to'g'ridan-to'g'ri joylashtirish (embed qilish) uchun qaysi HTML tegidan foydalaniladi?",
          options: ["<video>", "<youtube>", "<embed>", "<iframe>"],
          correct: 3,
          explanation: "YouTube, Google Maps va boshqa ko'plab platformalar o'z xizmatlarini boshqa saytlarga joylash uchun standart <iframe> kodini taqdim etishadi."
        }
      ]
    },

    // ----------------------------------------
    // 7-DARS: Yakuniy Loyiha
    // ----------------------------------------
    7: {
      id: 7,
      title: "Yakuniy Loyiha (Semantik Landing Page)",
      type: "programming",
      slides: [
        {
          icon: "🏆",
          title: "HTML5 Maestrosi",
          content: "<p>Siz HTML5 kursini ajoyib tarzda yakunladingiz! Endi siz saytni shunchaki ko'rinishini emas, uning mantiqiy arxitekturasini (Semantika) to'g'ri qurishni bilasiz.</p>"
        },
        {
          icon: "🚀",
          title: "So'nggi vazifa",
          content: "<p>O'rgangan barcha bilimlarimizni birlashtirib, zamonaviy 'Landing Page' (Bosh sahifa) qolipini yaratamiz. Bunga header, main, video va zamonaviy forma kiradi.</p>",
          code: "\n<header> Sarlavha </header>\n<main>\n  <section> \n     <video controls></video> \n  </section>\n  <section> \n     <form> ... </form> \n  </section>\n</main>\n<footer> Mualliflik </footer>",
          language: "html"
        }
      ],
      task: {
        description: "Zamonaviy sahifa strukturasini noldan sementik teglar bilan tuzing.",
        requirements: [
          "<header> ichida sayt nomini (<h1>) yozing",
          "<main> ichida <form> ochib, bitta 'email' va 'date' kiritish maydonini (input) joylang",
          "Pastda <footer> orqali yilni yozib qo'ying"
        ],
        hints: ["Eng muhimi HTML5 qoidalari: barcha qismlarni mantiqiy semantik teglarga o'rang."],
        mustInclude: ["<header>", "<h1>", "<main>", "<form>", "<footer>"],
        starterCode: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Mening Loyiham</title>\n</head>\n<body>\n\n  \n\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "HTML5 ning eng katta afzalliklaridan biri nima?",
          options: [
            "CSS ishlatish shart emasligida", 
            "Faqat kompyuterlarda ishlashida", 
            "Semantik teglar orqali qidiruv tizimlari (SEO) ga tushunarliligida va multimediani qo'llab-quvvatlashida", 
            "JavaScriptni mutlaqo taqiqlashida"
          ],
          correct: 2,
          explanation: "HTML5 arxitekturasi va yangi teglari saytlarni Google qidiruv tizimlarida yuqoriga chiqishiga va plaginlarsiz video/audio ko'rishga katta yordam beradi."
        }
      ]
    },
// ----------------------------------------
    // 8-DARS: Web Storage (Xotira)
    // ----------------------------------------
    8: {
      id: 8,
      title: "Web Storage (Brauzer xotirasi)",
      type: "programming",
      slides: [
        {
          icon: "💾",
          title: "Cookies o'rniga zamonaviy usul",
          content: "<p>HTML5 da ma'lumotlarni brauzerda saqlash uchun <b>Web Storage API</b> taqdim etilgan. U eski <i>Cookies</i> ga qaraganda xavfsizroq va ancha ko'proq ma'lumot saqlay oladi.</p>"
        },
        {
          icon: "📦",
          title: "Local va Session Storage",
          content: "<p>Ikki xil xotira bor:<br/>1. <b>localStorage</b> - ma'lumot brauzer yopilganda ham saqlanib qoladi (yillab turishi mumkin).<br/>2. <b>sessionStorage</b> - ma'lumot faqat brauzer tab'i (oynasi) ochiq turgunicha saqlanadi, yopilsa o'chib ketadi.</p>",
          code: "// Ma'lumot saqlash\nlocalStorage.setItem('ism', 'Ali');\n\n// Ma'lumotni o'qib olish\nlet user = localStorage.getItem('ism');\nconsole.log(user); // 'Ali'\n\n// Ma'lumotni o'chirish\nlocalStorage.removeItem('ism');",
          language: "javascript"
        }
      ],
      task: {
        description: "Foydalanuvchi ismini LocalStorage ga saqlab, uni ekranga chiqaring.",
        requirements: [
          "JavaScript orqali localStorage.setItem yordamida 'username' kaliti bilan o'z ismingizni saqlang",
          "Uni localStorage.getItem orqali o'qib oling",
          "O'qib olingan ismni console.log() ga chiqaring"
        ],
        hints: ["LocalStorage faqat matn (String) ko'rinishidagi ma'lumotlarni saqlaydi."],
        mustInclude: [],
        starterCode: "// LocalStorage bilan ishlang\n\n\n"
      },
      quizQuestions: [
        {
          question: "Kompyuter (yoki brauzer) o'chib yonganda ham o'chib ketmaydigan doimiy xotira qaysi?",
          options: ["sessionStorage", "cookies", "localStorage", "tempStorage"],
          correct: 2,
          explanation: "localStorage ma'lumotlarni foydalanuvchi o'zi tozalamaguncha cheksiz muddatga saqlab qoladi."
        }
      ]
    },

    // ----------------------------------------
    // 9-DARS: Geolocation API
    // ----------------------------------------
    9: {
      id: 9,
      title: "Geolocation (Joylashuvni aniqlash)",
      type: "programming",
      slides: [
        {
          icon: "📍",
          title: "Siz qayerdasiz?",
          content: "<p>HTML5 ning <b>Geolocation API</b> si foydalanuvchining geografik joylashuvini (kenglik va uzunlik) aniqlash imkonini beradi. Bu xaritalar va yetkazib berish xizmatlari uchun juda muhim.</p>"
        },
        {
          icon: "🔒",
          title: "Maxfiylik va Ruxsat",
          content: "<p>Foydalanuvchi xavfsizligi uchun brauzer har doim \"Bu sayt sizning joylashuvingizni bilmoqchi, ruxsat berasizmi?\" deb so'raydi.</p>",
          code: "if (navigator.geolocation) {\n  navigator.geolocation.getCurrentPosition(function(position) {\n    console.log(\"Kenglik (Lat): \" + position.coords.latitude);\n    console.log(\"Uzunlik (Lon): \" + position.coords.longitude);\n  });\n} else {\n  console.log(\"Brauzeringiz Geolocation'ni qo'llab-quvvatlamaydi.\");\n}",
          language: "javascript"
        }
      ],
      task: {
        description: "Foydalanuvchi koordinatalarini aniqlovchi kod yozing.",
        requirements: [
          "navigator.geolocation.getCurrentPosition() funksiyasini chaqiring",
          "Funksiya ichiga kelgan (position) argumentidan latitude va longitude ni oling",
          "Ularni konsolga chiqaring"
        ],
        hints: ["Bu kod ishlashi uchun brauzer ruxsat so'raydi, ruxsat berishni unutmang."],
        mustInclude: [],
        starterCode: "// Joylashuvni aniqlash kodini yozing\n\n\n"
      },
      quizQuestions: [
        {
          question: "HTML5 da foydalanuvchi joylashuvini aniqlash uchun qaysi maxsus obyektdan foydalaniladi?",
          options: ["window.location", "document.map", "navigator.geolocation", "browser.gps"],
          correct: 2,
          explanation: "navigator.geolocation obyekti geografik joylashuvni aniqlash uchun HTML5 da maxsus yaratilgan API hisoblanadi."
        }
      ]
    },

    // ----------------------------------------
    // 10-DARS: Drag and Drop
    // ----------------------------------------
    10: {
      id: 10,
      title: "Drag and Drop (Suirov va Tashlash)",
      type: "programming",
      slides: [
        {
          icon: "🖱️",
          title: "Suirovchi elementlar",
          content: "<p>HTML5 da har qanday elementni sichqoncha bilan bosib, sudrab (drag) boshqa joyga tashlash (drop) mumkin. Buning uchun eng avvalo elementga <b>draggable=\"true\"</b> atributini berish kerak.</p>"
        },
        {
          icon: "⚡",
          title: "Hodisalar (Events)",
          content: "<p>Sudrash jarayoni bir nechta JavaScript hodisalari orqali boshqariladi:</p><ul><li><b>ondragstart</b> - Sudrash boshlanganda</li><li><b>ondragover</b> - Element boshqa hudud ustidan o'tganda</li><li><b>ondrop</b> - Element tashlanganda</li></ul>",
          code: "\n<img id=\"rasm\" src=\"logo.png\" draggable=\"true\" ondragstart=\"drag(event)\">\n\n\n<div id=\"quti\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\"\n     style=\"width:200px; height:200px; border:1px solid black;\">\n</div>",
          language: "html"
        }
      ],
      task: {
        description: "HTML elementni sudraladigan (draggable) qilib o'zgartiring.",
        requirements: [
          "Bitta <div> yoki <img> yarating",
          "Unga draggable=\"true\" atributini qo'shing",
          "id=\"meningElementim\" deb nom bering"
        ],
        hints: ["JavaScript qismini yozishingiz shart emas, shunchaki HTML ni to'g'rilang."],
        mustInclude: ["<div>", "<img>"],
        starterCode: "\n<div>Meni sudrab ko'ring</div>\n"
      },
      quizQuestions: [
        {
          question: "Qaysi HTML atributi elementni sichqoncha bilan sudrash mumkin (draggable) holatga keltiradi?",
          options: ["drag-enabled=\"true\"", "draggable=\"true\"", "move=\"allow\"", "drop=\"yes\""],
          correct: 1,
          explanation: "draggable=\"true\" atributi elementning sudrab ketilishiga ruxsat beradi."
        }
      ]
    },

    // ----------------------------------------
    // 11-DARS: SVG Grafika
    // ----------------------------------------
    11: {
      id: 11,
      title: "SVG (Vektor Grafika)",
      type: "programming",
      slides: [
        {
          icon: "📐",
          title: "SVG nima?",
          content: "<p><b>SVG</b> (Scalable Vector Graphics) — bu HTML ichiga to'g'ridan-to'g'ri chiziladigan vektor grafika. JPEG yoki PNG rasmlar yaqinlashtirilganda sifati buzilsa (piksellashsa), SVG rasmlar matematik hisoblanganligi uchun <b>hech qachon sifatini yo'qotmaydi</b>.</p>"
        },
        {
          icon: "✍️",
          title: "HTML ichida chizish",
          content: "<p>SVG kodlari to'g'ridan-to'g'ri HTML ichiga yoziladi. Uning ichida aylanalar, to'rtburchaklar va chiziqlar yozuv orqali yaratiladi.</p>",
          code: "\n<svg width=\"100\" height=\"100\">\n  \n  <circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"red\" />\n</svg>\n\n",
          language: "html"
        }
      ],
      task: {
        description: "SVG yordamida ko'k rangli to'rtburchak chizing.",
        requirements: [
          "<svg> tegini oching va width/height bering",
          "Ichiga <rect> tegini yozing",
          "<rect> ga width=\"100\" height=\"50\" va fill=\"blue\" atributlarini bering"
        ],
        hints: ["To'rtburchak chizish uchun <circle> o'rniga <rect> (rectangle) ishlatiladi."],
        mustInclude: ["<svg>", "<rect>"],
        starterCode: "\n\n"
      },
      quizQuestions: [
        {
          question: "SVG formatining JPEG va PNG formatlaridan eng katta ustunligi nimada?",
          options: ["Hajmi kattaligida", "Qora-oq rangda bo'lishida", "Kattalashtirilganda (Zoom) sifati umuman buzilmasligida", "Faqat Safari brauzerida ishlashida"],
          correct: 2,
          explanation: "SVG rasm piksellardan emas, matematik vektorlardan tuzilgani uchun xohlagancha kattalashtirilsa ham tinniq turadi."
        }
      ]
    },

    // ----------------------------------------
    // 12-DARS: Web Workers
    // ----------------------------------------
    12: {
      id: 12,
      title: "Web Workers (Orqa fondagi jarayonlar)",
      type: "programming",
      slides: [
        {
          icon: "⚙️",
          title: "Sekinlashuv muammosi",
          content: "<p>JavaScript doim bitta oqimda (Single Thread) ishlaydi. Agar saytda juda og'ir matematik hisob-kitob bajarilsa, sayt to'liq qotib qoladi (tugmalar bosilmaydi). Buni hal qilish uchun HTML5 da <b>Web Workers</b> kashf qilingan.</p>"
        },
        {
          icon: "🚀",
          title: "Yashirin yordamchilar",
          content: "<p>Web Worker — bu orqa fonda, sayt interfeysiga aralashmagan holda ishlaydigan mustaqil JavaScript fayli. U asosiy saytni qotirib qo'ymaydi.</p>",
          code: "// Asosiy faylda ishchini (worker) ishga tushirish\nif (window.Worker) {\n  const ishchi = new Worker(\"ogir_hisob.js\");\n\n  // Ishchidan kelgan xabarni kutib olish\n  ishchi.onmessage = function(e) {\n    console.log(\"Javob keldi: \" + e.data);\n  };\n}",
          language: "javascript"
        }
      ],
      task: {
        description: "Yangi Web Worker obyektini yarating.",
        requirements: [
          "'myWorker' nomli o'zgaruvchi ochib, unga new Worker('worker.js') qiymatini bering",
          "console.log da 'Worker muvaffaqiyatli ishga tushdi' deb yozing"
        ],
        hints: ["Faqat obyektni yaratishning o'zi kifoya."],
        mustInclude: [],
        starterCode: "if (window.Worker) {\n  // Shu yerda Worker yarating\n  \n\n}\n"
      },
      quizQuestions: [
        {
          question: "Web Worker larning asosiy vazifasi nima?",
          options: [
            "Sayt dizaynini chiroyli qilish", 
            "Foydalanuvchi parollarini saqlash", 
            "Og'ir hisob-kitoblarni UI (ekran) ni qotirib qo'ymaslik uchun orqa fonda bajarish", 
            "Serverdan rasmlarni tezroq yuklash"
          ],
          correct: 2,
          explanation: "Web Worker JavaScriptdagi qotib qolish muammosini hal qilib, qiyin ishlarni saytdan tashqarida, fonda bajarishga imkon beradi."
        }
      ]
    },

    // ----------------------------------------
    // 13-DARS: Yakuniy Amaliyot (Zamonaviy Web)
    // ----------------------------------------
    13: {
      id: 13,
      title: "Yakuniy Loyiha: To'liq HTML5 Ilovasi",
      type: "programming",
      slides: [
        {
          icon: "🏆",
          title: "Siz HTML5 Masterisiz!",
          content: "<p>Semantika, LocalStorage, Geolocation, SVG, Video/Audio... Bu bilimlarning barchasi sizni oddiy 'kod yozuvchi' emas, zamonaviy 'Web Muhandisi'ga aylantiradi!</p>"
        },
        {
          icon: "🧩",
          title: "Loyihani birlashtiramiz",
          content: "<p>Yakuniy loyihada biz semantik qolip ichida foydalanuvchining ma'lumotlarini qabul qiluvchi forma, vektorli rasm (SVG) va brauzer xotirasi (Storage) tushunchalarini namoyish qiluvchi kod yozamiz.</p>",
          code: "<header>\n  <h1>Mening HTML5 Ilovam</h1>\n</header>\n<main>\n  <section id=\"joylashuv\"></section>\n  <video src=\"dars.mp4\" controls></video>\n  <svg width=\"50\" height=\"50\">\n    <circle cx=\"25\" cy=\"25\" r=\"20\" fill=\"green\" />\n  </svg>\n</main>",
          language: "html"
        }
      ],
      task: {
        description: "HTML5 ning eng yangi teglari ishtirokida sahifa qolipini yarating.",
        requirements: [
          "<header> ichida <h1> sarlavha yarating",
          "<main> ichida <video controls> tegini qoldiring",
          "<main> ichida 20x20 o'lchamli to'rtburchak (<rect>) chizilgan <svg> yarating"
        ],
        hints: ["Barcha ishlarni semantic teglar ichida tartibli bajaring."],
        mustInclude: ["<header>", "<h1>", "<main>", "<video>", "<rect>", "<svg>"],
        starterCode: "<!DOCTYPE html>\n<html>\n<body>\n  \n\n</body>\n</html>"
      },
      quizQuestions: [
        {
          question: "HTML, CSS va JavaScript texnologiyalarida HTML5 ning roli nimada?",
          options: [
            "Faqat dizaynni chiroyli qiladi", 
            "Faqat ma'lumotlar bazasi bilan ishlaydi", 
            "Saytning zamonaviy suyak-strukturasini tuzadi va yangi brauzer API'lari bilan JS ga yo'l ochadi", 
            "Eskirgan brauzerlarni o'chirib tashlaydi"
          ],
          correct: 2,
          explanation: "HTML5 saytning poydevori hisoblanib, nafaqat struktura beradi, balki Geolocation, Storage, Canvas kabi yangiliklari bilan JS ga ulkan imkoniyatlar yaratadi."
        }
      ]
    }
  } // HTML5 KURSI TUGADI
};