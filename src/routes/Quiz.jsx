import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { doc, getDoc, setDoc, increment, updateDoc } from "firebase/firestore";
import { giveReward } from "../utils/rewardSystem";
import { db } from "../firebase/config";
import { useLang } from "../context/useLang";
import {
  LuBrain, 
  LuTrophy, 
  LuRefreshCw, 
  LuChevronRight, 
  LuFlame, 
  LuGlobe, 
  LuPalette, 
  LuZap, 
  LuAtom, 
  LuLanguages, 
LuInfo,
  LuTimer,
 LuCheck,
  LuSettings, 
LuX
,
  LuTarget
} from "react-icons/lu";
import { completeRealTask } from "../utils/taskManager";

const TIMER              = 20;
const QUESTIONS_PER_QUIZ = 10;
const GEMINI_API_KEY     = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL         = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const DIFF_ORDER = ["Oson", "O'rta", "Qiyin"];

const CATEGORY_CONFIG = {
  HTML:       { icon: <LuGlobe size={32} />, color: "orange" },
  CSS:        { icon: <LuPalette size={32} />, color: "purple" },
  JavaScript: { icon: <LuZap size={32} />, color: "yellow" },
  React:      { icon: <LuAtom size={32} />, color: "cyan" },
  English:    { icon: <LuLanguages size={32} />, color: "blue" },
  Russian:    { icon: <LuLanguages size={32} />, color: "red" },
  French:     { icon: <LuLanguages size={32} />, color: "indigo" },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

const STATIC_QUESTIONS = {
  HTML: {
    Oson: [
      { q:"HTML qisqartmasi nima?", options:["HyperText Markup Language","High Text Machine Language","HyperText Machine Language","Home Tool Markup Language"], answer:0, explanation:"HTML = HyperText Markup Language." },
      { q:"Rasm qo'shish uchun qaysi teg?", options:["<image>","<img>","<src>","<pic>"], answer:1, explanation:"<img> HTML da rasm uchun." },
      { q:"Eng katta sarlavha tegi?", options:["<h6>","<h3>","<h1>","<heading>"], answer:2, explanation:"H1 eng katta sarlavha." },
      { q:"Havola uchun qaysi atribut?", options:["src","link","href","url"], answer:2, explanation:"href havolaning manzilini ko'rsatadi." },
      { q:"Tartibsiz ro'yxat tegi?", options:["<ol>","<li>","<ul>","<dl>"], answer:2, explanation:"<ul> tartiblashtirilmagan ro'yxat." },
      { q:"Paragraf tegi?", options:["<para>","<p>","<pg>","<par>"], answer:1, explanation:"<p> paragraf uchun." },
      { q:"Bo'sh element (void) qaysi?", options:["<div>","<p>","<br>","<span>"], answer:2, explanation:"<br> yopilmaydigan void element." },
      { q:"HTML da izoh yozish?", options:["// izoh","/* izoh */","<!-- izoh -->","## izoh"], answer:2, explanation:"HTML izohlar <!-- --> orasida yoziladi." },
      { q:"Jadval tegi qaysi?", options:["<tbl>","<table>","<grid>","<tab>"], answer:1, explanation:"<table> HTML jadval uchun." },
      { q:"Forma uchun qaysi teg?", options:["<input>","<field>","<form>","<data>"], answer:2, explanation:"<form> forma yaratadi." },
    ],
    "O'rta": [
      { q:"HTML5 semantik bo'lmagan element?", options:["<article>","<section>","<div>","<nav>"], answer:2, explanation:"<div> semantik ma'nosiz." },
      { q:"defer atributi qaysi tegga tegishli?", options:["<link>","<style>","<script>","<meta>"], answer:2, explanation:"defer <script> tegiga tegishli." },
      { q:"data-* atributlari nima uchun?", options:["CSS styling","Maxsus ma'lumot saqlash","Server so'rov","Validatsiya"], answer:1, explanation:"data-* maxsus ma'lumotlar saqlash uchun." },
      { q:"target='_blank' nima qiladi?", options:["Yangi tabda ochadi","Havola o'chiradi","Sahifa yangilanadi","CSS"], answer:0, explanation:"_blank yangi tabda ochadi." },
      { q:"<figure> tegi nima uchun?", options:["Jadval","Rasmga izoh","Video","Form"], answer:1, explanation:"<figure> rasmga izoh berish uchun." },
      { q:"<meta charset='UTF-8'> nima qiladi?", options:["Sarlavha","Kodlash","CSS","Favicon"], answer:1, explanation:"Belgilar kodlashini belgilaydi." },
      { q:"<header> tegi nima?", options:["Faqat sarlavha","Sahifa yoki bo'lim boshi","Footer","Navigation"], answer:1, explanation:"<header> sahifa yoki bo'limning bosh qismi." },
      { q:"<aside> tegi qayerda ishlatiladi?", options:["Asosiy kontent","Yon panel","Footer","Header"], answer:1, explanation:"<aside> asosiy kontentga aloqador yon panel." },
      { q:"autocomplete atributi qaysi elementga tegishli?", options:["<div>","<span>","<input>","<p>"], answer:2, explanation:"autocomplete input elementlari uchun ishlatiladi." },
      { q:"<main> tegi nima maqsadda?", options:["Navigation","Asosiy kontent","Footer","Header"], answer:1, explanation:"<main> sahifaning asosiy kontentini belgilaydi." },
    ],
    Qiyin: [
      { q:"Shadow DOM nima uchun?", options:["SEO","Izolyatsiya","Tezlik","Animatsiya"], answer:1, explanation:"Shadow DOM komponentlarni izolyatsiya qiladi." },
      { q:"<template> tegi qanday render bo'ladi?", options:["Ko'rinadi","Ko'rinmaydi, JS bilan","CSS bilan","Faqat print"], answer:1, explanation:"<template> JS bilan aktivlanadi." },
      { q:"preload va prefetch farqi?", options:["Farqi yo'q","preload hozirgi, prefetch keyingi","prefetch tezroq","preload faqat CSS"], answer:1, explanation:"preload hozirgi, prefetch keyingi sahifa uchun." },
      { q:"ARIA role='alert' nima uchun?", options:["Navigatsiya","Muhim xabarlarni e'lon qilish","Jadval","Form"], answer:1, explanation:"role='alert' ekran o'quvchilariga muhim o'zgarishlarni bildiradi." },
      { q:"Content Security Policy (CSP) nima qiladi?", options:["Tezlashtiradi","XSS hujumlarini oldini oladi","SEO","Cache"], answer:1, explanation:"CSP XSS va injection hujumlarini oldini oladi." },
      { q:"Web Components qanday texnologiyalardan iborat?", options:["HTML+CSS","Custom Elements+Shadow DOM+Templates","React+Vue","JS+CSS"], answer:1, explanation:"Web Components: Custom Elements, Shadow DOM va HTML Templates." },
      { q:"<slot> elementi nima uchun?", options:["CSS","Web Components da kontent joylashtirish","Form","Video"], answer:1, explanation:"<slot> Web Components da tashqaridan kontent qo'shish imkonini beradi." },
      { q:"Intersection Observer nima uchun?", options:["Click event","Element ko'rinish holatini kuzatish","Scroll blok","Animatsiya"], answer:1, explanation:"Intersection Observer element viewport bilan kesishishini kuzatadi." },
    ],
  },
  CSS: {
    Oson: [
      { q:"Matn rangi uchun CSS xususiyati?", options:["font-color","text-color","color","foreground"], answer:2, explanation:"color xususiyati matn rangini belgilaydi." },
      { q:"Fon rangi uchun CSS xususiyati?", options:["background","bg-color","background-color","back-color"], answer:2, explanation:"background-color fon rangini belgilaydi." },
      { q:"Matn o'lchamini o'zgartirish uchun?", options:["text-size","font-size","size","font-weight"], answer:1, explanation:"font-size matn hajmini belgilaydi." },
      { q:"Elementni markazga olish uchun?", options:["align:center","text-align:center","center","margin:center"], answer:1, explanation:"text-align:center matnni markazga qo'yadi." },
      { q:"Elementga chegara qo'shish uchun?", options:["outline","border","edge","line"], answer:1, explanation:"border xususiyati chegara qo'shadi." },
      { q:"Elementning kengligi uchun?", options:["size","height","width","length"], answer:2, explanation:"width elementning kengligini belgilaydi." },
      { q:"Matn qalinligi uchun?", options:["font-style","text-bold","font-weight","bold"], answer:2, explanation:"font-weight:bold matnni qalin qiladi." },
      { q:"Tashqi bo'shliq uchun CSS?", options:["padding","spacing","margin","gap"], answer:2, explanation:"margin elementning tashqi bo'shlig'ini belgilaydi." },
      { q:"Ichki bo'shliq uchun CSS?", options:["margin","gap","spacing","padding"], answer:3, explanation:"padding elementning ichki bo'shlig'ini belgilaydi." },
      { q:"Elementni yashirish uchun?", options:["display:none","visibility:hidden","opacity:0","hidden:true"], answer:0, explanation:"display:none elementni butunlay yashiradi va joy egallmaydi." },
    ],
    "O'rta": [
      { q:"Flexbox uchun display qiymati?", options:["block","flex","inline","grid"], answer:1, explanation:"display:flex flexbox konteynerini yoqadi." },
      { q:"Flex elementlarni markazga olish?", options:["align:center","justify-content:center","flex-center","margin:auto"], answer:1, explanation:"justify-content:center elementlarni gorizontal markazga qo'yadi." },
      { q:"CSS Grid uchun display qiymati?", options:["grid-layout","inline-grid","grid","flex-grid"], answer:2, explanation:"display:grid grid layout ni yoqadi." },
      { q:"CSS o'zgaruvchi e'lon qilish?", options:["$color:red","@color:red","--color:red","var-color:red"], answer:2, explanation:"CSS o'zgaruvchilar -- prefiksi bilan e'lon qilinadi." },
      { q:"CSS o'zgaruvchini ishlatish?", options:["$color","@color","var(--color)","use(--color)"], answer:2, explanation:"var() funksiyasi CSS o'zgaruvchisini ishlatadi." },
      { q:"Pseudo-klass misoli?", options:[":before","::after",":hover","::placeholder"], answer:2, explanation:":hover sichqoncha ustiga kelganda ishlaydi — pseudo-klass." },
      { q:"z-index nima qiladi?", options:["O'lchamni o'zgartiradi","Elementlar ustma-ustlik tartibini belgilaydi","Animatsiya","Rang"], answer:1, explanation:"z-index elementlarning Z o'qi bo'yicha tartibini belgilaydi." },
      { q:"position:absolute qayerga nisbatan joylashadi?", options:["Viewport","Eng yaqin position:relative ota","body","html"], answer:1, explanation:"absolute eng yaqin positioned ota elementga nisbatan joylashadi." },
      { q:"transition xususiyati nima qiladi?", options:["Animatsiya yaratadi","O'zgarishlarni silliq qiladi","Hover effekt","Transform"], answer:1, explanation:"transition xususiyat o'zgarishini silliq animatsiya qiladi." },
      { q:"@media query nima uchun?", options:["CSS import","Ekran o'lchamiga qarab stil","Font yuklash","Animatsiya"], answer:1, explanation:"@media turli ekran o'lchamlari uchun stil yozish imkonini beradi." },
    ],
    Qiyin: [
      { q:"will-change nima qiladi?", options:["Elementni o'chiradi","GPU oldindan optimizatsiya qiladi","Rang o'zgartiradi","Transition qo'shadi"], answer:1, explanation:"will-change brauzerga optimizatsiya uchun GPU ni oldindan tayyorlash imkonini beradi." },
      { q:"CSS specificity hisoblashda ID ning og'irligi?", options:["1","10","100","1000"], answer:2, explanation:"ID selektori specificity da 100 ball beradi." },
      { q:"CSS contain xususiyati nima qiladi?", options:["Import","Rendering izolyatsiyasi","Grid","Animatsiya"], answer:1, explanation:"contain xususiyati elementni rendering izolyatsiyasiga oladi, performance oshiradi." },
      { q:"CSS Houdini nima?", options:["CSS framework","CSS ni JS orqali kengaytirish API","Preprocessor","Grid sistem"], answer:1, explanation:"CSS Houdini brauzerning CSS rendering mexanizmiga kirishni ta'minlovchi API." },
      { q:"content-visibility:auto nima qiladi?", options:["Kontentni yashiradi","Ekranda ko'rinmaydigan elementlarni render qilmaydi","Animatsiya","Opacity"], answer:1, explanation:"content-visibility:auto viewport tashqarisidagi elementlarni skip qilib performance oshiradi." },
      { q:"CSS subgrid nima?", options:["Mini grid","Bolalar elementlarning ota grid track larini ishlatishi","Nested flex","CSS var"], answer:1, explanation:"subgrid bola elementlarga ota elementning grid track larini to'g'ridan ishlatish imkonini beradi." },
      { q:"@layer at-rule nima uchun?", options:["Media query","Cascade qatlamlarini boshqarish","Import","Font"], answer:1, explanation:"@layer CSS cascade qatlamlarini (layers) aniqlash va tartibini boshqarish uchun." },
      { q:"CSS :is() pseudo-klass foydasi?", options:["Hover","Bir nechta selektorni qisqartirish","Grid","Animation"], answer:1, explanation:":is() bir nechta selektorni bitta qoidaga birlashtiradi, kodni qisqartiradi." },
      { q:"mix-blend-mode nima qiladi?", options:["Gradient","Element va ota fon qo'shilish usulini belgilaydi","Shadow","Blur"], answer:1, explanation:"mix-blend-mode elementning ota bilan qanday qo'shilishini belgilaydi (multiply, screen va boshqalar)." },
      { q:"CSS scroll-snap nima uchun?", options:["Animatsiya","Scroll to'xtash nuqtalarini belgilash","Parallax","Transform"], answer:1, explanation:"scroll-snap scroll qilganda elementlar aniq pozitsiyada to'xtashini ta'minlaydi." },
    ],
  },
  JavaScript: {
    Oson: [
      { q:"Konsolga chiqarish?", options:["print()","echo()","console.log()","log()"], answer:2, explanation:"console.log() JavaScript da konsolga ma'lumot chiqarish standarti." },
      { q:"O'zgaruvchi e'lon qilish (zamonaviy)?", options:["var","v","variable","let"], answer:3, explanation:"let zamonaviy JS da o'zgaruvchi e'lon qilish uchun ishlatiladi." },
      { q:"Massiv uzunligi?", options:["array.size","array.count","array.length","array.len"], answer:2, explanation:".length xususiyati massiv elementlari sonini qaytaradi." },
      { q:"Elementni massivga qo'shish?", options:["add()","push()","append()","insert()"], answer:1, explanation:"push() massiv oxiriga yangi element qo'shadi." },
      { q:"Strict tenglik tekshirish?", options:["=","==","===","!=="], answer:2, explanation:"=== qiymat va turni birga tekshiradi." },
      { q:"Funksiya e'lon qilish?", options:["fun myFunc()","func myFunc()","function myFunc()","def myFunc()"], answer:2, explanation:"function kalit so'zi JS da funksiya e'lon qiladi." },
      { q:"If shart sintaksisi?", options:["if x > 5:","if (x > 5)","if x > 5 then","IF (x > 5)"], answer:1, explanation:"JS da if sharti qavslar ichida yoziladi." },
      { q:"Massivni iterator bilan aylantirish?", options:["array.each()","for...of","array.loop()","foreach()"], answer:1, explanation:"for...of massiv elementlarini birma-bir aylanib chiqadi." },
      { q:"String uzunligi?", options:["str.size","str.count","str.length","str.len"], answer:2, explanation:".length string belgilar sonini qaytaradi." },
      { q:"undefined va null farqi?", options:["Farqi yo'q","undefined e'lon qilinmagan, null ataylab bo'sh","null tezroq","undefined xato"], answer:1, explanation:"undefined qiymat berilmagan, null esa dasturchi tomonidan ataylab bo'sh qilingan." },
    ],
    "O'rta": [
      { q:"typeof null?", options:["null","undefined","object","string"], answer:2, explanation:"typeof null === 'object' — bu JavaScript ning tarixiy xatosi." },
      { q:"Arrow function sintaksisi?", options:["function() =>","() -> {}","() => {}","=> () {}"], answer:2, explanation:"Arrow funksiya () => {} ko'rinishida yoziladi." },
      { q:"Destructuring misoli?", options:["const {a} = obj","const a = obj","obj.get(a)","extract(obj, a)"], answer:0, explanation:"const {a} = obj destructuring orqali xususiyatni chiqaradi." },
      { q:"Spread operator nima?", options:["...","**",">>","::"], answer:0, explanation:"... spread operator massiv yoki ob'ektni yoyib yuboradi." },
      { q:"Promise nima?", options:["Sinxron kod","Asinxron operatsiya natijasini ifodalovchi ob'ekt","Callback","Event"], answer:1, explanation:"Promise kelajakda tugaydigan asinxron operatsiyani ifodalaydi." },
      { q:"async/await nima qiladi?", options:["Tezlashtiradi","Promise ni sinxron ko'rinishda yozishga imkon beradi","Event loop","Xato tutadi"], answer:1, explanation:"async/await Promise asosidagi kodni sinxron yozilgandek ko'rsatadi." },
      { q:"Array.map() nima qaytaradi?", options:["O'zgartirilgan asl massiv","Yangi massiv","Indekslar","Undefined"], answer:1, explanation:"map() yangi massiv qaytaradi, asl massiv o'zgarmaydi." },
      { q:"localStorage nima uchun?", options:["Server saqlash","Brauzerda lokal ma'lumot saqlash","Cookie","Session"], answer:1, explanation:"localStorage brauzerda doimiy ma'lumot saqlash uchun ishlatiladi." },
      { q:"Event bubbling nima?", options:["Event yaratish","Event boladan otaga ko'tarilishi","Event o'chirish","DOM"], answer:1, explanation:"Event bubbling: child elementdagi event ota elementlarga tarqaladi." },
      { q:"Closure nima?", options:["Loop","Funksiya o'z tashqi scope ga kirishuvi","Array","Class"], answer:1, explanation:"Closure funksiya o'zi yaratilgan muhitdagi o'zgaruvchilarga kira olish xususiyati." },
    ],
    Qiyin: [
      { q:"Promise.all() qachon reject?", options:["Hech qachon","Bitta reject bo'lsa","Hammasi reject bo'lsa","2 ta reject bo'lsa"], answer:1, explanation:"Promise.all() bitta ham reject bo'lsa darhol reject holga o'tadi." },
      { q:"Event Loop qanday ishlaydi?", options:["Parallel","Call Stack bo'sh bo'lganda Task Queue dan oladi","FIFO","LIFO"], answer:1, explanation:"Event Loop Call Stack bo'sh bo'lganda Task Queue dagi callbacklarni oladi va bajaradi." },
      { q:"WeakMap oddiy Map dan farqi?", options:["Tezroq","Kalitlar faqat ob'ekt, GC tozalay oladi","Katta sig'im","Async"], answer:1, explanation:"WeakMap kalit sifatida faqat ob'ekt qabul qiladi va GC tomonidan tozalanishi mumkin." },
      { q:"Generator funksiya nima?", options:["Tez funksiya","yield orqali pauza/davom qiluvchi funksiya","Async","Class"], answer:1, explanation:"Generator funksiya yield orqali bajarishni to'xtatib, qiymat qaytaradi va davom ettirish mumkin." },
      { q:"Proxy ob'ekt nima uchun?", options:["Copy","Ob'ektga kirish/o'zgartirishni ushlash","Cache","Import"], answer:1, explanation:"Proxy ob'ektga get/set kabi operatsiyalarni ushlash (intercept) uchun ishlatiladi." },
      { q:"Symbol() nima?", options:["String","Unikal va o'zgarmas primitive qiymat","Number","Object"], answer:1, explanation:"Symbol har doim unikal primitive qiymat yaratadi — ob'ekt kaliti sifatida ishlatiladi." },
      { q:"Temporal Dead Zone (TDZ) nima?", options:["let/const e'lonidan oldin foydalanib bo'lmaydigan hudud","var xatosi","Async zone","Closure"], answer:0, explanation:"TDZ — let/const hoisting bilan e'lon qilinadi, lekin kod o'sha qatorgacha ularga kira olmaydi." },
      { q:"Object.freeze() nima qiladi?", options:["Clonlaydi","Ob'ektni o'zgartirib bo'lmaydigan qiladi","Siladi","Merge"], answer:1, explanation:"Object.freeze() ob'ekt xususiyatlarini o'zgartirishni, qo'shishni va o'chirishni taqiqlaydi." },
      { q:"requestAnimationFrame nima uchun?", options:["HTTP so'rov","Animatsiyani ekran yangilanishiga sinxron qilish","Timer","Event"], answer:1, explanation:"rAF brauzerning keyingi repaint oldidan callback chaqiradi — silliq animatsiya uchun ideal." },
      { q:"Prototype chain nima?", options:["Array","Ob'ektlar meros zanjiri","Scope","Module"], answer:1, explanation:"JS da har ob'ektning prototype si bor; xususiyat topilmasa zanjir bo'ylab qidiradi." },
    ],
  },
  React: {
    Oson: [
      { q:"useState nima qaytaradi?", options:["Faqat state","Faqat setter","[state, setter]","{state, setter}"], answer:2, explanation:"useState [qiymat, o'zgartiruvchi] massivini qaytaradi." },
      { q:"JSX nima?", options:["JavaScript kutubxonasi","JavaScript ichida HTML ko'rinishidagi sintaksis","CSS framework","Node modul"], answer:1, explanation:"JSX JavaScript ichida HTML-ga o'xshash sintaksis yozishga imkon beradi." },
      { q:"Props nima?", options:["State","Komponentga tashqaridan beriladigan ma'lumotlar","Hook","Event"], answer:1, explanation:"Props ota komponentdan bola komponentga ma'lumot uzatish uchun ishlatiladi." },
      { q:"React komponent nima qaytarishi shart?", options:["String","JSX yoki null","Array","Object"], answer:1, explanation:"React komponent JSX yoki null qaytarishi kerak." },
      { q:"key prop nima uchun?", options:["Stil","React ro'yxat elementlarini identifikatsiya qilishi uchun","Event","State"], answer:1, explanation:"key React ga ro'yxat elementlarini samarali farqlashga yordam beradi." },
      { q:"useEffect qachon ishlaydi?", options:["Render oldidan","Render keyin","Faqat birinchi render","Hech qachon"], answer:1, explanation:"useEffect komponenet render bo'lgandan keyin ishlaydi." },
      { q:"React da event handler yozish?", options:["onclick={}","onClick={}","on-click={}","@click={}"], answer:1, explanation:"React da event handler lar camelCase yoziladi: onClick, onChange va h.k." },
      { q:"Conditional rendering uchun qaysi operator?", options:["if else","switch","Ternary (? :) yoki &&","for"], answer:2, explanation:"JSX ichida ternary operator yoki && bilan shartli render qilinadi." },
      { q:"Fragment nima uchun?", options:["State","Bir nechta elementni bir wrapper yaratmasdan qaytarish","Hook","CSS"], answer:1, explanation:"<></> yoki <Fragment> qo'shimcha DOM elementi yaratmasdan bir nechta elementni qaytaradi." },
      { q:"React da ro'yxat render qilish?", options:[".forEach()","for loop",".map()","while loop"], answer:2, explanation:".map() JSX ro'yxat render qilishning standart usuli." },
    ],
    "O'rta": [
      { q:"useEffect dependency array bo'sh [] bo'lsa?", options:["Har render","Faqat birinchi render (mount)","Hech qachon","State o'zgarganda"], answer:1, explanation:"Bo'sh [] dependency array useEffect ni faqat birinchi render da ishlaydi (componentDidMount)." },
      { q:"useCallback nima uchun?", options:["State saqlash","Funksiyani memoize qilish, har renderda yangi yaratmaslik","Async","Event"], answer:1, explanation:"useCallback funksiya referansini memoize qiladi — dependency o'zgarmasa yangi funksiya yaratmaydi." },
      { q:"useMemo nima uchun?", options:["State","Qimmat hisoblash natijasini memoize qilish","Ref","Effect"], answer:1, explanation:"useMemo qimmat hisoblash natijasini keshlab, dependency o'zgarmasa qayta hisoblamaydi." },
      { q:"Context API nima uchun?", options:["Routing","Global state ni prop drilling siz uzatish","Animation","API call"], answer:1, explanation:"Context API component daraxtida prop drilling siz ma'lumot uzatish uchun ishlatiladi." },
      { q:"useRef nima qaytaradi?", options:["State","{current} xususiyatli ob'ekt","Array","Funksiya"], answer:1, explanation:"useRef {current} xususiyatli ob'ekt qaytaradi, render triggersiz qiymat saqlaydi." },
      { q:"React.memo nima qiladi?", options:["State","Props o'zgarmasa komponentni qayta render qilmaydi","Hook","Routing"], answer:1, explanation:"React.memo komponentni wrapperlaydi: props o'zgarmasa qayta renderdan saqlaydi." },
      { q:"Custom hook qanday nomlanadi?", options:["hook ile boshlaydi","use bilan boshlaydi","Hook bilan boshlaydi","Istalgan nom"], answer:1, explanation:"Custom hooklar use prefiksi bilan boshlanishi shart (masalan: useUserData)." },
      { q:"Controlled va Uncontrolled component farqi?", options:["Farqi yo'q","Controlled React state bilan, Uncontrolled DOM ref bilan boshqariladi","CSS","Event"], answer:1, explanation:"Controlled component qiymati React state da, Uncontrolled esa DOM da saqlanadi." },
      { q:"React da state o'zgartirish to'g'ri usuli?", options:["state.count = 5","setState yoki useState setter ni chaqirish","this.state = {}","direct mutation"], answer:1, explanation:"State to'g'ridan o'zgartirilmaydi — setter funksiyasi chaqirilishi kerak, aks holda re-render bo'lmaydi." },
      { q:"Error Boundary nima?", options:["Try catch","JS xatolarni ushlab fallback UI ko'rsatuvchi komponent","Routing","Hook"], answer:1, explanation:"Error Boundary bola komponentlar xatolarini ushlaydi va fallback UI ko'rsatadi." },
    ],
    Qiyin: [
      { q:"React Fiber nima?", options:["CSS animatsiya","Render ni bo'laklarga ajratuvchi arxitektura","Storage","SSR"], answer:1, explanation:"Fiber React 16 dan boshlab render ishini kichik birliklarga bo'lib, ustivorlik bilan bajarish imkonini beradi." },
      { q:"Concurrent Mode nima beradi?", options:["Tezroq API","Interruptible rendering — UI ni responsive ushlab turadi","SSR","WebSockets"], answer:1, explanation:"Concurrent Mode React ga render ni to'xtatib, muhimroq yangilanishni birinchi bajarishga imkon beradi." },
      { q:"useTransition nima uchun?", options:["CSS transition","Past priority state yangilanishini belgilash","Route","Ref"], answer:1, explanation:"useTransition state yangilanishini low-priority deb belgilaydi — UI bloklanmaydi." },
      { q:"Suspense nima qiladi?", options:["Error handling","Yuklash davomida fallback UI ko'rsatadi","Route","Memo"], answer:1, explanation:"Suspense lazy komponent yoki ma'lumot yuklanayotganda fallback (loading) UI ko'rsatadi." },
      { q:"Server Components nima?", options:["API server","Serverdagi render bo'ladigan, JS bundle ga kirmaydi","SSR","WebSocket"], answer:1, explanation:"RSC (React Server Components) server da render bo'ladi va client bundle hajmini kamaytiradi." },
      { q:"Reconciliation nima?", options:["State reset","Virtual DOM farqini topib minimal DOM o'zgarishi","Routing","Cache"], answer:1, explanation:"Reconciliation React ning Virtual DOM ni real DOM bilan taqqoslab minimal o'zgarish qo'llash jarayoni." },
      { q:"forwardRef nima uchun?", options:["State","Ref ni bola komponentga uzatish","Context","Event"], answer:1, explanation:"forwardRef ota komponentdagi ref ni bola komponent DOM elementiga uzatishga imkon beradi." },
      { q:"React batching nima?", options:["Array","Bir nechta state yangilanishini bitta rerenderga birlashtirish","Async","Effect"], answer:1, explanation:"Batching bir nechta setState chaqiruvlarini birlashtirib faqat bitta re-render qiladi." },
      { q:"Hydration nima?", options:["CSS","Server HTML ga React event listener larni biriktirish","Storage","Animation"], answer:1, explanation:"Hydration server tomonidan yuborilgan static HTML ga React interaktivlik qo'shish jarayoni." },
      { q:"React Portals nima uchun?", options:["API","Komponentni DOM ierarxiyasidan tashqariga render qilish","Cache","Hook"], answer:1, explanation:"Portal modal, tooltip kabi elementlarni parent DOM dan tashqariga (masalan body ga) render qiladi." },
    ],
  },
  English: {
    Oson: [
      { q:"'I ___ a student' — to'g'ri fe'l?", options:["is","are","am","be"], answer:2, explanation:"I bilan doim 'am' ishlatiladi." },
      { q:"Ko'plikdagi 'cat' qanday yoziladi?", options:["cates","cats","catses","cat"], answer:1, explanation:"Ko'p ot yasash uchun odatda -s qo'shimchasi qo'shiladi." },
      { q:"Savol gapi to'g'ri qaysi?", options:["You are student?","Are you a student?","You student are?","Student you are?"], answer:1, explanation:"Inglizchada savol gapda yordamchi fe'l birinchi keladi." },
      { q:"'Good' so'zining antonimi?", options:["Better","Worse","Bad","Best"], answer:2, explanation:"Good ning antonimi (qarama-qarshi) bad dir." },
      { q:"Indefinite article (aniqlanmagan article)?", options:["the","an","a","Ikkalasi ham (a/an)"], answer:3, explanation:"'a' va 'an' ikkisi ham indefinite article hisoblanadi." },
      { q:"'She ___ to school every day' — to'g'ri shakl?", options:["go","goes","going","went"], answer:1, explanation:"He/she/it bilan Present Simple da fe'lga -s/-es qo'shiladi." },
      { q:"'Book' so'zining ko'pligi?", options:["Bookes","Bookies","Books","Booksie"], answer:2, explanation:"Book — books, oddiy -s qo'shimchasi." },
      { q:"'Happy' ning antonimi?", options:["Unhappy","Sad","Glad","Angry"], answer:1, explanation:"Sad — xursand emas, happy ning bevosita antonimi." },
      { q:"Ranglardan qaysi biri inglizcha to'g'ri?", options:["Redd","Bleu","Green","Yellowe"], answer:2, explanation:"Green (yashil) to'g'ri imlo." },
      { q:"'I have ___ apple' — to'g'ri article?", options:["a","an","the","—"], answer:1, explanation:"Unli bilan boshlanadigan so'z oldida 'an' ishlatiladi: an apple." },
    ],
    "O'rta": [
      { q:"Present Perfect tense shakli?", options:["I did","I have done","I was doing","I do"], answer:1, explanation:"Present Perfect = have/has + V3 (done, eaten va h.k.)." },
      { q:"Passive voice shakli (Past Simple)?", options:["was/were + V3","is + V3","had + V3","be + V2"], answer:0, explanation:"Past Simple Passive: was/were + V3 (e.g. The letter was written)." },
      { q:"'If I were you, I ___ go' — to'g'ri shakl?", options:["will","would","shall","can"], answer:1, explanation:"2-tip conditional (unreal present): If + past, would + V1." },
      { q:"Relative pronoun 'who' qaysi holda ishlatiladi?", options:["Narsalar","Odamlar","Joylar","Vaqt"], answer:1, explanation:"Who odamlarni ifodalash uchun relative pronoun sifatida ishlatiladi." },
      { q:"'She suggested ___ the meeting' — to'g'ri shakl?", options:["to postpone","postponing","postponed","postpone"], answer:1, explanation:"suggest fe'lidan keyin gerund (-ing shakl) ishlatiladi." },
      { q:"'Despite' dan keyin qaysi gap qismi?", options:["Predicate","Clause (gapcha)","Noun/gerund/pronoun","Adjective"], answer:2, explanation:"Despite dan keyin ot, gerund yoki pronoun keladi (despite the rain, despite being tired)." },
      { q:"Reported speech: 'I am happy' → She said...", options:["she is happy","she was happy","she has been happy","she were happy"], answer:1, explanation:"Reported speech da Present Simple → Past Simple ga o'tadi." },
      { q:"'Used to' nimani ifodalaydi?", options:["Hozirgi odat","O'tmishdagi odat yoki holat","Kelajak","Modal fe'l"], answer:1, explanation:"Used to o'tmishda takroran bo'lgan holat yoki odat uchun ishlatiladi." },
      { q:"Inversion misoli qaysi?", options:["She never lies","Never does she lie","She doesn't lie never","Does she lie never"], answer:1, explanation:"Inversion: Never, Seldom kabi so'z gapning boshida kelganda yordamchi fe'l subyektdan oldin keladi." },
      { q:"'The more you practice, ___ you become' — to'g'ri?", options:["the better","more better","the best","better"], answer:0, explanation:"'The more... the more/better' — qiyosiy bog'liq jumlalar shakli." },
    ],
    Qiyin: [
      { q:"Subjunctive mood misoli?", options:["I wish I was richer","I wish I were richer","I wish I am richer","I wish I will be richer"], answer:1, explanation:"Subjunctive mood da 'I' bilan ham 'were' ishlatiladi: I wish I were..." },
      { q:"'Hardly had I arrived ___ it started raining'", options:["when","than","then","that"], answer:0, explanation:"Hardly/Scarcely + Past Perfect, when + Past Simple — bu inversion struktura." },
      { q:"'By the time he arrives, I ___ the report' — to'g'ri?", options:["finish","will finish","will have finished","have finished"], answer:2, explanation:"By the time + Present kela holi uchun Future Perfect ishlatiladi." },
      { q:"Cleft sentence misoli?", options:["It was John who called","John called","Called John","Who called John"], answer:0, explanation:"Cleft sentence: 'It was... who/that' — ma'lum qismni ta'kidlash uchun." },
      { q:"'She is said ___ very talented' — to'g'ri?", options:["to be","being","is","be"], answer:0, explanation:"is said to be — reporting structure, formal uslub." },
      { q:"'The book, ___ I told you about, is here' — to'g'ri?", options:["who","which","that","what"], answer:1, explanation:"Non-defining relative clause da narsalar uchun 'which' ishlatiladi." },
      { q:"Stative verb misoli?", options:["Run","Believe","Jump","Write"], answer:1, explanation:"Stative verblar (believe, know, own) odatda progressive shakllarda ishlatilmaydi." },
      { q:"'No sooner ___ left than...' — to'g'ri?", options:["he has","had he","he had","has he"], answer:1, explanation:"No sooner + inversion: No sooner had he left than... — Past Perfect + inversion." },
      { q:"Mixed conditional misoli?", options:["If I study, I pass","If I had studied, I would have passed","If I had studied, I would pass now","If I study, I would pass"], answer:2, explanation:"Mixed: If + Past Perfect (3-tip), would + V1 (2-tip) — o'tmish sabab, hozirgi natija." },
      { q:"'It is high time you ___ a decision' — to'g'ri?", options:["make","made","will make","are making"], answer:1, explanation:"It is high time + Past Subjunctive: 'It is high time you made...' — zudlik bilan ish qilish kerakligini bildiradi." },
    ],
  },
  Russian: {
    Oson: [
      { q:"'Я ___ студент' — to'g'ri gap?", options:["есть студент","— студент (глагол опускается)","является студент","быть студент"], answer:1, explanation:"Rus tilida hozirgi zamonda 'быть' fe'li tushiriladi: Я студент." },
      { q:"'Книга' so'zining rodi?", options:["Мужской","Женский","Средний","Umumiy"], answer:1, explanation:"Книга a/я bilan tugaydigan ot — женский rod." },
      { q:"'Стол' so'zining rodi?", options:["Мужской","Женский","Средний","Umumiy"], answer:0, explanation:"Стол undosh bilan tugagan erkak ot — мужской rod." },
      { q:"Русский alfavitda nechta harf?", options:["30","32","33","35"], answer:2, explanation:"Rus alifbosida 33 ta harf bor." },
      { q:"'Я иду ___ школу' — to'g'ri predlog?", options:["в","на","к","по"], answer:0, explanation:"В + maktab kabi yopiq joy: Я иду в школу." },
      { q:"'Привет' nimani anglatadi?", options:["Xayr","Salom","Rahmat","Iltimos"], answer:1, explanation:"Привет — norasmiy salom." },
      { q:"'Один, два, три...' — bu nima?", options:["Порядковые числительные","Количественные числительные","Наречия","Прилагательные"], answer:1, explanation:"Один, два, три — количественные числительные (son miqdori)." },
      { q:"'Спасибо' nimani anglatadi?", options:["Iltimos","Kechirasiz","Rahmat","Salom"], answer:2, explanation:"Спасибо — rahmat." },
      { q:"'Большой' so'zining antonimi?", options:["Средний","Маленький","Высокий","Длинный"], answer:1, explanation:"Маленький — kichik, большой ning antonimi." },
      { q:"Ko'plikdagi 'стол' qanday?", options:["столей","столов","столи","столы"], answer:3, explanation:"Стол ko'pligi — столы." },
    ],
    "O'rta": [
      { q:"Rus tilida nechta kelishik (падеж) bor?", options:["4","5","6","7"], answer:2, explanation:"Rus tilida 6 ta kelishik: именительный, родительный, дательный, винительный, творительный, предложный." },
      { q:"Именительный падеж savoli?", options:["Кого? Чего?","Кто? Что?","Кому? Чему?","Кем? Чем?"], answer:1, explanation:"Именительный падеж savollari: Кто? (kim?) va Что? (nima?)." },
      { q:"Несовершенный вид fe'li qaysi?", options:["написать","прочитать","читать","сделать"], answer:2, explanation:"Читать — jarayon, NSV (несовершенный вид). Прочитать — tugallanish, SV." },
      { q:"'Я ___ в Ташкенте' (hozirgi) — to'g'ri?", options:["живу","живёт","живём","живут"], answer:0, explanation:"Я bilan fe'lning 1-shaxs birlik shakli: живу." },
      { q:"Краткое прилагательное misoli?", options:["красивый","красива","красивого","красивым"], answer:1, explanation:"Краткая форма (qisqa shakl): красива — sifatni predikat sifatida ishlatishda." },
      { q:"'Он пришёл, ___ она ушла' — qaysi bog'lovchi?", options:["и","а","но","или"], answer:1, explanation:"А — qarama-qarshilik bog'lovchisi (while/whereas): Он пришёл, а она ушла." },
      { q:"'Мне нравится' grammatik sub'ekti qaysi kelishikda?", options:["Именительный","Дательный","Родительный","Винительный"], answer:1, explanation:"Нравится konstruktsiyasida shaxs Дательный kelishikda: мне, тебе, ему." },
      { q:"Возвратные глаголы o'ziga xos belgisi?", options:["-ся/-сь qo'shimchasi","Приставка","Суффикс -ова","Постфикс -то"], answer:0, explanation:"Возвратные глаголы -ся (undosh keyin) yoki -сь (unli keyin) bilan tugaydi: мыться, учиться." },
      { q:"'Чтобы' dan keyin qaysi fe'l shakli?", options:["Инфинитив yoki прошедшее время","Настоящее время","Будущее время","Повелительное"], answer:0, explanation:"Чтобы + infinitive (sub'ekt bir xil) yoki Past tense (sub'ektlar farqli)." },
      { q:"Страдательный залог Past tense shakli?", options:["был + инфинитив","был + краткое причастие","есть + причастие","будет + причастие"], answer:1, explanation:"Past Passive: был/была/было + краткое страдательное причастие (был написан)." },
    ],
    Qiyin: [
      { q:"Деепричастие nima?", options:["Sifat","Fe'ldan yasalgan qo'shimcha harakat bildiruvchi shakl","Ot","Ravish"], answer:1, explanation:"Деепричастие fe'lga bog'liq bo'lib, qo'shimcha harakatni bildiradi: читая (o'qiy turib)." },
      { q:"Причастие va деепричастие farqi?", options:["Farqi yo'q","Причастие ot sifatlaydi, деепричастие fe'lga bog'liq","Rod","Kelishik"], answer:1, explanation:"Причастие = sifat funksiyasi (читающий студент), Деепричастие = qo'shimcha harakat (читая, он...)." },
      { q:"Управление: 'скучать ___ кому?' — to'g'ri predlog?", options:["о","по","за","из"], answer:1, explanation:"Скучать по + Дательный: скучать по маме." },
      { q:"'Не' va 'ни' farqi?", options:["Farqi yo'q","Не — inkor, ни — kuchaytirilgan inkor yoki birlashish","Ни tezroq","Не rasmiy"], answer:1, explanation:"Не oddiy inkor; ни kuchaytirilgan inkorda yoki 'ни...ни' juftligida ishlatiladi." },
      { q:"Видо-временная форма 'буду читать'?", options:["NSV Настоящее","NSV Будущее составное","SV Будущее простое","NSV прошедшее"], answer:1, explanation:"Буду читать — NSV Будущее составное (jarayon kelajakda): буду + инфинитив NSV." },
      { q:"'Несмотря на то что' — bu nima?", options:["Причинный союз","Уступительный союз","Следственный","Условный"], answer:1, explanation:"Несмотря на то что — уступительный (qarshilik/imtiyoz) bog'lovchisi: despite the fact that." },
      { q:"Предикативное наречие misoli?", options:["быстро","красиво","можно","хорошо (qanday?)"], answer:2, explanation:"Можно, нельзя, нужно — predikativ ravishlar, gapda kesim vazifasini bajaradi." },
      { q:"Генитивный plural правило: 'много студентов' — qaysi shakl?", options:["Именительный мн.ч.","Родительный мн.ч.","Дательный мн.ч.","Творительный мн.ч."], answer:1, explanation:"Много, мало, несколько + Родительный падеж множественного числа." },
      { q:"Разносклоняемые существительные misoli?", options:["время, имя","стол, дом","мать, дочь","ночь, мышь"], answer:0, explanation:"Время, имя — разносклоняемые: turli kelishiklarda ot, neytral va boshqa turlarga xos shakllar oladi." },
      { q:"Сослагательное наклонение shakli?", options:["Буду + инфинитив","Глагол прошедшего + бы","Инфинитив + бы","Настоящее + бы"], answer:1, explanation:"Сослагательное (subjunctive): fe'lning o'tgan zamon shakli + бы (читал бы, сделал бы)." },
    ],
  },
  French: {
    Oson: [
      { q:"'Je ___ étudiant' — to'g'ri fe'l?", options:["es","sommes","suis","est"], answer:2, explanation:"Je (men) bilan être fe'li: suis. Je suis étudiant." },
      { q:"'Bonjour' nimani anglatadi?", options:["Xayr","Rahmat","Salom/Xayrli kun","Iltimos"], answer:2, explanation:"Bonjour — Salom yoki Xayrli kun (rasmiy salomlashish)." },
      { q:"Fransuz tilida 'livre' so'zining rodi?", options:["Masculin","Féminin","Neytral","Ikkisi ham"], answer:0, explanation:"Livre (kitob) — masculin rod: le livre." },
      { q:"Article défini erkak rod uchun?", options:["la","les","le","un"], answer:2, explanation:"Le — belgilangan article, erkak birlik: le garçon." },
      { q:"'Merci' nimani anglatadi?", options:["Iltimos","Kechirasiz","Rahmat","Salom"], answer:2, explanation:"Merci — rahmat." },
      { q:"'Comment tu t'appelles?' — bu nima so'raydi?", options:["Yoshingiz necha?","Ismingiz nima?","Qayerdansiz?","Qanday sog'liq?"], answer:1, explanation:"Comment tu t'appelles? = Ismingiz nima? (norasmiy)." },
      { q:"'Petit' so'zining ma'nosi?", options:["Katta","Kichik","Baland","Uzoq"], answer:1, explanation:"Petit — kichik (erkak shakl)." },
      { q:"'Je ne sais pas' nimani anglatadi?", options:["Ha","Yo'q","Bilmayman","Tushunmadim"], answer:2, explanation:"Je ne sais pas = Men bilmayman." },
      { q:"Fransuz tilida 'chat' nima?", options:["It","Mushuk","Ot","Qush"], answer:1, explanation:"Chat (sha talaffuz) — mushuk." },
      { q:"'S'il vous plaît' nimani anglatadi?", options:["Rahmat","Xayr","Iltimos (rasmiy)","Kechirasiz"], answer:2, explanation:"S'il vous plaît — iltimos (rasmiy/ko'plik). S'il te plaît — norasmiy." },
    ],
    "O'rta": [
      { q:"Passé composé shakli?", options:["avoir/être + infinitif","avoir/être + participe passé","je + -ais","je + -ai"], answer:1, explanation:"Passé composé = avoir yoki être + participe passé (mangé, parti)." },
      { q:"Qaysi fe'llar passé composé da être bilan ishlatiladi?", options:["Barcha fe'llar","Réflexif va harakat fe'llari (aller, venir...)","Faqat avoir","Hech qachon"], answer:1, explanation:"Être bilan: réflexif fe'llar va 'maison de verbes être' deb ataluvchi harakatlar (aller, venir, partir...)." },
      { q:"Imparfait nima uchun ishlatiladi?", options:["Bir martalik tugalangan harakat","O'tmishdagi takroriy/davomiy holat","Kelajak","Modal"], answer:1, explanation:"Imparfait o'tmishdagi odatiy, davomiy yoki fon holat uchun ishlatiladi." },
      { q:"COD pronoun: 'Je vois Marie' → Je ___ vois?", options:["lui","leur","la","le"], answer:2, explanation:"Marie — feminin, COD (to'g'ri to'ldiruvchi), shuning uchun: Je la vois." },
      { q:"Subjonctif qachon ishlatiladi?", options:["Fakt bildirish","Shubha, istak, his, majburiyat bildirish","Kelajak","Passé"], answer:1, explanation:"Subjonctif il faut que, je veux que, bien que kabi konstruktsiyalardan keyin ishlatiladi." },
      { q:"Accord du participe passé: être bilan qanday?", options:["O'zgarmaydi","Sub'ektning jinsi va soniga moslashadi","Ob'ektga moslashadi","Doim -e qo'shiladi"], answer:1, explanation:"Être yordamchi fe'l bilan participe passé sub'ektga moslashadi: Elle est partie (not parti)." },
      { q:"'Bien que' dan keyin qaysi mood?", options:["Indicatif","Conditionnel","Subjonctif","Infinitif"], answer:2, explanation:"Bien que (garchi) subjonctifni talab qiladi: Bien qu'il soit fatigué..." },
      { q:"Conditionnel présent ishlatilish holati?", options:["Haqiqiy holat","Taxmin, iltimos, xayoliy holat","Buyruq","Passé"], answer:1, explanation:"Conditionnel présent xayoliy shart natijasi, xushmuomalalik yoki taxmin uchun: Je voudrais..." },
      { q:"Négation shakli?", options:["no + fe'l","ne...pas fe'l atrofida","non + fe'l","pas fe'l oldida"], answer:1, explanation:"Fransuzchada inkor: ne (fe'l oldida) + pas (fe'l keyin): Je ne sais pas." },
      { q:"Pronom relatif 'dont' qachon?", options:["Ot o'rnida","De prelogini oluvchi fe'l/sifatlar bilan","Joy","Vaqt"], answer:1, explanation:"Dont de prelogli bo'g'lovchini almashtiradi: le livre dont je parle (parler de)." },
    ],
    Qiyin: [
      { q:"Plus-que-parfait nima uchun?", options:["Kelajak","O'tmishdagi boshqa o'tmishdan oldingi harakat","Hozirgi","Buyruq"], answer:1, explanation:"Plus-que-parfait: o'tmishdagi boshqa harakatdan ham oldinroq sodir bo'lgan harakat (avait + PP)." },
      { q:"Futur antérieur nima?", options:["Passé composé","Kelajakdagi boshqa harakatdan oldin tugallanadigan harakat","Imparfait","Subjonctif"], answer:1, explanation:"Futur antérieur: aura/sera + PP — kelajakda boshqa harakatdan oldin tugaydi." },
      { q:"Discours indirect da Present → ?", options:["Present qoladi","Imparfait ga o'tadi","Passé composé","Subjonctif"], answer:1, explanation:"Rapportée gapda Present Simple → Imparfait ga o'tadi: 'Il dit qu'il venait'." },
      { q:"Gérondif shakli?", options:["en + infinitif","en + participe présent","à + infinitif","de + participe passé"], answer:1, explanation:"Gérondif = en + participe présent (-ant): en mangeant, en parlant." },
      { q:"'Lequel/laquelle' nima uchun?", options:["Oddiy relative","Prepositiondan keyin animate/inanimate uchun","Sub'ekt","Ob'ekt"], answer:1, explanation:"Lequel/laquelle prepositiondan keyin ishlatiladi: la table sur laquelle..." },
      { q:"Nominalization misoli?", options:["courir (run)","la course (yugurish — ot shaklida)","coureur","courant"], answer:1, explanation:"Nominalization — fe'ldan yoki sifatdan ot yasash: courir → la course." },
      { q:"Double negation: 'ne...jamais' vs 'ne...rien' farqi?", options:["Farqi yo'q","jamais — hech qachon, rien — hech narsa","rien — hech qachon","jamais — hech kim"], answer:1, explanation:"Ne...jamais = hech qachon (ever/never), ne...rien = hech narsa (nothing/anything)." },
      { q:"Conditionnel passé ishlatilishi?", options:["Hozirgi xayol","O'tmishdagi amalga oshmagan shart natijasi","Kelajak","Buyruq"], answer:1, explanation:"Cond. passé: Si j'avais su, j'aurais agi — o'tmishda bo'lmagan shart natijasi." },
      { q:"'Quoique' dan keyin qaysi mood?", options:["Indicatif","Conditionnel","Infinitif","Subjonctif"], answer:3, explanation:"Quoique (although/even though) subjonctifni talab qiladi." },
      { q:"'Avoir beau + infinitif' nimani anglatadi?", options:["Qilish oson","Harakat qilib ham natija yo'q (in vain)","Ruxsat","Majburiyat"], answer:1, explanation:"Avoir beau faire = qanchalik harakat qilsam ham... (She tries but in vain)." },
    ],
  },
};

const generateAIQuestion = async (category, difficulty, usedQuestionTexts = []) => {
  if (!GEMINI_API_KEY) return null;
  const usedList = usedQuestionTexts.length > 0
    ? usedQuestionTexts.map((q, i) => `${i + 1}. "${q}"`).join("\n")
    : "none";

  const topicHints = {
    HTML:       "tags, attributes, semantics, forms, media, accessibility, web components",
    CSS:        "selectors, flexbox, grid, animations, variables, specificity, responsive",
    JavaScript: "functions, arrays, objects, async, DOM, ES6+, closures, prototypes, events",
    React:      "hooks, components, state, props, lifecycle, context, performance, routing",
    English:    "grammar, tenses, vocabulary, prepositions, conditionals, passive voice",
    Russian:    "grammar, cases, verb conjugation, aspects, syntax, vocabulary",
    French:     "grammar, verb conjugation, tenses, articles, vocabulary, subjunctive",
  };

  const prompt = `You are a quiz generator. Generate ONE unique multiple-choice question about ${category} (topics: ${topicHints[category] || category}) for a "${difficulty}" level student.
STRICT RULES:
1. Do NOT ask about any of these already-used questions:
${usedList}
2. Choose a DIFFERENT topic/concept than what was already asked above
3. Make it appropriate for "${difficulty}" level: ${difficulty === "Oson" ? "basic concepts, beginners" : difficulty === "O'rta" ? "intermediate, practical usage" : "advanced, edge cases, deep concepts"}
4. Return ONLY this exact JSON format, no markdown, no extra text:
{"q":"Your question here?","options":["Option A","Option B","Option C","Option D"],"answer":0,"explanation":"One clear sentence explaining why the answer is correct."}
Where "answer" is the index (0-3) of the correct option.`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 1.0, maxOutputTokens: 500 },
      }),
    });
    // MANA SHU QATORLARNI QO'SHING:
if (res.status === 429) {
  console.error("Gemini API limiti tugadi, statik savollarga o'tilmoqda...");
  return null; 
}
    if (!res.ok) throw new Error("API xatolik");
    const data   = await res.json();
    const raw    = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return parsed;
  } catch { return null; }
};

const getDifficultyFromScore = (avg) => {
  if (avg === null || avg === undefined) return "Oson";
  if (avg < 50) return "Oson";
  if (avg < 80) return "O'rta";
  return "Qiyin";
};

const escalateDifficulty   = (d) => { const i = DIFF_ORDER.indexOf(d); return i < DIFF_ORDER.length - 1 ? DIFF_ORDER[i + 1] : d; };
const deescalateDifficulty = (d) => { const i = DIFF_ORDER.indexOf(d); return i > 0 ? DIFF_ORDER[i - 1] : d; };

const shuffleOptions = (q) => {
  if (!q) return null;
  const indexed  = q.options.map((opt, i) => ({ opt, isCorrect: i === q.answer }));
  const shuffled = [...indexed].sort(() => Math.random() - 0.5);
  return { ...q, options: shuffled.map((x) => x.opt), answer: shuffled.findIndex((x) => x.isCorrect) };
};

const useUserStats = (user) => {
  const [stats, setStats] = useState({ quizAvg: null, xp: 0, highScores: {} });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "data", "stats"));
        if (!cancelled && snap.exists()) {
          const d = snap.data();
          setStats({ quizAvg: d.quizAvg ?? null, xp: d.xp || 0, highScores: d.highScores || {} });
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user]);
  return { stats, loading };
};

const DiffBadge = memo(({ difficulty, t }) => {
  const labels = { "Oson": t.diffEasy, "O'rta": t.diffMedium, "Qiyin": t.diffHard };
  const colors = { "Oson": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", "O'rta": "text-amber-400 bg-amber-500/10 border-amber-500/20", "Qiyin": "text-rose-400 bg-rose-500/10 border-rose-500/20" };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[difficulty] || "text-blue-400 bg-blue-500/10 border-blue-500/20"}`}>
      {labels[difficulty] || difficulty}
    </span>
  );
});

const ExplanationBox = memo(({ explanation, darkMode }) => {
  if (!explanation) return null;
  return (
    <div className={`mt-6 p-4 rounded-2xl border ${darkMode ? "bg-blue-500/5 border-blue-500/20 text-blue-300" : "bg-blue-50 border-blue-100 text-blue-700"}`}>
      <div className="flex gap-3">
        <LuInfo className="shrink-0 mt-0.5" size={18} />
        <p className="text-sm leading-relaxed font-medium">
          {explanation}
        </p>
      </div>
    </div>
  );
});

const Quiz = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const { stats, loading } = useUserStats(user);

  const [screen, setScreen] = useState("select");
  const [category, setCategory] = useState(null);
  const [currentDiff, setCurrentDiff] = useState("Oson");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [hasHintGift, setHasHintGift] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIMER);
  const [streak, setStreak] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);

  const timerRef = useRef(null);
  const savingRef = useRef(false);
  const pendingRef = useRef(null);

  const initialDiff = useMemo(() => getDifficultyFromScore(stats.quizAvg), [stats.quizAvg]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const achSnap = await getDoc(doc(db, "users", user.uid, "data", "achievements"));
        if (achSnap.exists() && achSnap.data().gift_g1 === true) setHasHintGift(true);
        const statsSnap = await getDoc(doc(db, "users", user.uid, "data", "stats"));
        if (statsSnap.exists()) setHintsRemaining(statsSnap.data().quizHints || 0);
      } catch (err) { console.error(err); }
    })();
  }, [user]);

  const fetchNextQuestion = useCallback(async (cat, diff, usedQs = []) => {
    if (GEMINI_API_KEY) {
      const aiQ = await generateAIQuestion(cat, diff, usedQs);
      if (aiQ) return shuffleOptions({ ...aiQ, category: cat, difficulty: diff });
    }
    const pool = STATIC_QUESTIONS[cat]?.[diff] || STATIC_QUESTIONS[cat]?.["Oson"] || [];
    const unused = pool.filter(q => !usedQs.includes(q.q));
    const source = unused.length > 0 ? unused : pool;
    const picked = source[Math.floor(Math.random() * source.length)];
    return picked ? shuffleOptions({ ...picked, category: cat, difficulty: diff }) : null;
  }, []);

  const saveResult = useCallback(async (pct, score, totalQ, cat) => {
    if (!user || savingRef.current) return;
    savingRef.current = true;
    try {
      const statsRef = doc(db, "users", user.uid, "data", "stats");
      const statsSnap = await getDoc(statsRef);
      const old = statsSnap.exists() ? statsSnap.data() : {};
      const oldCount = old.quizCount || 0;
      const newAvg = Math.round(((old.quizAvg || 0) * oldCount + pct) / (oldCount + 1));
      const xpGained = score * 5;
      const prevHS = old.highScores?.[cat] || 0;
      const newHS = score > prevHS ? score : prevHS;

      await setDoc(statsRef, {
        quizAvg: newAvg, quizCount: oldCount + 1,
        highScores: { ...(old.highScores || {}), [cat]: newHS },
      }, { merge: true });

      await setDoc(doc(db, "users", user.uid), { quizAvg: newAvg }, { merge: true });
      await giveReward(user.uid, xpGained, "xp", "Quiz muvaffaqiyatli yakunlandi");
      showToast?.(`+${xpGained} XP! ✅`, "success");
      completeRealTask(user.uid, "quiz");
    } catch (err) { console.error(err); }
    finally { savingRef.current = false; }
  }, [user, showToast]);

  const startQuiz = useCallback(async (cat) => {
    clearInterval(timerRef.current);
    setCategory(cat);
    setLoadingQ(true);
    setCurrentDiff(initialDiff);
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setStreak(0);
    setResultData(null);
    setUsedQuestions([]);
    setIsAnswerRevealed(false);
    savingRef.current = false;

    const firstQ = await fetchNextQuestion(cat, initialDiff, []);
    if (!firstQ) { showToast?.(t.loadingError, "error"); setLoadingQ(false); return; }

    setQuestions([firstQ]);
    setUsedQuestions([firstQ.q]);
    setTimeLeft(TIMER);
    setLoadingQ(false);
    setScreen("playing");
  }, [initialDiff, fetchNextQuestion, showToast, t.loadingError]);

  const handleAnswer = useCallback((idx) => {
    setSelected((prev) => {
      if (prev !== null) return prev;
      clearInterval(timerRef.current);
      pendingRef.current = null;
      return idx;
    });
  }, []);

  const handleUseHint = async () => {
    if (!hasHintGift || hintsRemaining <= 0 || isAnswerRevealed || !user || selected !== null) return;
    try {
      const statsRef = doc(db, "users", user.uid, "data", "stats");
      await updateDoc(statsRef, { quizHints: increment(-1) });
      setHintsRemaining(prev => prev - 1);
      setIsAnswerRevealed(true);
      showToast?.(t.hintUsed, "success");
    } catch (err) { console.error(err); showToast?.(t.errorOccurred, "error"); }
  };

  const handleNext = useCallback(async (timeout = false) => {
    clearInterval(timerRef.current);
    setIsAnswerRevealed(false);
    setAnswers((prevAnswers) => {
      const q = questions[currentQ];
      const isCorrect = !timeout && selected === q?.answer;
      const newAnswers = [...prevAnswers, {
        correct: isCorrect, selected, timeout,
        q: q?.q, userAnswer: q?.options?.[selected],
        correct_ans: q?.options?.[q?.answer], explanation: q?.explanation,
      }];
      pendingRef.current = { newAnswers, isCorrect, currentQ: currentQ };
      return newAnswers;
    });
  }, [questions, currentQ, selected]);

  useEffect(() => {
    if (!pendingRef.current) return;
    const { newAnswers, isCorrect, currentQ: cq } = pendingRef.current;
    pendingRef.current = null;
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);

    if (newAnswers.length >= QUESTIONS_PER_QUIZ) {
      const score = newAnswers.filter(a => a.correct).length;
      const pct = Math.round((score / newAnswers.length) * 100);
      setResultData({ score, pct, answers: newAnswers, questions: questions.slice(0, newAnswers.length) });
      setScreen("result");
      saveResult(pct, score, newAnswers.length, category);
    } else {
      const newDiff = isCorrect ? (newStreak >= 2 ? escalateDifficulty(currentDiff) : currentDiff) : deescalateDifficulty(currentDiff);
      setCurrentDiff(newDiff);
      setLoadingQ(true);
      setCurrentQ(cq + 1);
      setSelected(null);
      setTimeLeft(TIMER);
      fetchNextQuestion(category, newDiff, usedQuestions).then(nextQ => {
        if (nextQ) { 
          setQuestions(prev => [...prev, nextQ]); 
          setUsedQuestions(prev => [...prev, nextQ.q]); 
        }
        setLoadingQ(false);
      });
    }
  }, [answers, category, currentDiff, fetchNextQuestion, questions, saveResult, streak, usedQuestions]);

  useEffect(() => {
    if (screen !== "playing" || selected !== null || loadingQ) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { handleNext(true); return TIMER; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, selected, currentQ, loadingQ, handleNext]);

  // UI RENDERING
  if (screen === "select") return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24">
      <ScrollReveal direction="up">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {t.quizBadge}
          </span>
          <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            {t.quizTitle}
          </h2>
          <p className="text-slate-500 text-lg mb-10">
            {QUESTIONS_PER_QUIZ} {t.quizQuestions} · {TIMER}s {t.secLabel} limit · AI adaptive
          </p>
          {!loading && (
            <div className={`mt-8 inline-flex items-center gap-4 px-6 py-3 rounded-2xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"}`}>
              <LuTarget className="text-blue-500" size={20} />
              <span className="text-sm font-bold text-slate-400">{t.levelLabelPrefix}</span>
              <DiffBadge difficulty={initialDiff} t={t} />
            </div>
          )}
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, i) => {
          const cfg = CATEGORY_CONFIG[cat];
          const hs = stats.highScores?.[cat] || 0;
          return (
            <ScrollReveal key={cat} direction="up" delay={i * 100}>
              <div 
                onClick={() => startQuiz(cat)}
                className={`group relative p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden ${
                  darkMode 
                    ? "bg-slate-900/40 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60" 
                    : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-xl shadow-slate-100/50"
                }`}
                style={{ backdropFilter: "blur(20px)" }}
              >
                {/* Background Glow */}
                <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-[80px] opacity-20 transition-all duration-500 group-hover:scale-150 ${
                  cfg.color === "orange" ? "bg-orange-500" : cfg.color === "purple" ? "bg-purple-500" : cfg.color === "yellow" ? "bg-yellow-500" : "bg-blue-500"
                }`} />

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 ${
                  darkMode ? `bg-${cfg.color}-500/10 text-${cfg.color}-400` : `bg-${cfg.color}-50 text-${cfg.color}-600`
                }`}>
                  {cfg.icon}
                </div>
                
                <h3 className={`text-xl font-black mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>{cat}</h3>
                <div className="flex flex-col gap-1">
                  {hs > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                      <LuTrophy size={14} />
                      {t.highScoreLabel} {hs}/{QUESTIONS_PER_QUIZ}
                    </div>
                  )}
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mt-2">{t.catAIPrompt}</p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-xs font-bold text-indigo-500 transition-all group-hover:gap-4">
                  {t.play} <LuChevronRight />
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );

  if (screen === "playing") {
    const q = questions[currentQ];
    const timerColor = timeLeft <= 5 ? "bg-rose-500 shadow-rose-500/40" : timeLeft <= 10 ? "bg-amber-500 shadow-amber-500/40" : "bg-emerald-500 shadow-emerald-500/40";

    return (
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => { clearInterval(timerRef.current); setScreen("select"); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
             {t.exitQuiz}
          </button>
          <div className="flex items-center gap-4">
            {streak >= 2 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black animate-bounce">
                <LuFlame size={14} />
                {streak} {t.consecutiveStreak}
              </div>
            )}
            <DiffBadge difficulty={currentDiff} t={t} />
            <div className={`px-4 py-1.5 rounded-xl border text-xs font-black ${darkMode ? "bg-slate-900/40 border-white/5 text-slate-400" : "bg-white border-slate-100 text-slate-500"}`}>
              {Math.min(currentQ + 1, QUESTIONS_PER_QUIZ)} / {QUESTIONS_PER_QUIZ}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 w-full rounded-full bg-slate-800/10 overflow-hidden mb-12">
          <div 
            className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-700 shadow-lg shadow-indigo-500/30" 
            style={{ width: `${(currentQ / QUESTIONS_PER_QUIZ) * 100}%` }} 
          />
        </div>

        {/* Question Card */}
        {loadingQ ? (
          <div className={`p-16 rounded-[2.5rem] border text-center transition-all animate-pulse ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100"}`}>
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 text-indigo-500 animate-spin">
              <LuBrain size={40} />
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{t.aiGenerating}</h3>
          </div>
        ) : q ? (
          <ScrollReveal direction="up">
            <div className={`p-8 md:p-12 rounded-[2.5rem] border mb-8 ${darkMode ? "bg-slate-900/40 border-white/5 shadow-2xl shadow-indigo-500/5" : "bg-white border-slate-100 shadow-2xl shadow-slate-200/50"}`} style={{ backdropFilter: "blur(20px)" }}>
              {/* Timer Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3 text-slate-400 text-sm font-bold uppercase tracking-widest">
                  <LuBrain className="text-indigo-400" />
                  {category}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-black tabular-nums transition-colors ${timeLeft <= 5 ? "text-rose-500" : darkMode ? "text-white" : "text-slate-900"}`}>
                      {timeLeft}
                      <span className="text-xs ml-1 opacity-50">{t.secLabel}</span>
                    </span>
                    <div className={`mt-2 h-1 w-24 rounded-full overflow-hidden bg-slate-800/20`}>
                      <div className={`h-full transition-all duration-1000 linear ${timerColor}`} style={{ width: `${(timeLeft / TIMER) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                <h2 className={`text-xl md:text-2xl font-black leading-relaxed ${darkMode ? "text-white" : "text-slate-900"}`}>
                  <span className="text-indigo-500 mr-2 opacity-50">#{currentQ + 1}</span>
                  {q.q}
                </h2>
                
                {/* Hint Button */}
                {hasHintGift && hintsRemaining > 0 && !isAnswerRevealed && selected === null && (
                  <button
                    onClick={handleUseHint}
                    className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
                      darkMode ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20" : "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
                    }`}
                  >
                    <LuBrain size={18} />
                    {t.hintShort} ({hintsRemaining})
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, i) => {
                  const isCorrectAnswer = i === q.answer;
                  const isUserSelection = i === selected;
                  
                  let stateStyle = darkMode ? "bg-slate-800/40 border-white/5 text-slate-300 hover:border-indigo-500/30 hover:bg-slate-800" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-indigo-200";
                  
                  if (selected !== null) {
                    if (isCorrectAnswer) stateStyle = "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25 z-10 scale-[1.02]";
                    else if (isUserSelection && !isCorrectAnswer) stateStyle = "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25 z-10 scale-[1.02]";
                    else stateStyle = "opacity-40 scale-95 grayscale";
                  } else if (isAnswerRevealed && isCorrectAnswer) {
                    stateStyle = "bg-emerald-500/20 text-emerald-400 border-emerald-500 ring-4 ring-emerald-500/10";
                  }

                  return (
                    <button 
                      key={i} 
                      onClick={() => handleAnswer(i)} 
                      disabled={selected !== null || isAnswerRevealed}
                      className={`relative flex items-center gap-4 p-6 rounded-[1.5rem] border text-left font-bold transition-all duration-500 group ${stateStyle}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-black transition-all ${
                        selected !== null && (isCorrectAnswer || isUserSelection)
                          ? "bg-white/20 text-white"
                          : darkMode ? "bg-slate-900/60 text-slate-500 group-hover:text-white" : "bg-white text-slate-400 shadow-sm"
                      }`}>
                        {selected !== null && isCorrectAnswer ? <LuCheck /> : selected !== null && isUserSelection ? <LuX /> : String.fromCharCode(65 + i)}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next */}
              {(selected !== null || isAnswerRevealed) && (
                <div className="mt-12 animate-in slide-in-from-top-4 duration-500">
                  <ExplanationBox explanation={q.explanation} darkMode={darkMode} />
                  <button 
                    onClick={() => handleNext()}
                    className="w-full mt-8 py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-3xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
                  >
                    {currentQ + 1 < QUESTIONS_PER_QUIZ ? <>{t.nextQuestion} <LuChevronRight size={22} /></> : <>{t.seeResult} <LuTrophy size={22} /></>}
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>
        ) : (
          <div className="text-center py-20">
             <p className="text-slate-500 mb-6">{t.loadingError}</p>
             <button onClick={() => setScreen("select")} className="px-8 py-3 bg-indigo-500 text-white rounded-2xl font-bold">{t.otherQuiz}</button>
          </div>
        )}
      </div>
    );
  }

  if (screen === "result" && resultData) {
    const { score, pct, answers: ans, questions: qs } = resultData;
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🎉" : pct >= 60 ? "👍" : pct >= 40 ? "📚" : "💪";
    const msg = pct === 100 ? t.allCorrect : pct >= 80 ? t.scoreGreat : pct >= 60 ? t.scoreGood : t.scoreStudy;
    const hs = stats.highScores?.[category] || 0;
    const isNewHS = score > hs;

    return (
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 lg:py-24">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <div className="text-8xl mb-8 transform hover:scale-110 transition-transform duration-500 cursor-default inline-block">{emoji}</div>
            {isNewHS && (
              <div className="mb-6 inline-flex px-6 py-2 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black uppercase tracking-[0.2em] border border-amber-500/20 animate-pulse">
                <LuTrophy className="inline mr-2" /> {t.newRecord}
              </div>
            )}
            <h2 className={`text-4xl md:text-5xl font-black mb-4 tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>{msg}</h2>
            <p className="text-slate-500 font-medium">{category} · {t.diffEasy}: {currentDiff}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className={`p-8 rounded-[2rem] border text-center transition-all ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-xl shadow-slate-100"}`}>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Accuracy</p>
               <div className="text-5xl font-black tabular-nums text-indigo-500">{pct}%</div>
            </div>
            <div className={`p-8 rounded-[2rem] border text-center transition-all ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-xl shadow-slate-100"}`}>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Total XP</p>
               <div className="text-5xl font-black tabular-nums text-emerald-500">+{score * 5}</div>
            </div>
            <div className={`p-8 rounded-[2rem] border text-center transition-all ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-xl shadow-slate-100"}`}>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Score</p>
               <div className={`text-5xl font-black tabular-nums ${darkMode ? "text-white" : "text-slate-900"}`}>{score}/{qs.length}</div>
            </div>
          </div>

          {/* Detailed Review */}
          <div className={`rounded-[2.5rem] border overflow-hidden mb-12 ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-2xl shadow-slate-100"}`}>
            <div className={`px-8 py-6 border-b font-black text-sm uppercase tracking-widest ${darkMode ? "border-white/5 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-900"}`}>
              {t.detailedReview}
            </div>
            <div className="divide-y divide-slate-800/10">
              {ans.map((a, i) => (
                <div key={i} className="p-8 group hover:bg-slate-800/5 transition-colors">
                  <div className="flex gap-6">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 transition-all ${
                      a.correct ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                      {a.correct ? <LuCheck size={22}/> : <LuX size={22}/>}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <h4 className={`text-lg font-bold leading-relaxed ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{a.q}</h4>
                        <DiffBadge difficulty={qs[i]?.difficulty || currentDiff} t={t} />
                      </div>
                      {!a.correct && (
                        <div className={`mb-4 px-4 py-3 rounded-xl text-xs font-bold ${darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                          {t.correctAnswerLabel}: {a.correct_ans}
                        </div>
                      )}
                      {a.timeout && <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-bold">⏱ {t.timeOutLabel}</div>}
                      {a.explanation && <p className="text-sm text-slate-500 leading-relaxed italic">💡 {a.explanation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => startQuiz(category)} className="flex-1 py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-3xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/25 active:scale-95">
               <LuRefreshCw size={20} /> {t.retryQuiz}
            </button>
            <button onClick={() => setScreen("select")} className={`flex-1 py-5 rounded-3xl font-black border transition-all active:scale-95 ${darkMode ? "bg-slate-800 border-white/5 text-white hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200"}`}>
               {t.otherQuiz}
            </button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return null;
};

export default memo(Quiz);