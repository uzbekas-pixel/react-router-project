import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { doc, getDoc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  LuBrain, LuStar, LuTrophy, LuRefreshCw,
  LuLoader, LuChevronRight, LuFlame,
} from "react-icons/lu";

const TIMER              = 20;
const QUESTIONS_PER_QUIZ = 10;
const GEMINI_API_KEY     = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL         = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const DIFF_ORDER = ["Oson", "O'rta", "Qiyin"];
const DIFF_COLOR = { "Oson": "#10b981", "O'rta": "#f59e0b", "Qiyin": "#ef4444", "Barcha": "#3b82f6" };

const CATEGORY_CONFIG = {
  HTML:       { icon: "🌐", color: "#f97316" },
  CSS:        { icon: "🎨", color: "#8b5cf6" },
  JavaScript: { icon: "⚡", color: "#eab308" },
  React:      { icon: "⚛️", color: "#06b6d4" },
  English:    { icon: "🇬🇧", color: "#3b82f6" },
  Russian:    { icon: "🇷🇺", color: "#ef4444" },
  French:     { icon: "🇫🇷", color: "#6366f1" },
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
      { q:"Matn rangi uchun CSS?", options:["font-color","text-color","color","foreground"], answer:2, explanation:"color matn rangini belgilaydi." },
      { q:"Elementni yashirish?", options:["hide:true","visible:false","display:none","opacity:0"], answer:2, explanation:"display:none butunlay yashiradi." },
      { q:"Fon rangi?", options:["bg-color","color","background-color","back-color"], answer:2, explanation:"background-color fon rangini belgilaydi." },
      { q:"Shrift o'lchamini belgilash?", options:["font-weight","text-size","font-size","text-scale"], answer:2, explanation:"font-size shrift o'lchamini belgilaydi." },
      { q:"Matn qalinligi?", options:["font-size:bold","font-style:bold","font-weight:bold","text-bold:true"], answer:2, explanation:"font-weight:bold matnni qalinlashtiradi." },
      { q:"border-radius:50% nima qiladi?", options:["Kvadrat","Doira","Uchburchak","O'zgartirmaydi"], answer:1, explanation:"50% element doira shaklida bo'ladi." },
      { q:"CSS ni HTML ga ulash?", options:["<script>","<style>","<link rel='stylesheet'>","<css>"], answer:2, explanation:"<link rel='stylesheet'> CSS faylni ulaydi." },
      { q:"Matnni kursiv qilish?", options:["font-weight:italic","font-style:italic","text-style:italic","font:italic"], answer:1, explanation:"font-style:italic matnni kursiv qiladi." },
      { q:"Element kengligi?", options:["size","length","width","height"], answer:2, explanation:"width element kengligini belgilaydi." },
      { q:"Ichki bo'shliq?", options:["margin","spacing","padding","gap"], answer:2, explanation:"padding element ichki bo'shlig'ini belgilaydi." },
    ],
    "O'rta": [
      { q:"Flexbox uchun display?", options:["block","flex","inline","grid"], answer:1, explanation:"display:flex flexbox ni yoqadi." },
      { q:"CSS specificity eng kuchli?", options:["Element","Class","ID","Inline style"], answer:3, explanation:"Inline style eng kuchli — 1000 ball." },
      { q:"CSS Grid: 3 teng ustun?", options:["grid-template:3","grid-columns:3","grid-template-columns:repeat(3,1fr)","columns:3"], answer:2, explanation:"repeat(3,1fr) 3 ta teng ustun." },
      { q:"position:sticky qanday?", options:["Har doim o'rinda","Scroll'da yopishib qoladi","Absolute","Fixed"], answer:1, explanation:"sticky scroll da yopishib qoladi." },
      { q:"align-items:center Flexbox da?", options:["Gorizontal","Vertikal markazlashtiradi","Matnni","Hech nima"], answer:1, explanation:"align-items vertikal markazlashtiradi." },
      { q:"z-index nima qiladi?", options:["Gorizontal joy","Vertikal joy","Qatlam tartibi","O'lcham"], answer:2, explanation:"z-index elementlar qatlam tartibini belgilaydi." },
      { q:"justify-content:space-between nima qiladi?", options:["Markazga","Chekkaga","Orasida teng bo'shliq","Pastga"], answer:2, explanation:"space-between elementlar orasida teng bo'shliq qo'yadi." },
      { q:"CSS pseudo-class misoli?", options:[".class","#id",":hover","::before"], answer:2, explanation:":hover pseudo-class, :: pseudo-element." },
      { q:"CSS transition nima uchun?", options:["Animatsiya qadamlari","Mulk o'zgarishini silliq ko'rsatish","Rang","Shrift"], answer:1, explanation:"transition mulk o'zgarishini silliq animatsiya bilan ko'rsatadi." },
      { q:"CSS var() nima uchun?", options:["Funksiya","CSS o'zgaruvchilarini ishlatish","Import","Hisob"], answer:1, explanation:"var() CSS custom property (o'zgaruvchi) qiymatini oladi." },
    ],
    Qiyin: [
      { q:"will-change nima qiladi?", options:["O'chiradi","GPU oldindan optimizatsiya","Rang","Transition"], answer:1, explanation:"will-change GPU ni oldindan tayyorlaydi." },
      { q:"CSS contain:layout nima?", options:["Yashiradi","Layout hisob izolyatsiya","Scroll","Z-index"], answer:1, explanation:"contain:layout layout hisob-kitoblarni izolyatsiya qiladi." },
      { q:"@layer nima uchun?", options:["Animatsiya","Specificity tartib","Media query","Font"], answer:1, explanation:"@layer specificity ziddiyatlarini tartibga soladi." },
      { q:"CSS Houdini nima?", options:["Preprocessor","Brauzer render API lari","Animatsiya kutubxona","Grid"], answer:1, explanation:"Houdini brauzerning render jarayoniga kirish imkonini beradi." },
      { q:"subgrid nima?", options:["Mini grid","Child element parent grid iga moslashishi","Yangi grid","CSS4"], answer:1, explanation:"subgrid child elementlarga parent grid trek lari bilan moslashish imkoni." },
      { q:"CSS @property nima?", options:["Selector","Custom property turi va qiymat aniqlash","Animation","Media"], answer:1, explanation:"@property custom CSS property uchun tip va qiymat chegarasini aniqlaydi." },
      { q:"aspect-ratio xususiyati nima qiladi?", options:["Rasm o'lchami","Element eniga bo'yi nisbatini saqlash","Flex","Grid"], answer:1, explanation:"aspect-ratio element kenglik/balandlik nisbatini belgilaydi." },
      { q:"CSS logical properties nima?", options:["Mantiqiy hisob","Yozuv yo'nalishiga bog'liq o'lchamlar","Kaskad","Animatsiya"], answer:1, explanation:"Logical properties yozuv yo'nalishiga (LTR/RTL) moslashadi." },
    ],
  },
  JavaScript: {
    Oson: [
      { q:"Konsolga chiqarish?", options:["print()","echo()","console.log()","log()"], answer:2, explanation:"console.log() JS standart." },
      { q:"Massivga element qo'shish?", options:["arr.add()","arr.push()","arr.append()","arr.insert()"], answer:1, explanation:"push() massiv oxiriga qo'shadi." },
      { q:"'&&' operatori?", options:["OR","AND","NOT","XOR"], answer:1, explanation:"&& AND operatori." },
      { q:"Massiv uzunligi?", options:[".size",".count",".length",".total"], answer:2, explanation:".length massiv uzunligini qaytaradi." },
      { q:"String ni raqamga aylantirish?", options:["toNumber()","parseInt()","str()","cast()"], answer:1, explanation:"parseInt() yoki Number() ishlatiladi." },
      { q:"ES6 da o'zgaruvchi e'lon?", options:["var","variable","let/const","def"], answer:2, explanation:"let va const ES6 da qo'shildi." },
      { q:"undefined va null farqi?", options:["Farqi yo'q","undefined e'lonlanmagan, null ataylab bo'sh","null tezroq","undefined xato"], answer:1, explanation:"undefined qiymat yo'q, null ataylab bo'sh." },
      { q:"Massivning birinchi elementini olish?", options:["arr.first()","arr[1]","arr[0]","arr.get(0)"], answer:2, explanation:"Massiv 0 dan boshlanadi: arr[0]." },
      { q:"typeof 'hello' natijasi?", options:["text","String","string","char"], answer:2, explanation:"typeof string uchun kichik 'string' qaytaradi." },
      { q:"Ternary operator sintaksisi?", options:["if ? else","condition ? true : false","? condition : result","cond => result"], answer:1, explanation:"condition ? trueValue : falseValue — ternary operator." },
    ],
    "O'rta": [
      { q:"typeof null?", options:["null","undefined","object","string"], answer:2, explanation:"typeof null === 'object' — JS bug." },
      { q:"=== va == farqi?", options:["Farqi yo'q","=== tip ham tekshiradi","== qat'iy","=== faqat string"], answer:1, explanation:"=== qiymat va tipni tekshiradi." },
      { q:"Array.map() nima qaytaradi?", options:["undefined","Yangi array","Shu array","Boolean"], answer:1, explanation:"map() yangi array qaytaradi." },
      { q:"Event bubbling nima?", options:["Faqat targetda","Child dan parent ga","Parent dan child ga","Bekor"], answer:1, explanation:"Bubbling child dan parent ga tarqaladi." },
      { q:"Closure nima?", options:["Yopiq funksiya","Tashqi scope eslab qolish","Class","Async"], answer:1, explanation:"Closure tashqi scope ga kirish imkoni." },
      { q:"Array.filter() nima qaytaradi?", options:["Boolean","Birinchi mos","Mos elementlar yangi array","undefined"], answer:2, explanation:"filter() mos elementlar yangi array qaytaradi." },
      { q:"Array.reduce() nima qiladi?", options:["O'chiradi","Massivni bitta qiymatga kamaytiradi","Filtrlaydi","Saralaydi"], answer:1, explanation:"reduce() massiv elementlarini birlashtirib bitta qiymat hosil qiladi." },
      { q:"Promise nima?", options:["Sinxron operatsiya","Asinxron operatsiya natijasi","Loop","Array turi"], answer:1, explanation:"Promise kelajakda bajarilishi mumkin bo'lgan operatsiya natijasi." },
      { q:"async/await nima uchun?", options:["Sinxron kod","Promise bilan ishlashni osonlashtirish","Tsikl","Event"], answer:1, explanation:"async/await Promise zanjirini sinxronga o'xshash yozish imkoni." },
      { q:"Object destructuring sintaksisi?", options:["[a, b] = obj","(a, b) = obj","const {a, b} = obj","obj -> a, b"], answer:2, explanation:"const {a, b} = obj — object destructuring." },
    ],
    Qiyin: [
      { q:"Promise.all() qachon reject?", options:["Hech qachon","1 ta reject","Hammasi","2 ta"], answer:1, explanation:"Bitta reject bo'lsa darhol reject." },
      { q:"Microtask va macrotask tartibi?", options:["Macro birinchi","Micro birinchi","Bir xil","Random"], answer:1, explanation:"Microtask (Promise) macrotask dan oldin." },
      { q:"Generator funksiya nima qaytaradi?", options:["Array","Promise","Iterator","undefined"], answer:2, explanation:"Generator Iterator qaytaradi." },
      { q:"WeakMap Map dan farqi?", options:["Farqi yo'q","Kalitlar faqat obyekt, GC","Tezroq","Ko'proq"], answer:1, explanation:"WeakMap kalitlari GC tomonidan o'chirilishi mumkin." },
      { q:"Proxy obyekti nima uchun?", options:["Tarmoq","Obyektga kirish/o'zgartirishni kuzatish","Kesh","Import"], answer:1, explanation:"Proxy obyektga kirish va o'zgartirishni tutib oladi." },
      { q:"Symbol nima uchun?", options:["Raqam turi","Unikal identifikator","String","Boolean"], answer:1, explanation:"Symbol har doim unikal bo'lgan primitive tur." },
      { q:"Event delegation nima?", options:["Hodisani bekor qilish","Parent da child hodisalarni tutish","Hodisa yuborish","Timer"], answer:1, explanation:"Event delegation parent elementda child hodisalarini tutish texnikasi." },
      { q:"Memoization nima?", options:["Xotirani tozalash","Hisoblangan natijalarni keshlash","Animatsiya","Async"], answer:1, explanation:"Memoization funksiya natijalarini keshlab qayta hisoblashni oldini oladi." },
      { q:"Currying nima?", options:["Ko'p argumentli funksiya","Funksiyani bir argumentli funksiyalar zanjiriga aylantirish","Loop","Class"], answer:1, explanation:"Currying f(a,b) ni f(a)(b) ko'rinishga o'tkazish." },
      { q:"Debounce va throttle farqi?", options:["Farqi yo'q","debounce oxirgi, throttle vaqt oralig'i","throttle oxirgi","debounce birinchi"], answer:1, explanation:"debounce oxirgi chaqiruvni kechiktiradi, throttle vaqt oralig'ida cheklaydi." },
    ],
  },
  React: {
    Oson: [
      { q:"useState nima qaytaradi?", options:["Faqat state","Faqat setter","[state,setter]","{state,setter}"], answer:2, explanation:"useState [state, setter] qaytaradi." },
      { q:"Key prop nima uchun?", options:["Stil","Event","List elementlarni aniqlash","Ref"], answer:2, explanation:"Key list elementlarni farqlash uchun." },
      { q:"JSX nima?", options:["Java","JavaScript XML","JSON","Yangi til"], answer:1, explanation:"JSX JS ichida HTML yozish." },
      { q:"Props nima?", options:["State turi","Tashqaridan uzatilgan ma'lumot","Hook","Event"], answer:1, explanation:"Props komponentga tashqaridan uzatiladi." },
      { q:"Komponent nomi katta yoki kichik?", options:["kichik","Katta harf","Raqam","_ belgisi"], answer:1, explanation:"React komponentlari katta harf bilan boshlanadi." },
      { q:"HTML class o'rniga React da?", options:["class","className","htmlClass","cssClass"], answer:1, explanation:"JSX da className ishlatiladi." },
      { q:"React da onClick event?", options:["onclick","OnClick","onClick","on-click"], answer:2, explanation:"JSX da camelCase: onClick." },
      { q:"Fragment nima uchun?", options:["Stil","Qo'shimcha div siz bir nechta element qaytarish","Loop","State"], answer:1, explanation:"Fragment <></> yoki <React.Fragment> qo'shimcha DOM elementi qo'shmasdan." },
    ],
    "O'rta": [
      { q:"useEffect 2-argumenti?", options:["Callback","Dependency array","Return","Initial state"], answer:1, explanation:"Dependency array o'zgarganda effect ishlaydi." },
      { q:"useCallback va useMemo farqi?", options:["Farqi yo'q","useCallback funksiya, useMemo qiymat","useMemo tezroq","useCallback class"], answer:1, explanation:"useCallback funksiya, useMemo qiymat memolashtiradi." },
      { q:"React.memo nima qiladi?", options:["State","Props o'zgarmasa render yo'q","Hook","Context"], answer:1, explanation:"React.memo keraksiz re-render oldini oladi." },
      { q:"Context API nima hal qiladi?", options:["Performance","Prop drilling","Routing","Stil"], answer:1, explanation:"Context prop drilling muammosini hal qiladi." },
      { q:"useRef nima uchun?", options:["State","DOM element va render qilmaydigan qiymat","Async","Routing"], answer:1, explanation:"useRef DOM ga murojaat va mutable qiymat uchun." },
      { q:"State o'zgartirish uchun?", options:["this.state=","setState()","useState setter","B va C"], answer:3, explanation:"useState setter va setState() ikkalasi ham ishlatiladi." },
      { q:"useReducer qachon ishlatiladi?", options:["Oddiy state","Murakkab state logikasi","DOM","Routing"], answer:1, explanation:"useReducer murakkab state o'zgarishlarini boshqarish uchun." },
      { q:"Custom Hook nima?", options:["Komponent","use bilan boshlangan qayta ishlatiladigan funksiya","Class","Event"], answer:1, explanation:"Custom hook use prefiksi bilan boshlanadi va hook mantiqini qayta ishlatadi." },
      { q:"React Portal nima uchun?", options:["Routing","Komponentni DOM ierarxiyasidan tashqari render qilish","State","Event"], answer:1, explanation:"Portal modal, tooltip kabi elementlarni root dan tashqari render qiladi." },
      { q:"Controlled component nima?", options:["DOM boshqaradigan","React state boshqaradigan input","Class komponent","HOC"], answer:1, explanation:"Controlled component ning qiymati React state bilan boshqariladi." },
    ],
    Qiyin: [
      { q:"React Fiber nima?", options:["CSS","Render bo'laklash","Storage","SSR"], answer:1, explanation:"Fiber render ni bo'laklarga ajratadi." },
      { q:"useLayoutEffect va useEffect farqi?", options:["Farqi yo'q","useLayoutEffect paint dan oldin","async","server"], answer:1, explanation:"useLayoutEffect DOM dan keyin, paint dan oldin ishlaydi." },
      { q:"Reconciliation nima?", options:["CSS","Virtual DOM real DOM taqqoslash","State reset","Event"], answer:1, explanation:"Reconciliation minimal DOM o'zgarishlarni topadi." },
      { q:"React Server Components?", options:["Bundle kattalashtiradi","Server da render, bundle yo'q","SSR bir xil","Faqat API"], answer:1, explanation:"RSC server da render bo'lib JS bundle ga qo'shilmaydi." },
      { q:"Concurrent Mode nima beradi?", options:["Yangi sintaksis","Renderni to'xtatish va davom ettirish","CSS","SSR"], answer:1, explanation:"Concurrent Mode urgent va non-urgent update larni ajratadi." },
      { q:"useDeferredValue nima qiladi?", options:["State o'chiradi","Qiymatni keyinroq yangilashga ruxsat beradi","Event","Routing"], answer:1, explanation:"useDeferredValue muhim bo'lmagan yangilanishlarni kechiktiradi." },
      { q:"Strict Mode nima qiladi?", options:["Xatolarni yashiradi","Potensial muammolarni aniqlash uchun qo'shimcha tekshiruvlar","CSS","Routing"], answer:1, explanation:"StrictMode development da komponentlarni ikki marta chaqirib muammolarni aniqlaydi." },
      { q:"HOC (Higher Order Component) nima?", options:["Hook","Komponent qabul qilib komponent qaytaruvchi funksiya","Class","State"], answer:1, explanation:"HOC komponentni argument sifatida olib, yangi komponent qaytaradi." },
      { q:"React Query / SWR nima uchun?", options:["Routing","Server state boshqarish va keshlash","Animation","Form"], answer:1, explanation:"React Query server dan ma'lumot olish, keshlash va sinxronlashni boshqaradi." },
      { q:"Code splitting nima?", options:["Kodni o'chirish","Ilovani kichik bo'laklarga bo'lib kerak vaqtda yuklash","Minify","CSS"], answer:1, explanation:"Code splitting React.lazy bilan amalga oshiriladi, yuklanishni tezlashtiradi." },
    ],
  },
  English: {
    Oson: [
      { q:"'Child' ning ko'pligi?", options:["childs","children","childes","child"], answer:1, explanation:"children — noto'g'ri ko'plik misoli." },
      { q:"To'g'ri gap tanlang:", options:["She go to school","She goes to school","She going","She gone"], answer:1, explanation:"3-shaxs birlik uchun -s: goes." },
      { q:"'Big' ning antonimi?", options:["Large","Huge","Small","Giant"], answer:2, explanation:"Small = kichik, big ning antonimi." },
      { q:"'I ___ a student' to'g'ri?", options:["is","are","am","be"], answer:2, explanation:"I bilan am ishlatiladi." },
      { q:"'Book' qanday tarjima?", options:["Qalam","Kitob","Daftar","Stol"], answer:1, explanation:"Book = Kitob." },
      { q:"She ___ reading hozir:", options:["is","are","am","be"], answer:0, explanation:"She/He/It bilan 'is' ishlatiladi." },
      { q:"'Happy' ning sinonimi?", options:["Sad","Angry","Joyful","Tired"], answer:2, explanation:"Joyful = xursand, happy bilan sinonim." },
      { q:"Plural of 'mouse'?", options:["mouses","mices","mice","mouse"], answer:2, explanation:"Mouse ning ko'pligi mice — noto'g'ri ko'plik." },
    ],
    "O'rta": [
      { q:"Present Perfect to'g'ri?", options:["I eat","I was eating","I have eaten","I will eat"], answer:2, explanation:"have/has + V3 = Present Perfect." },
      { q:"'I ___ here since 2020':", options:["am","was","have been","had been"], answer:2, explanation:"since bilan Present Perfect ishlatiladi." },
      { q:"Passive voice: 'The book ___ written':", options:["is","was","were","be"], answer:1, explanation:"Past passive: was/were + V3." },
      { q:"'Although' qanday bog'lovchi?", options:["Sabab","Qarama-qarshi","Natija","Shart"], answer:1, explanation:"Although = garchi (qarama-qarshi ma'no)." },
      { q:"Second conditional tuzilishi?", options:["If+Past Simple, would+V1","If+Present, will+V1","If+Past Perfect, would have","If+V1, V1"], answer:0, explanation:"Second conditional: If I had money, I would travel." },
      { q:"'Used to' nima ifodalaydi?", options:["Hozirgi odat","O'tmishdagi odat yoki holat","Kelajak","Buyruq"], answer:1, explanation:"Used to o'tmishdagi odatiy yoki davomli holatni ifodalaydi." },
      { q:"Gerund qachon ishlatiladi?", options:["Fe'ldan keyin har doim","Ba'zi fe'l va prepositionlardan keyin","Har doim","Hech qachon"], answer:1, explanation:"enjoy, avoid, suggest kabi fe'llar va prepositionlardan keyin gerund." },
      { q:"'Despite' dan keyin qaysi forma?", options:["that+clause","noun/gerund","infinitive","of+verb"], answer:1, explanation:"Despite + noun yoki gerund: Despite being tired..." },
    ],
    Qiyin: [
      { q:"Subjunctive mood nima ifodalaydi?", options:["Haqiqat","Istak/taxmin","Savol","Buyruq"], answer:1, explanation:"Subjunctive istaklarni ifodalaydi: If I were you..." },
      { q:"'Whom' qachon ishlatiladi?", options:["Subject sifatida","Object sifatida","Ega o'rnida","Har doim"], answer:1, explanation:"Whom object sifatida ishlatiladi." },
      { q:"Inversion qachon ishlatiladi?", options:["Har doim","Negative adverbials bilan (Never, Rarely)","Savollarda faqat","Buyruqlarda"], answer:1, explanation:"Never, Rarely, Seldom bilan inversion: Never have I seen..." },
      { q:"Mixed conditional nima?", options:["Ikki xil vaqtdagi shartlar aralashmasi","Bir xil conditional","Uch conditional","Past conditional"], answer:0, explanation:"Mixed conditional: If I had studied (past), I would be (present) a doctor." },
      { q:"Cleft sentence nima uchun?", options:["Qisqartirish","Ma'lum bir qismni ta'kidlash","Savol","Inkor"], answer:1, explanation:"It was John who called me — cleft sentence ta'kidlash uchun." },
      { q:"Ellipsis grammatikada nima?", options:["Qavslar","Keraksiz takrorni tushirib qoldirish","Vergul","So'z tartibi"], answer:1, explanation:"Ellipsis takroriy so'zlarni tushirib qoldirish: I can play guitar and she can too." },
    ],
  },
  Russian: {
    Oson: [
      { q:"'Кого/чего' savoli qaysi kelishik?", options:["Именительный","Родительный","Дательный","Винительный"], answer:1, explanation:"Родительный kelishigi." },
      { q:"Я ___ книгу (читать, прошедшее):", options:["читаю","читал","читать","читает"], answer:1, explanation:"O'tgan zamon erkak uchun: читал." },
      { q:"'Привет' nima degan ma'no?", options:["Xayr","Salom","Rahmat","Iltimos"], answer:1, explanation:"Привет = Salom (norasmiy)." },
      { q:"Ot jins turlari Ruscha:", options:["2 ta","3 ta","4 ta","1 ta"], answer:1, explanation:"Ruscha 3 ta jins: erkak, ayol, o'rta." },
      { q:"Я, ты, он — bu nima?", options:["Fe'l","Ot","Olmosh","Sifat"], answer:2, explanation:"Я, ты, он — shaxs olmoshlari." },
      { q:"'Спасибо' nima degan ma'no?", options:["Iltimos","Rahmat","Salom","Kechirasiz"], answer:1, explanation:"Спасибо = Rahmat." },
      { q:"Rus tilida nechta kelishik?", options:["4","5","6","7"], answer:2, explanation:"Rus tilida 6 ta kelishik mavjud." },
      { q:"'Большой' nima degan ma'no?", options:["Kichik","Katta","Tez","Sekin"], answer:1, explanation:"Большой = katta, ulkan." },
    ],
    "O'rta": [
      { q:"Деепричастие nima?", options:["Ot","Qo'shimcha harakat fe'l shakli","Sifat","Olmosh"], answer:1, explanation:"Деепричастие qo'shimcha harakat bildiradi." },
      { q:"'Ни...ни' konstruksiyasi nima?", options:["Ham...ham","Na...na","Yoki...yoki","Agar...bo'lsa"], answer:1, explanation:"Ни...ни = na...na (inkor)." },
      { q:"Краткое прилагательное misoli?", options:["Красивый","Красив","Красиво","Красивые"], answer:1, explanation:"Красив — qisqa shakl, predikat sifatida." },
      { q:"Совершенный вид fe'l nima?", options:["Davomli harakat","Tugallangan harakat","Odat","Holat"], answer:1, explanation:"Совершенный вид tugallangan, bir martalik harakatni bildiradi." },
      { q:"'Который' qachon ishlatiladi?", options:["Vaqt","Ot o'rniga bog'lovchi olmosh","Sabab","Shart"], answer:1, explanation:"Который — ot o'rnida ishlatiluvchi relative pronoun." },
      { q:"Дательный падеж qaysi savolga javob beradi?", options:["Кого/чего","Кому/чему","Кем/чем","О ком/чём"], answer:1, explanation:"Дательный падеж — кому? чему? savollariga javob beradi." },
    ],
    Qiyin: [
      { q:"Отглагольное существительное misoli?", options:["Бежать","Красивый","Бег","Быстро"], answer:2, explanation:"Бег — бежать dan yasalgan ot." },
      { q:"Деепричастный оборот qachon ajratiladi?", options:["Har doim","Hech qachon","Vergul bilan","Nuqta bilan"], answer:2, explanation:"Деепричастный оборот vergul bilan ajratiladi." },
      { q:"Причастный оборот qaysi tomonida vergul qo'yiladi?", options:["Har doim oldin","Har doim keyin","Otdan keyin kelsa","Har doim ikki tomondan"], answer:2, explanation:"Причастный оборот aniqlanayotgan otdan keyin kelsa vergul bilan ajratiladi." },
      { q:"'Несмотря на' dan keyin qaysi forma?", options:["Infinitiv","Ot/olmosh","Fe'l","Sifat"], answer:1, explanation:"Несмотря на + ot/olmosh: несмотря на усталость." },
      { q:"Вводные слова grammatikada nima?", options:["Ega","Kesim","Vergul bilan ajratiladigan kirish so'zlar","To'ldiruvchi"], answer:2, explanation:"Вводные слова (однако, кстати, итак) gapga bog'lanmaydi va vergul bilan ajratiladi." },
      { q:"Страдательный залог (Passive) qanday yasaladi?", options:["be + V3","Быть + краткое причастие","Have + V3","Modal + V1"], answer:1, explanation:"Ruschadagi passive: быть + краткое страдательное причастие." },
    ],
  },
  French: {
    Oson: [
      { q:"Erkak jins aniq article?", options:["la","le","les","un"], answer:1, explanation:"Le erkak jins uchun aniq article." },
      { q:"'Merci' inglizcha?", options:["Hello","Please","Thank you","Goodbye"], answer:2, explanation:"Merci = Thank you." },
      { q:"'Je suis' nima?", options:["Men bor edim","Men bor","Sen borsan","U bor"], answer:1, explanation:"Je suis = Men bor (am)." },
      { q:"Frantsuz alfavitida nechta harf?", options:["24","25","26","27"], answer:2, explanation:"Frantsuz alfaviti 26 harfdan iborat." },
      { q:"'Bonjour' nima?", options:["Xayr","Salom","Rahmat","Iltimos"], answer:1, explanation:"Bonjour = Salom (rasmiy)." },
      { q:"Ayol jins aniq article?", options:["le","la","les","une"], answer:1, explanation:"La ayol jins uchun aniq article." },
      { q:"Ko'plik aniq article?", options:["le","la","les","des"], answer:2, explanation:"Les ko'plik uchun aniq article." },
      { q:"'Au revoir' nima?", options:["Salom","Xayr","Rahmat","Iltimos"], answer:1, explanation:"Au revoir = Xayr (ko'rishguncha)." },
    ],
    "O'rta": [
      { q:"être 1-shaxs birlik?", options:["est","êtes","suis","sommes"], answer:2, explanation:"Je suis." },
      { q:"Passé composé tuzilishi?", options:["avoir/être + infinitif","avoir/être + participe passé","juste + verbe","verbe + -ait"], answer:1, explanation:"avoir/être + participe passé." },
      { q:"Qaysi fe'l être bilan conjugatsiya?", options:["Manger","Parler","Aller","Finir"], answer:2, explanation:"Aller — Je suis allé(e)." },
      { q:"Imparfait qachon ishlatiladi?", options:["Tugallangan harakat","O'tmishdagi davomli holat/odat","Kelajak","Buyruq"], answer:1, explanation:"Imparfait o'tmishdagi davomli holat va odatlarni ifodalaydi." },
      { q:"Conditionnel présent tuzilishi?", options:["Infinitif + -ais","Infinitif + -erai","Présent + -rait","Futur + -ais"], answer:0, explanation:"Conditionnel = infinitif + imparfait qo'shimchalari (-ais, -ais, -ait...)." },
      { q:"Ne...pas nima uchun?", options:["Savol","Inkor","Ta'kid","Ko'plik"], answer:1, explanation:"Ne...pas inkor konstruksiyasi: Je ne sais pas." },
    ],
    Qiyin: [
      { q:"Subjonctif qaysi dan keyin?", options:["Je pense que","Il est certain que","Je veux que","Je sais que"], answer:2, explanation:"Vouloir que dan keyin subjonctif." },
      { q:"COD va COI farqi?", options:["Farqi yo'q","COD to'g'ridan, COI bilvosita","COI ega","COD fe'l"], answer:1, explanation:"COD to'g'ridan ob'ekt, COI bilvosita ob'ekt." },
      { q:"Plus-que-parfait nima ifodalaydi?", options:["Hozirgi holat","O'tmishdagi boshqa o'tmish harakatdan oldingi harakat","Kelajak","Davomli holat"], answer:1, explanation:"Plus-que-parfait o'tgan zamondagi boshqa harakatdan oldin sodir bo'lgan harakat." },
      { q:"Gérondif qanday yasaladi?", options:["en + participe présent","de + infinitif","pour + infinitif","à + infinitif"], answer:0, explanation:"Gérondif: en + participe présent (en mangeant = yeyish paytida)." },
      { q:"Discours indirect (indirect speech) qanday o'zgaradi?", options:["O'zgarmaydi","Zamon bir orqaga suriladi","Zamon oldinga suriladi","Savol belgisi qo'shiladi"], answer:1, explanation:"Indirect speech da zamon bir orqaga suriladi: dit → disait." },
      { q:"Accord du participe passé avec avoir qachon?", options:["Har doim","Hech qachon","COD oldinda kelsa","Sujet bilan"], answer:2, explanation:"avoir bilan participe passé faqat COD oldinda kelganda bilan moslashadi." },
    ],
  },
};

const generateAIQuestion = async (category, difficulty, usedQuestionTexts = []) => {
  if (!GEMINI_API_KEY) return null;

  // Barcha ishlatilgan savollarni AI ga yuboramiz
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
    if (!res.ok) throw new Error("API xatolik");
    const data   = await res.json();
    const raw    = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    if (!parsed.q || !Array.isArray(parsed.options) || parsed.options.length !== 4) {
      throw new Error("Format xato");
    }
    return parsed;
  } catch {
    return null; // null qaytarsa static ishlatiladi
  }
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
  const [stats,   setStats]   = useState({ quizAvg: null, xp: 0, highScores: {} });
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
      } catch { /* non-critical */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user]);
  return { stats, loading };
};

const DiffBadge = memo(({ difficulty }) => (
  <span style={{ display:"inline-block", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:(DIFF_COLOR[difficulty]||"#3b82f6")+"22", color:DIFF_COLOR[difficulty]||"#3b82f6", border:`1px solid ${(DIFF_COLOR[difficulty]||"#3b82f6")}44` }}>
    {difficulty}
  </span>
));

const ExplanationBox = memo(({ explanation, darkMode }) => {
  if (!explanation) return null;
  return (
    <div style={{ marginTop:12, padding:"12px 14px", borderRadius:10, background:darkMode?"#1e3a5f":"#eff6ff", border:`1px solid ${darkMode?"#1d4ed8":"#bfdbfe"}` }}>
      <p style={{ margin:0, fontSize:12, color:darkMode?"#93c5fd":"#1d4ed8", lineHeight:1.6 }}>💡 {explanation}</p>
    </div>
  );
});

const Quiz = ({ darkMode, showToast }) => {
  const { user }           = useAuth();
  const { stats, loading } = useUserStats(user);

  const [screen,        setScreen]        = useState("select");
  const [category,      setCategory]      = useState(null);
  const [currentDiff,   setCurrentDiff]   = useState("Oson");
  const [questions,     setQuestions]     = useState([]);
  const [currentQ,      setCurrentQ]      = useState(0);
  const [selected,      setSelected]      = useState(null);
  const [answers,       setAnswers]       = useState([]);
  const [timeLeft,      setTimeLeft]      = useState(TIMER);
  const [streak,        setStreak]        = useState(0);
  const [resultData,    setResultData]    = useState(null);
  const [loadingQ,      setLoadingQ]      = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);

  const timerRef   = useRef(null);
  const savingRef  = useRef(false);
  const pendingRef = useRef(null);

  const initialDiff = useMemo(() => getDifficultyFromScore(stats.quizAvg), [stats.quizAvg]);

  const fetchNextQuestion = useCallback(async (cat, diff, usedQs = []) => {
    // 1. Avval AI dan so'raymiz — barcha ishlatilgan savollarni beramiz
    if (GEMINI_API_KEY) {
      const aiQ = await generateAIQuestion(cat, diff, usedQs);
      if (aiQ) {
        return shuffleOptions({ ...aiQ, category: cat, difficulty: diff });
      }
    }

    // 2. AI ishlamasa — static pool dan ishlatilmaganini olamiz
  const pool   = STATIC_QUESTIONS[cat]?.[diff] || STATIC_QUESTIONS[cat]?.["Oson"] || [];
  const unused = pool.filter(q => !usedQs.includes(q.q));
  const source = unused.length > 0 ? unused : pool;
  const picked = source[Math.floor(Math.random() * source.length)];
  return picked ? shuffleOptions({ ...picked, category: cat, difficulty: diff }) : null;
}, []);

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
    savingRef.current = false;

    const firstQ = await fetchNextQuestion(cat, initialDiff, []);
    if (!firstQ) { showToast?.("Savol yuklanmadi.", "error"); setLoadingQ(false); return; }

    setQuestions([firstQ]);
    setUsedQuestions([firstQ.q]);
    setTimeLeft(TIMER);
    setLoadingQ(false);
    setScreen("playing");
  }, [initialDiff, fetchNextQuestion, showToast]);

  const handleAnswer = useCallback((idx) => {
    setSelected((prev) => {
      if (prev !== null) return prev;
      clearInterval(timerRef.current);
      pendingRef.current = null;
      return idx;
    });
  }, []);

  const saveResult = useCallback(async (pct, score, totalQ, cat) => {
    if (!user || savingRef.current) return;
    savingRef.current = true;
    try {
      const statsRef  = doc(db, "users", user.uid, "data", "stats");
      const statsSnap = await getDoc(statsRef);
      const old       = statsSnap.exists() ? statsSnap.data() : {};
      const oldCount  = old.quizCount || 0;
      const newAvg    = Math.round(((old.quizAvg || 0) * oldCount + pct) / (oldCount + 1));
      const xpGained  = score * 5;
      const prevHS    = old.highScores?.[cat] || 0;
      const newHS     = score > prevHS ? score : prevHS;
      await setDoc(statsRef, {
        xp:(old.xp||0)+xpGained, quizAvg:newAvg, quizCount:oldCount+1,
        highScores:{...(old.highScores||{}), [cat]:newHS},
      }, { merge:true });
      await setDoc(doc(db,"users",user.uid),{xp:increment(xpGained),quizAvg:newAvg},{merge:true});
      showToast?.(`+${xpGained} XP qo'shildi! ✅`, "success");
    } catch (err) { console.error(err); }
    finally { savingRef.current = false; }
  }, [user, showToast]);

  const handleNext = useCallback(async (timeout = false) => {
    clearInterval(timerRef.current);
    setAnswers((prevAnswers) => {
      const q         = questions[currentQ];
      const isCorrect = !timeout && selected === q?.answer;
      const newAnswers = [...prevAnswers, {
        correct:isCorrect, selected, timeout,
        q:q?.q, userAnswer:q?.options?.[selected],
        correct_ans:q?.options?.[q?.answer], explanation:q?.explanation,
      }];
      pendingRef.current = { newAnswers, isCorrect, currentQ };
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
      const pct   = Math.round((score / newAnswers.length) * 100);
      setResultData({ score, pct, answers:newAnswers, questions:questions.slice(0, newAnswers.length) });
      setScreen("result");
      showToast?.(`Test tugadi! ${score}/${newAnswers.length} ✅`, pct >= 60 ? "success" : "error");
      saveResult(pct, score, newAnswers.length, category);
    } else {
      const newDiff = isCorrect
        ? (newStreak >= 2 ? escalateDifficulty(currentDiff) : currentDiff)
        : deescalateDifficulty(currentDiff);
      setCurrentDiff(newDiff);
      setLoadingQ(true);
      setCurrentQ(cq + 1);
      setSelected(null);
      setTimeLeft(TIMER);

      fetchNextQuestion(category, newDiff, usedQuestions).then((nextQ) => {
        if (nextQ) {
          setQuestions(prev => [...prev, nextQ]);
          setUsedQuestions(prev => [...prev, nextQ.q]);
        }
        setLoadingQ(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  useEffect(() => {
    if (screen !== "playing" || selected !== null || loadingQ) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { handleNext(true); return TIMER; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, selected, currentQ, loadingQ, handleNext]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const card = darkMode ? "#1e293b" : "#ffffff";
  const bdr  = darkMode ? "#334155" : "#e2e8f0";
  const txt  = darkMode ? "#f1f5f9" : "#111827";
  const sub  = darkMode ? "#94a3b8" : "#6b7280";

  if (screen === "select") return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 20px 80px" }}>
      <ScrollReveal direction="up">
        <div style={{ marginBottom:28 }}>
          <span style={{ display:"inline-block", background:"#eff6ff", color:"#3b82f6", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:10, border:"1px solid #bfdbfe" }}>
            🧠 Adaptiv AI Quiz
          </span>
          <h2 style={{ fontSize:28, fontWeight:800, margin:"0 0 6px", color:txt }}>Bilimingizni sinang</h2>
          <p style={{ color:sub, fontSize:14, margin:0 }}>
            {QUESTIONS_PER_QUIZ} savol · {TIMER}s limit · AI adaptiv qiyinlik ·
            {!loading && <strong style={{ color:DIFF_COLOR[initialDiff] }}> Sizning darajangiz: {initialDiff}</strong>}
          </p>
        </div>
      </ScrollReveal>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))", gap:14 }}>
        {CATEGORIES.map((cat, i) => {
          const cfg = CATEGORY_CONFIG[cat];
          const hs  = stats.highScores?.[cat] || 0;
          return (
            <ScrollReveal key={cat} direction="up" delay={i * 60}>
              <div onClick={() => startQuiz(cat)}
                style={{ background:card, border:`1px solid ${bdr}`, borderRadius:16, padding:"22px 18px", cursor:"pointer", textAlign:"center", transition:"all 0.25s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 10px 30px ${cfg.color}22`; e.currentTarget.style.borderColor=cfg.color+"66"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; e.currentTarget.style.borderColor=bdr; }}>
                <div style={{ fontSize:38, marginBottom:10 }}>{cfg.icon}</div>
                <p style={{ margin:"0 0 6px", fontWeight:700, fontSize:15, color:txt }}>{cat}</p>
                {hs > 0 && <p style={{ margin:0, fontSize:11, color:cfg.color, fontWeight:600 }}>🏆 Eng yuqori: {hs}/{QUESTIONS_PER_QUIZ}</p>}
                <p style={{ margin:"4px 0 0", fontSize:11, color:sub }}>AI adaptiv savol</p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );

  if (screen === "playing") {
    const q          = questions[currentQ];
    const timerColor = timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f59e0b" : "#10b981";
    const cfg        = CATEGORY_CONFIG[category] || { color:"#6366f1" };
    return (
      <div style={{ maxWidth:640, margin:"0 auto", padding:"40px 20px 80px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <button onClick={() => { clearInterval(timerRef.current); setScreen("select"); }}
            style={{ background:"none", border:"none", cursor:"pointer", color:"#3b82f6", fontSize:14, fontWeight:600, padding:0 }}>
            ← Chiqish
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {streak >= 2 && <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:13, fontWeight:700, color:"#f59e0b" }}><LuFlame size={14}/> {streak} ketma-ket!</span>}
            <DiffBadge difficulty={currentDiff}/>
            <span style={{ fontSize:13, color:sub }}>{Math.min(currentQ+1,QUESTIONS_PER_QUIZ)}/{QUESTIONS_PER_QUIZ}</span>
          </div>
        </div>

        <div style={{ height:5, background:bdr, borderRadius:3, marginBottom:6, overflow:"hidden" }}>
          <div style={{ height:"100%", background:cfg.color, width:`${(currentQ/QUESTIONS_PER_QUIZ)*100}%`, transition:"width 0.4s", borderRadius:3 }}/>
        </div>
        <div style={{ height:5, background:bdr, borderRadius:3, marginBottom:22, overflow:"hidden" }}>
          <div style={{ height:"100%", background:timerColor, width:`${(timeLeft/TIMER)*100}%`, transition:"width 1s linear", borderRadius:3 }}/>
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ fontSize:12, fontWeight:700, color:sub }}>{CATEGORY_CONFIG[category]?.icon} {category}</span>
          <span style={{ fontSize:22, fontWeight:900, color:timerColor, minWidth:40, textAlign:"right" }}>{timeLeft}s</span>
        </div>

        {loadingQ ? (
          <div style={{ background:card, border:`1px solid ${bdr}`, borderRadius:14, padding:40, textAlign:"center", marginBottom:20 }}>
            <LuBrain size={28} color="#6366f1" style={{ animation:"spin 0.8s linear infinite", marginBottom:10 }}/>
            <p style={{ margin:0, color:sub, fontSize:13 }}>AI savol generatsiya qilmoqda...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : q ? (
          <>
            <div style={{ background:card, border:`1px solid ${bdr}`, borderRadius:14, padding:22, marginBottom:16 }}>
              <p style={{ margin:0, fontWeight:700, fontSize:17, color:txt, lineHeight:1.6 }}>{currentQ+1}. {q.q}</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {q.options.map((opt, i) => {
                let optBg=card, optBdr=bdr, optColor=txt;
                if (selected !== null) {
                  if (i === q.answer)                        { optBg="#d1fae5"; optBdr="#10b981"; optColor="#065f46"; }
                  else if (i===selected && i!==q.answer) { optBg="#fee2e2"; optBdr="#ef4444"; optColor="#991b1b"; }
                }
                const dotBg    = selected!==null&&i===q.answer?"#10b981":selected!==null&&i===selected?"#ef4444":darkMode?"#334155":"#f3f4f6";
                const dotColor = selected!==null&&(i===q.answer||i===selected)?"#fff":sub;
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={selected!==null}
                    style={{ padding:"13px 16px", borderRadius:12, border:`2px solid ${optBdr}`, background:optBg, color:optColor, fontSize:14, fontWeight:500, cursor:selected!==null?"default":"pointer", textAlign:"left", transition:"all 0.2s", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ width:26, height:26, borderRadius:"50%", background:dotBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0, color:dotColor }}>
                      {selected!==null&&i===q.answer?"✓":selected!==null&&i===selected?"✗":String.fromCharCode(65+i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <>
                <ExplanationBox explanation={q.explanation} darkMode={darkMode}/>
                <button onClick={() => handleNext()}
                  style={{ marginTop:14, width:"100%", padding:"14px 0", background:"#3b82f6", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  {currentQ+1<QUESTIONS_PER_QUIZ?<><LuChevronRight size={18}/> Keyingisi</>:<><LuTrophy size={18}/> Natija</>}
                </button>
              </>
            )}
          </>
        ) : (
          <div style={{ textAlign:"center", padding:40 }}>
            <p style={{ color:sub }}>Savol yuklanmadi. <button onClick={() => setScreen("select")} style={{ background:"none", border:"none", color:"#3b82f6", cursor:"pointer" }}>Qaytish</button></p>
          </div>
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (screen === "result" && resultData) {
    const { score, pct, answers:ans, questions:qs } = resultData;
    const emoji   = pct===100?"🏆":pct>=80?"🎉":pct>=60?"👍":pct>=40?"📚":"💪";
    const msg     = pct===100?"Mukammal!":pct>=80?"Ajoyib natija!":pct>=60?"Yaxshi!":"Ko'proq o'qish kerak!";
    const prevHS  = stats.highScores?.[category] || 0;
    const isNewHS = score > prevHS;
    return (
      <div style={{ maxWidth:580, margin:"0 auto", padding:"40px 20px 80px", textAlign:"center" }}>
        <ScrollReveal direction="up">
          <div style={{ fontSize:64, marginBottom:10 }}>{emoji}</div>
          {isNewHS && <div style={{ fontSize:12, fontWeight:700, color:"#f59e0b", marginBottom:6, background:"#fef3c7", borderRadius:20, display:"inline-block", padding:"3px 12px" }}>🏆 Yangi rekord!</div>}
          <h2 style={{ fontSize:26, fontWeight:800, color:txt, margin:"0 0 4px" }}>{msg}</h2>
          <p style={{ color:sub, fontSize:14, marginBottom:24 }}>{category} testi · Daraja: {currentDiff}</p>

          <div style={{ width:130, height:130, borderRadius:"50%", border:`8px solid ${pct>=60?"#3b82f6":"#ef4444"}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto 28px" }}>
            <span style={{ fontSize:32, fontWeight:800, color:pct>=60?"#3b82f6":"#ef4444" }}>{pct}%</span>
            <span style={{ fontSize:12, color:sub }}>{score}/{qs.length}</span>
          </div>

          <div style={{ background:card, border:`1px solid ${bdr}`, borderRadius:14, padding:"16px 20px", marginBottom:24, textAlign:"left" }}>
            {qs.map((q, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, paddingBottom:i<qs.length-1?12:0, borderBottom:i<qs.length-1?`1px solid ${bdr}`:"none", marginBottom:i<qs.length-1?12:0 }}>
                <span style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, background:ans[i]?.correct?"#d1fae5":"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:ans[i]?.correct?"#065f46":"#991b1b", fontWeight:700 }}>
                  {ans[i]?.correct?"✓":"✗"}
                </span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
                    <p style={{ margin:0, fontSize:13, color:txt }}>{q.q}</p>
                    <DiffBadge difficulty={q.difficulty||currentDiff}/>
                  </div>
                  {!ans[i]?.correct && <p style={{ margin:"2px 0 0", fontSize:11, color:"#10b981" }}>To'g'ri: {q.options?.[q.answer]}</p>}
                  {ans[i]?.timeout   && <p style={{ margin:"2px 0 0", fontSize:11, color:"#f59e0b" }}>⏱ Vaqt tugadi</p>}
                  {ans[i]?.explanation && <p style={{ margin:"4px 0 0", fontSize:11, color:sub, fontStyle:"italic" }}>💡 {ans[i].explanation}</p>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button onClick={() => startQuiz(category)}
              style={{ flex:1, padding:"12px 0", background:"#3b82f6", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <LuRefreshCw size={15}/> Qayta
            </button>
            <button onClick={() => setScreen("select")}
              style={{ flex:1, padding:"12px 0", background:"transparent", color:sub, border:`1px solid ${bdr}`, borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer" }}>
              Boshqa
            </button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return null;
};

export default memo(Quiz);