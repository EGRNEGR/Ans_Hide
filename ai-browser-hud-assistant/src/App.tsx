import React, { useState } from "react";
import {
  Sparkles,
  Command,
  FileCode2,
  Sliders,
  BookOpen,
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Cpu,
  Monitor
} from "lucide-react";
import { ScriptConfig } from "./types";
import { SimulatorView } from "./components/SimulatorView";
import { CodeView } from "./components/CodeView";
import { ConfiguratorView } from "./components/ConfiguratorView";
import { GuideView } from "./components/GuideView";
import { generatePythonScript, downloadTextFile } from "./utils/scriptGenerator";

const DEFAULT_CONFIG: ScriptConfig = {
  apiKey: "",
  model: "gemini-3.6-flash",
  captureHotkey: "ctrl+alt+s",
  audioHotkey: "ctrl+alt+q",
  hideHotkey: "ctrl+alt+c",
  showHotkey: "ctrl+alt+d",
  scrollUpHotkey: "ctrl+alt+z",
  scrollDownHotkey: "ctrl+alt+x",
  systemPrompt:
    "Ты — персональный встроенный ассистент разработчика. Внимательно изучи приложенный скриншот экрана браузера, найди главный вопрос или задачу.\n\nСТРОЖАЙШЕЕ ПРАВИЛО ДЛЯ ЗАДАЧ ПО ПРОГРАММИРОВАНИЮ И КОДИНГУ:\n1. Реализуй решение ИСКЛЮЧИТЕЛЬНО НА ЯЗЫКЕ PYTHON (Python 3), даже если в условии упомянут C++, Java, Pascal или любой другой язык.\n2. Выводи ТОЛЬКО САМ КОД. Запрещены любые комментарии (включая #, docstrings, inline-комментарии).\n3. Запрещены любые вступительные и заключительные фразы, пояснения, рассуждения и markdown-обертки (без 'Вот решение:', 'Сложность O(n)' и т.п.).\n4. Без лишних отступов и пустых строк: код должен быть максимально компактным, синтаксически корректным и готовым к прямому запуску.\n5. Если вопрос чисто теоретический (без кода) — ответь максимально кратко, 1-2 предложениями, только суть.",
  audioPrompt:
    "Ты — персональный тайный ассистент на техническом интервью или встрече в Zoom / Яндекс Телемосте. Тебе передана аудиозапись (или расшифровка речи собеседника/интервьюера из динамиков). Дай ТОЧНЫЙ, ЧЕТКИЙ, БЕЗ ВОДЫ ответ на вопрос собеседника. Если вопрос по кодингу или архитектуре — дай сразу работающий код на Python 3 или четкую структуру тезисов без общих вводных слов и воды.",
  overlayWidth: 500,
  overlayHeight: 330,
  cornerMargin: 24,
  autoHideSeconds: 0,
  position: "bottom-right",
  excludeFromCapture: true,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"simulator" | "code" | "config" | "guide">("simulator");
  const [config, setConfig] = useState<ScriptConfig>(DEFAULT_CONFIG);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleCopyScript = async () => {
    const code = generatePythonScript(config);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadScript = () => {
    const code = generatePythonScript(config);
    downloadTextFile("browser_ai_hud.py", code);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  AI Browser HUD Assistant
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                  gemini-3.6-flash
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Pure Python Code
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Win32 API • 0% потери фокуса • Click-Through HUD • Восстановление ответа по Alt+Shift+D
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              title="Скопировать код browser_ai_hud.py"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedScript ? "Скопировано!" : "Копировать .py"}</span>
            </button>

            <button
              onClick={handleDownloadScript}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shadow-sm transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .py</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 border-t border-slate-800/40">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-medium transition ${
              activeTab === "simulator"
                ? "border-sky-500 text-sky-400 bg-sky-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Интерактивный симулятор</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-medium transition ${
              activeTab === "code"
                ? "border-sky-500 text-sky-400 bg-sky-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Код скрипта Python (.py)</span>
          </button>

          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-medium transition ${
              activeTab === "config"
                ? "border-sky-500 text-sky-400 bg-sky-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Параметры и клавиши</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-medium transition ${
              activeTab === "guide"
                ? "border-sky-500 text-sky-400 bg-sky-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Инструкция запуска в Windows</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === "simulator" && <SimulatorView config={config} />}
        {activeTab === "code" && <CodeView config={config} />}
        {activeTab === "config" && (
          <ConfiguratorView
            config={config}
            onChange={setConfig}
            onReset={() => setConfig(DEFAULT_CONFIG)}
          />
        )}
        {activeTab === "guide" && <GuideView />}
      </main>

      {/* Sticky Bottom Quick Info Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-3 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Модель: <code className="text-sky-300 font-mono">gemini-3.6-flash</code> (строго)
            </span>
            <span className="text-slate-600">•</span>
            <span>Кодинг: только чистый код Python 3</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <span className="text-slate-400">Хоткеи:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300">ALT+SHIFT+S</kbd> снимок
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">ALT+SHIFT+C</kbd> скрыть
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-300">ALT+SHIFT+D</kbd> вернуть
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300">ALT+SHIFT+Z / X</kbd> скролл
          </div>
        </div>
      </footer>
    </div>
  );
}
