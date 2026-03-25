import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "../context/useLang";
import { LuPlay, LuTrash2, LuSave, LuRotateCcw } from "react-icons/lu";
import { VscCode } from "react-icons/vsc";
import Editor from "@monaco-editor/react";

// ── Til konfiguratsiyalari ──────────────────────────────────────────────────
const LANGUAGES = [
  {
    id: "html",
    label: "HTML",
    monacoLang: "html",
    filename: "index.html",
    default: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <title>Hello</title>
</head>
<body>
  <h1>Hello World!</h1>
  <p>Bu mening birinchi sahifam</p>
</body>
</html>`,
  },
  {
    id: "css",
    label: "HTML + CSS",
    monacoLang: "html",
    filename: "style.html",
    default: `<!DOCTYPE html>
<html lang="uz">
<head>
<style>
  body {
    font-family: sans-serif;
    background: #1e1e2e;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
  }
  h1 { color: #89b4fa; }
  button {
    background: #89b4fa;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    color: #1e1e2e;
    font-weight: bold;
    transition: opacity 0.2s;
  }
  button:hover { opacity: 0.85; }
</style>
</head>
<body>
  <div>
    <h1>Salom Dunyo!</h1>
    <button onclick="alert('Bosildi!')">Bosing</button>
  </div>
</body>
</html>`,
  },
  {
    id: "js",
    label: "JavaScript",
    monacoLang: "javascript",
    filename: "script.js",
    default: `// JavaScript misoli
const numbers = [1, 2, 3, 4, 5];

const evens = numbers.filter(n => n % 2 === 0);
console.log("Juft sonlar:", evens);

const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Yig'indi:", sum);

const greet = (name) => \`Salom, \${name}!\`;
console.log(greet("Dunyo"));

// Arrow function + destructuring
const person = { name: "Ali", age: 25 };
const { name, age } = person;
console.log(\`\${name} \${age} yoshda\`);`,
  },
];

// ── LocalStorage yordamchi funksiyalar ──────────────────────────────────────
const LS_KEY = "code_editor_v2";

function loadFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // storage to'liq bo'lishi mumkin
  }
}

// ── Monaco Editor sozlamalari ───────────────────────────────────────────────
const MONACO_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontLigatures: true,
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on",
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  autoClosingTags: "always",
  autoIndent: "full",
  formatOnType: true,
  formatOnPaste: true,
  tabSize: 2,
  insertSpaces: true,
  suggestOnTriggerCharacters: true,
  quickSuggestions: {
    other: true,
    comments: false,
    strings: true,
  },
  parameterHints: { enabled: true },
  folding: true,
  foldingStrategy: "indentation",
  renderLineHighlight: "gutter",
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  padding: { top: 16, bottom: 16 },
  lineNumbersMinChars: 3,
  glyphMargin: false,
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
    useShadows: false,
  },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  renderWhitespace: "selection",
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    indentation: true,
  },
};

// ── Emmet-ga o'xshash oddiy snippet kengaytiruvchi ─────────────────────────
function handleEmmet(monaco, editor, langId) {
  if (langId !== "html" && langId !== "css") return false;

  const model = editor.getModel();
  const position = editor.getPosition();
  const lineContent = model.getLineContent(position.lineNumber);
  const textBefore = lineContent.substring(0, position.column - 1).trimStart();

  // Oddiy Emmet snippetlar
  const emmetMap = {
    "!": `<!DOCTYPE html>\n<html lang="uz">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Document</title>\n</head>\n<body>\n  $0\n</body>\n</html>`,
    "html:5": `<!DOCTYPE html>\n<html lang="uz">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Document</title>\n</head>\n<body>\n  $0\n</body>\n</html>`,
  };

  // div.classname yoki tag#id kabi pattern
  const emmetRegex = /^([a-z][a-z0-9]*)?([.#][a-z0-9_-]+)*$/i;

  let expanded = null;

  if (emmetMap[textBefore]) {
    expanded = emmetMap[textBefore];
  } else if (emmetRegex.test(textBefore) && textBefore.length > 0) {
    const tagMatch = textBefore.match(/^([a-z][a-z0-9]*)/i);
    const tag = tagMatch ? tagMatch[1] : "div";
    const classMatch = textBefore.match(/\.([a-z0-9_-]+)/gi);
    const idMatch = textBefore.match(/#([a-z0-9_-]+)/i);

    let attrs = "";
    if (classMatch) attrs += ` class="${classMatch.map((c) => c.slice(1)).join(" ")}"`;
    if (idMatch) attrs += ` id="${idMatch[1]}"`;

    const selfClosing = ["input", "img", "br", "hr", "meta", "link"].includes(tag);
    expanded = selfClosing
      ? `<${tag}${attrs} />`
      : `<${tag}${attrs}>\n  $0\n</${tag}>`;
  }

  if (!expanded) return false;

  // Joriy qatorni almashtir
  const lineStart = { lineNumber: position.lineNumber, column: 1 };
  const lineEnd = { lineNumber: position.lineNumber, column: lineContent.length + 1 };
  const indent = lineContent.match(/^(\s*)/)[1];
  const indented = expanded
    .split("\n")
    .map((l, i) => (i === 0 ? l : indent + l))
    .join("\n");

  editor.executeEdits("emmet", [
    {
      range: new monaco.Range(
        lineStart.lineNumber,
        1,
        lineEnd.lineNumber,
        lineEnd.column
      ),
      text: indented,
    },
  ]);

  // Kursorni $0 joylashuviga qo'y
  const lines = indented.split("\n");
  let cursorLine = position.lineNumber;
  let cursorCol = 1;
  for (let i = 0; i < lines.length; i++) {
    const idx = lines[i].indexOf("$0");
    if (idx !== -1) {
      cursorLine = position.lineNumber + i;
      cursorCol = idx + 1;
      lines[i] = lines[i].replace("$0", "");
      break;
    }
  }
  editor.setPosition({ lineNumber: cursorLine, column: cursorCol });
  return true;
}

// ── Asosiy komponent ────────────────────────────────────────────────────────
const CodeEditor = ({ darkMode }) => {
  const { t } = useLang();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // State — faqat client-side yuklanganidan keyin localStorage dan o'qiymiz
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState("html");
  const [codes, setCodes] = useState(() =>
    Object.fromEntries(LANGUAGES.map((l) => [l.id, l.default]))
  );
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [saved, setSaved] = useState(false);
 const [_editorReady, setEditorReady] = useState(false);

 useEffect(() => {
  const stored = loadFromStorage();
  if (!stored) return;

  // Render siklini ajratib olamiz
  setTimeout(() => {
    if (stored.lang) setLang(stored.lang);
    if (stored.codes) {
      setCodes((prev) => ({ ...prev, ...stored.codes }));
    }
  }, 0);
}, []);
  // ── Avtomatik saqlash (debounced) ────────────────────────────────────────
  useEffect(() => {
  const timer = setTimeout(() => {
    saveToStorage({ lang, codes });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, 800);

  return () => clearTimeout(timer);
}, [lang, codes]);
useEffect(() => {
  const init = () => {
    setMounted(true);
  };

  init();
}, []);

  // ── Til o'zgarganda editor tilini yangilash ──────────────────────────────
  const currentLang = LANGUAGES.find((l) => l.id === lang);

  const handleLangChange = useCallback(
    (id) => {
      setLang(id);
      setOutput("");
    },
    []
  );

  // ── Kodni ishga tushirish ────────────────────────────────────────────────
  const runCode = useCallback(() => {
    setIsRunning(true);
    const currentCode = codes[lang];

    setTimeout(() => {
      const noScrollStyle = `
        <style>
          ::-webkit-scrollbar { display: none; }
          body { scrollbar-width: none; -ms-overflow-style: none; }
        </style>`;

      if (lang === "html" || lang === "css") {
        setOutput(noScrollStyle + currentCode);
      } else {
        const html = `<!DOCTYPE html>
<html>
<head>
${noScrollStyle}
<style>
  body { margin: 0; background: #1e1e2e; }
  pre {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 13px;
    padding: 20px;
    margin: 0;
    min-height: 100vh;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .log   { color: #a6e3a1; }
  .error { color: #f38ba8; }
  .warn  { color: #f9e2af; }
  .info  { color: #89b4fa; }
</style>
</head>
<body>
<script>
  const logs = [];
  const origLog   = console.log;
  const origWarn  = console.warn;
  const origError = console.error;
  const origInfo  = console.info;

  const fmt = (args) => args.map(a =>
    typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
  ).join(' ');

  console.log   = (...a) => { logs.push({ t: 'log',   m: fmt(a) }); origLog(...a);   };
  console.warn  = (...a) => { logs.push({ t: 'warn',  m: fmt(a) }); origWarn(...a);  };
  console.error = (...a) => { logs.push({ t: 'error', m: fmt(a) }); origError(...a); };
  console.info  = (...a) => { logs.push({ t: 'info',  m: fmt(a) }); origInfo(...a);  };

  window.onerror = (msg, src, line, col, err) => {
    logs.push({ t: 'error', m: (err ? err.message : msg) + ' (line ' + line + ')' });
    render();
    return true;
  };

  function render() {
    if (logs.length === 0) {
      document.body.innerHTML = '<pre class="log" style="opacity:0.4">// Chiqish yo\\'q</pre>';
      return;
    }
    document.body.innerHTML =
      '<pre>' +
      logs.map(l => '<span class="' + l.t + '">' +
        (l.t !== 'log' ? '[' + l.t.toUpperCase() + '] ' : '') +
        l.m.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        '</span>').join('\\n') +
      '</pre>';
  }

  try {
    ${currentCode}
    render();
  } catch(e) {
    logs.push({ t: 'error', m: e.message });
    render();
  }
</script>
</body>
</html>`;
        setOutput(html);
      }
      setIsRunning(false);
      setActiveTab("output");
    }, 200);
  }, [lang, codes]);

  // ── Monaco mount callback ────────────────────────────────────────────────
  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setEditorReady(true);

    // Tab tugmasi: avval Emmet, keyin oddiy indent
    editor.addCommand(monaco.KeyCode.Tab, () => {
      const currentLangId = LANGUAGES.find(
        (l) => l.id === lang
      )?.monacoLang;
      const expanded = handleEmmet(monaco, editor, currentLangId || lang);
      if (!expanded) {
        editor.trigger("keyboard", "tab", {});
      }
    });

    // Ctrl+Enter: kodni ishga tushirish
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      runCode
    );

    // Ctrl+S: saqlash
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction("editor.action.formatDocument")?.run();
    });

    // HTML/CSS uchun qo'shimcha completions
    monaco.languages.registerCompletionItemProvider("html", {
      triggerCharacters: ["<", ".", "#", " "],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const htmlTags = [
          "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
          "a", "img", "ul", "ol", "li", "table", "tr", "td", "th",
          "form", "input", "button", "select", "option", "textarea",
          "header", "footer", "nav", "main", "section", "article",
          "aside", "figure", "figcaption", "video", "audio", "canvas",
          "script", "style", "link", "meta",
        ];

        const suggestions = htmlTags.map((tag) => ({
          label: tag,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: `<${tag}>$0</${tag}>`,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          detail: `<${tag}> HTML elementi`,
        }));

        // Emmet shortcut-lar
        const emmetSnippets = [
          {
            label: "!",
            detail: "HTML5 boilerplate",
            insertText:
              "<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>$1</title>\n</head>\n<body>\n  $0\n</body>\n</html>",
          },
          {
            label: "div.container",
            detail: "div with class",
            insertText: '<div class="container">\n  $0\n</div>',
          },
          {
            label: "ul>li*3",
            detail: "list with 3 items",
            insertText:
              "<ul>\n  <li>$1</li>\n  <li>$2</li>\n  <li>$3</li>\n</ul>",
          },
        ];

        emmetSnippets.forEach((s) =>
          suggestions.push({
            label: s.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: s.insertText,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: s.detail,
            sortText: "0" + s.label,
          })
        );

        return { suggestions };
      },
    });
  }, [lang, runCode]);

  // ── Kod o'zgarganda state ni yangilash ───────────────────────────────────
  const handleCodeChange = useCallback(
    (value) => {
      setCodes((prev) => ({ ...prev, [lang]: value ?? "" }));
    },
    [lang]
  );

  // ── Kodni reset qilish ───────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    const def = LANGUAGES.find((l) => l.id === lang)?.default ?? "";
    setCodes((prev) => ({ ...prev, [lang]: def }));
  }, [lang]);

  // ── Server-side rendering paytida hech narsa ko'rsatmaymiz ───────────────
  if (!mounted) return null;

  const code = codes[lang] ?? "";

  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] flex flex-col mt-7`}>

      {/* ══ Header ══════════════════════════════════════════════════════════ */}
      <div
        className={`flex flex-col gap-2.5 px-4 py-3 border-b ${
          darkMode ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"
        }`}
      >
        {/* 1-qator: sarlavha + tugmalar */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-blue-400 flex items-center gap-2 tracking-wide">
            <VscCode className="text-blue-400" size={18} />
            {t.codeTitle}
            {/* Saqlash indikatori */}
            <span
              className={`text-xs font-normal transition-opacity duration-300 ${
                saved ? "opacity-100 text-green-400" : "opacity-0"
              }`}
            >
              ✓ Saqlandi
            </span>
          </span>

          <div className="flex items-center gap-2">
            {/* Reset tugmasi */}
            <button
              onClick={handleReset}
              title="Kodni boshlang'ich holatga qaytarish"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                darkMode
                  ? "border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-400"
                  : "border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
              }`}
            >
              <LuRotateCcw size={12} />
              Reset
            </button>

            {/* Run tugmasi */}
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-500/20"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.running ?? "Yuklanmoqda..."}
                </>
              ) : (
                <>
                  <LuPlay size={13} />
                  {t.runCode ?? "Ishga tushirish"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-qator: til tanlash + fayl nomi */}
        <div className="flex items-center gap-3">
          <div
            className={`flex rounded-lg overflow-hidden border ${
              darkMode ? "border-slate-700" : "border-gray-200"
            }`}
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => handleLangChange(l.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                  lang === l.id
                    ? "bg-blue-500 text-white"
                    : darkMode
                    ? "text-gray-400 hover:bg-slate-700 hover:text-gray-200"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <span
            className={`text-xs font-mono px-2.5 py-1 rounded-md ${
              darkMode
                ? "bg-slate-800 text-slate-400"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {currentLang?.filename}
          </span>

          <span
            className={`ml-auto text-xs hidden sm:block ${
              darkMode ? "text-slate-600" : "text-gray-400"
            }`}
          >
            {t.shortcut ?? "Ctrl+Enter — ishga tushirish"}
          </span>
        </div>
      </div>

      {/* ══ Mobile tab ══════════════════════════════════════════════════════ */}
      <div
        className={`md:hidden flex border-b ${
          darkMode ? "border-slate-700" : "border-gray-200"
        }`}
      >
        {["editor", "output"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold transition ${
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : darkMode
                ? "text-slate-500 hover:text-slate-300"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "editor"
              ? (t.codeTitle ?? "Kod")
              : (t.output ?? "Natija")}
          </button>
        ))}
      </div>

      {/* ══ Editor + Output ═════════════════════════════════════════════════ */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ height: "calc(100vh - 210px)" }}
      >
        {/* ── Monaco Editor paneli ─────────────────────────────────────── */}
        <div
          className={`${
            activeTab === "output" ? "hidden" : "flex"
          } md:flex flex-col w-full md:w-1/2 border-r ${
            darkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          {/* Editor toolbar */}
          <div
            className={`flex items-center gap-1.5 px-4 py-2 border-b ${
              darkMode
                ? "bg-slate-900 border-slate-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            <span
              className={`ml-3 text-xs font-mono ${
                darkMode ? "text-slate-500" : "text-gray-400"
              }`}
            >
              {currentLang?.filename}
            </span>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={currentLang?.monacoLang ?? "html"}
              value={code}
              theme="vs-dark"
              options={MONACO_OPTIONS}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              loading={
                <div
                  className={`flex items-center justify-center h-full text-sm ${
                    darkMode ? "text-slate-500 bg-slate-900" : "text-gray-400 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Editor yuklanmoqda...
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* ── Natija paneli ───────────────────────────────────────────── */}
        <div
          className={`${
            activeTab === "editor" ? "hidden" : "flex"
          } md:flex flex-col w-full md:w-1/2`}
        >
          {/* Output toolbar */}
          <div
            className={`flex items-center gap-2 px-4 py-2 border-b ${
              darkMode
                ? "bg-slate-900 border-slate-700 text-slate-400"
                : "bg-gray-50 border-gray-200 text-gray-500"
            }`}
          >
            <span className="text-xs font-semibold">
              {t.output ?? "Natija"}
            </span>
            {output && (
              <button
                onClick={() => setOutput("")}
                className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition"
              >
                <LuTrash2 size={12} />
                {t.clearOutput ?? "Tozalash"}
              </button>
            )}
          </div>

          {/* Natija maydoni */}
          {output ? (
            <iframe
              key={output}
              srcDoc={output}
              className="flex-1 w-full border-0"
              sandbox="allow-scripts"
              title="output"
            />
          ) : (
            <div
              className={`flex-1 flex flex-col items-center justify-center gap-3 select-none ${
                darkMode ? "bg-slate-900 text-slate-600" : "bg-gray-50 text-gray-400"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  darkMode ? "bg-slate-800" : "bg-gray-100"
                }`}
              >
                <LuPlay size={22} className="text-emerald-400 ml-0.5" />
              </div>
              <p className="text-sm font-medium">
                {t.writeCode ?? "Kodni yozing va ishga tushiring"}
              </p>
              <p
                className={`text-xs ${
                  darkMode ? "text-slate-700" : "text-gray-300"
                }`}
              >
                {t.shortcut ?? "Ctrl + Enter"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;