import { useState } from "react";

const LANGUAGES = [
  { id: "html", label: "HTML", default: `<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>Bu mening birinchi sahifam</p>\n</body>\n</html>` },
  { id: "css", label: "HTML + CSS", default: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { font-family: sans-serif; background: #1e1e2e; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n  h1 { color: #89b4fa; }\n  button { background: #89b4fa; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; }\n</style>\n</head>\n<body>\n  <div>\n    <h1>Salom Dunyo!</h1>\n    <button onclick="alert('Bosildi!')">Bosing</button>\n  </div>\n</body>\n</html>` },
  { id: "js", label: "JS", default: `// JavaScript misoli\nconst numbers = [1, 2, 3, 4, 5];\n\n// Juft sonlarni filtrlash\nconst evens = numbers.filter(n => n % 2 === 0);\nconsole.log("Juft sonlar:", evens);\n\n// Massiv yig'indisi\nconst sum = numbers.reduce((a, b) => a + b, 0);\nconsole.log("Yig'indi:", sum);\n\n// Arrow function\nconst greet = (name) => \`Salom, \${name}!\`;\nconsole.log(greet("Dunyo"));` },
];

const CodeEditor = ({ darkMode }) => {
  const [lang, setLang] = useState("html");
  const [code, setCode] = useState(LANGUAGES[0].default);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("editor"); // mobile: editor | output


  const handleLangChange = (id) => {
    setLang(id);
    setCode(LANGUAGES.find((l) => l.id === id).default);
    setOutput("");
  };

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      if (lang === "html" || lang === "css") {
        setOutput(code);
      } else if (lang === "js") {
        // JS ni iframe ichida ishlatamiz
        const html = `
          <!DOCTYPE html>
          <html>
          <body>
          <script>
            const originalLog = console.log;
            const logs = [];
            console.log = (...args) => {
              logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
              originalLog(...args);
            };
            try {
              ${code}
              document.body.innerHTML = '<pre style="font-family:monospace;padding:16px;color:#a6e3a1;background:#1e1e2e;margin:0;min-height:100vh">' + logs.join('\\n') + '</pre>';
            } catch(e) {
              document.body.innerHTML = '<pre style="color:#f38ba8;padding:16px;background:#1e1e2e;margin:0;min-height:100vh">Xato: ' + e.message + '</pre>';
            }
          </script>
          </body>
          </html>
        `;
        setOutput(html);
      }
      setIsRunning(false);
      setActiveTab("output");
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = start + 2;
        e.target.selectionEnd = start + 2;
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      runCode();
    }
  };

  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] flex flex-col mt-7 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>

      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-400">💻 Code Editor</span>
        </div>

        {/* Til tanlash */}
        <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-slate-600" : "border-gray-200"}`}>
          {LANGUAGES.map((l) => (
            <button key={l.id} onClick={() => handleLangChange(l.id)}
              className={`px-3 py-1.5 text-xs font-semibold transition ${
                lang === l.id ? "bg-blue-500 text-white" : darkMode ? "text-gray-400 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-100"
              }`}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Run tugmasi */}
        <button onClick={runCode} disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition">
          {isRunning ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : "▶"} Ishga tushir
        </button>
      </div>

      {/* Mobile tab */}
      <div className={`md:hidden flex border-b ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
        <button onClick={() => setActiveTab("editor")}
          className={`flex-1 py-2 text-sm font-semibold transition ${
            activeTab === "editor" ? "text-blue-500 border-b-2 border-blue-500" : darkMode ? "text-gray-500" : "text-gray-400"
          }`}>
          📝 Kod
        </button>
        <button onClick={() => setActiveTab("output")}
          className={`flex-1 py-2 text-sm font-semibold transition ${
            activeTab === "output" ? "text-blue-500 border-b-2 border-blue-500" : darkMode ? "text-gray-500" : "text-gray-400"
          }`}>
          ▶ Natija
        </button>
      </div>

      {/* Editor + Output */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>

        {/* Editor — PC da chap, mobilda tab */}
        <div className={`${activeTab === "output" ? "hidden" : "flex"} md:flex flex-col w-full md:w-1/2 border-r ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
          {/* Fayl nomi */}
          <div className={`flex items-center gap-2 px-4 py-2 border-b text-xs ${darkMode ? "bg-slate-900 border-slate-700 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-2">
              {lang === "html" ? "index.html" : lang === "css" ? "style.html" : "script.js"}
            </span>
            <span className={`ml-auto text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
              Ctrl+Enter = Ishga tushir
            </span>
          </div>

          {/* Code area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Qator raqamlari */}
            <div className={`select-none px-3 py-4 text-right text-xs leading-6 min-w-[40px] ${darkMode ? "bg-slate-900 text-gray-600" : "bg-gray-100 text-gray-400"}`}>
              {code.split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              className={`flex-1 p-4 text-sm font-mono leading-6 resize-none outline-none ${
                darkMode ? "bg-slate-900 text-gray-200" : "bg-white text-gray-800"
              }`}
              style={{ tabSize: 2 }}
            />
          </div>
        </div>

        {/* Output */}
        <div className={`${activeTab === "editor" ? "hidden" : "flex"} md:flex flex-col w-full md:w-1/2`}>
          <div className={`flex items-center gap-2 px-4 py-2 border-b text-xs ${darkMode ? "bg-slate-900 border-slate-700 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
            <span>🌐 Natija</span>
            {output && (
              <button onClick={() => setOutput("")}
                className="ml-auto text-red-400 hover:text-red-300 transition">
                Tozalash
              </button>
            )}
          </div>

          {output ? (
            <iframe
              srcDoc={output}
              className="flex-1 w-full border-0"
              sandbox="allow-scripts"
              title="output"
            />
          ) : (
            <div className={`flex-1 flex flex-col items-center justify-center gap-3 ${darkMode ? "bg-slate-900 text-gray-600" : "bg-gray-50 text-gray-400"}`}>
              <span className="text-5xl">▶</span>
              <p className="text-sm">Kodni yozib "Ishga tushir" bosing</p>
              <p className="text-xs opacity-60">yoki Ctrl+Enter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;