import React, { useState } from "react";
import {
  Copy,
  Check,
  Download,
  Terminal,
  FileCode2,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  MousePointer
} from "lucide-react";
import { ScriptConfig } from "../types";
import { generatePythonScript, downloadTextFile } from "../utils/scriptGenerator";

interface CodeViewProps {
  config: ScriptConfig;
}

export function CodeView({ config }: CodeViewProps) {
  const [copied, setCopied] = useState(false);
  const [selectedExplainer, setSelectedExplainer] = useState<"capture" | "overlay" | "gemini" | "bridge">("capture");

  const pythonCode = generatePythonScript(config);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pythonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownloadPy = () => {
    downloadTextFile("browser_ai_hud.py", pythonCode);
  };

  const handleDownloadBat = () => {
    const batContent = `@echo off
chcp 65001 >nul
title AI Browser HUD Assistant Launcher
echo ========================================================
echo   AI Browser HUD Assistant (Windows 10/11)
echo   Проверка окружения и запуск...
echo ========================================================
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ВНИМАНИЕ] Рекомендуется запуск от имени Администратора!
    echo Библиотека "keyboard" требует прав Администратора для перехвата
    echo глобальных хоткеев (Alt+Shift+S) в Windows.
    echo.
)

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Python не найден в системе!
    echo Установите Python 3.10+ с python.org (поставьте галочку "Add to PATH").
    pause
    exit /b
)

echo [1/2] Проверка зависимостей...
pip install PyQt6 google-genai pywin32 pillow keyboard --quiet

echo [2/2] Запуск AI Browser HUD Assistant...
python browser_ai_hud.py

pause
`;
    downloadTextFile("run.bat", batContent);
  };

  const handleDownloadRequirements = () => {
    downloadTextFile(
      "requirements.txt",
      "PyQt6>=6.6.0\ngoogle-genai>=2.4.0\npywin32>=306\npillow>=10.0.0\nkeyboard>=0.13.5\n"
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-white font-semibold text-base">browser_ai_hud.py</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Python 3.10+ • Windows 10/11
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Готовый к запуску файл со всеми оптимизациями, Win32 захватом памяти и Click-Through оверлеем.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-medium border border-slate-700 transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? "Скопировано!" : "Копировать код"}</span>
          </button>

          <button
            onClick={handleDownloadPy}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs md:text-sm font-medium transition active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Скачать browser_ai_hud.py</span>
          </button>

          <button
            onClick={handleDownloadBat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="Скачать удобный лаунчер run.bat"
          >
            <span>run.bat</span>
          </button>

          <button
            onClick={handleDownloadRequirements}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="Скачать requirements.txt"
          >
            <span>requirements.txt</span>
          </button>
        </div>
      </div>

      {/* Deep-Dive Architectural Explanations */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Ключевые технические решения в коде</span>
          </h3>
          <span className="text-[11px] text-slate-400">Выберите блок для деталей:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => setSelectedExplainer("capture")}
            className={`p-2.5 rounded-lg border text-left transition ${
              selectedExplainer === "capture"
                ? "bg-slate-800 border-sky-500/50 text-white"
                : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
              <Layers className="w-3.5 h-3.5" />
              <span>1. Захват окна</span>
            </div>
            <p className="text-[11px] mt-0.5 truncate text-slate-400">PrintWindow & PW_RENDERFULLCONTENT</p>
          </button>

          <button
            onClick={() => setSelectedExplainer("overlay")}
            className={`p-2.5 rounded-lg border text-left transition ${
              selectedExplainer === "overlay"
                ? "bg-slate-800 border-emerald-500/50 text-white"
                : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <MousePointer className="w-3.5 h-3.5" />
              <span>2. Click-Through</span>
            </div>
            <p className="text-[11px] mt-0.5 truncate text-slate-400">WS_EX_TRANSPARENT + LAYERED</p>
          </button>

          <button
            onClick={() => setSelectedExplainer("gemini")}
            className={`p-2.5 rounded-lg border text-left transition ${
              selectedExplainer === "gemini"
                ? "bg-slate-800 border-purple-500/50 text-white"
                : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. Gemini 2.5 Flash</span>
            </div>
            <p className="text-[11px] mt-0.5 truncate text-slate-400">BytesIO JPEG & Multi-thread</p>
          </button>

          <button
            onClick={() => setSelectedExplainer("bridge")}
            className={`p-2.5 rounded-lg border text-left transition ${
              selectedExplainer === "bridge"
                ? "bg-slate-800 border-amber-500/50 text-white"
                : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. Потокобезопасность</span>
            </div>
            <p className="text-[11px] mt-0.5 truncate text-slate-400">QObject pyqtSignal мост</p>
          </button>
        </div>

        {/* Selected Explanation Detail */}
        <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-2">
          {selectedExplainer === "capture" && (
            <div>
              <p className="text-white font-medium mb-1">
                Как реализован бесшовный скриншот без потери фокуса ввода:
              </p>
              <p>
                1. <code className="text-sky-300">win32gui.GetForegroundWindow()</code> определяет дескриптор (HWND) активного окна, где пользователь сейчас печатает. Никаких вызовов <code className="text-red-300">SetForegroundWindow</code> или эмуляции мыши не происходит!
              </p>
              <p>
                2. Для Chrome / Edge с включенным аппаратным ускорением GPU обычный BitBlt иногда возвращает черный прямоугольник. Поэтому скрипт вызывает <code className="text-sky-300">PrintWindow(hwnd, save_dc, 2)</code> с флагом <code className="text-amber-300">PW_RENDERFULLCONTENT = 2</code>, принудительно копируя актуальный DWM-буфер прямо из видеопамяти.
              </p>
              <p>
                3. Все GDI-объекты (<code className="text-slate-400">DeleteObject</code>, <code className="text-slate-400">DeleteDC</code>, <code className="text-slate-400">ReleaseDC</code>) освобождаются в блоке <code className="text-sky-300">finally</code>, исключая утечки дескрипторов Windows.
              </p>
            </div>
          )}

          {selectedExplainer === "overlay" && (
            <div>
              <p className="text-white font-medium mb-1">
                Как работает сквозной клик (Click-Through) в PyQt6:
              </p>
              <p>
                1. Сразу после создания окна скрипт считывает расширенные стили через <code className="text-emerald-300">win32gui.GetWindowLong(hwnd, GWL_EXSTYLE)</code>.
              </p>
              <p>
                2. Добавляются битовые маски <code className="text-emerald-300">WS_EX_TRANSPARENT | WS_EX_LAYERED</code> через <code className="text-emerald-300">SetWindowLong</code>. Флаг <code className="text-amber-300">WS_EX_TRANSPARENT</code> сообщает ядру Windows (Win32 hit-testing), что все клики мыши, движения и скролл колесиком должны безусловно проваливаться в окно под оверлеем.
              </p>
              <p>
                3. Атрибут <code className="text-emerald-300">WA_ShowWithoutActivating</code> и флаг <code className="text-emerald-300">WindowDoesNotAcceptFocus</code> гарантируют, что когда оверлей появляется, фокус каретки в браузере ни на миллисекунду не прерывается.
              </p>
            </div>
          )}

          {selectedExplainer === "gemini" && (
            <div>
              <p className="text-white font-medium mb-1">
                Оптимизация сетевого запроса к Gemini 2.5 Flash:
              </p>
              <p>
                1. Снимок окна сжимается в <code className="text-purple-300">io.BytesIO</code> в формате JPEG с качеством 85% и пропорциональным ресайзом до 1600px. Это уменьшает объем передачи с ~12 МБ до ~200 КБ, снижая задержку на 400-800 мс.
              </p>
              <p>
                2. Передается в официальный SDK <code className="text-purple-300">google-genai</code> через <code className="text-purple-300">types.Part.from_bytes(..., mime_type="image/jpeg")</code>.
              </p>
              <p>
                3. Запрос выполняется в фоновом <code className="text-purple-300">threading.Thread(daemon=True)</code>, чтобы GUI-поток оверлея не замирал.
              </p>
            </div>
          )}

          {selectedExplainer === "bridge" && (
            <div>
              <p className="text-white font-medium mb-1">
                Потокобезопасная архитектура PyQt6 и Keyboard Hook:
              </p>
              <p>
                1. Библиотека <code className="text-amber-300">keyboard</code> работает в отдельном системном Windows Hook потоке. Если из него напрямую вызывать методы PyQt6 (<code className="text-red-400">show()</code>, <code className="text-red-400">setText()</code>), программа упадет с ошибкой <code className="text-red-300">QObject: Cannot create children for a parent that is in a different thread</code>.
              </p>
              <p>
                2. Мы создали класс <code className="text-amber-300">HotkeyBridge(QObject)</code> с сигналами <code className="text-amber-300">pyqtSignal()</code>. При срабатывании хоткея сигнал автоматически маршалится в главный GUI-цикл событий Qt.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Code Display Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
            <FileCode2 className="w-4 h-4 text-sky-400" />
            <span>browser_ai_hud.py</span>
            <span className="text-slate-400">({pythonCode.split("\n").length} строк)</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Скопировано" : "Копировать"}</span>
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[580px] overflow-y-auto selection:bg-sky-500/30 selection:text-white">
          <code>{pythonCode}</code>
        </pre>
      </div>
    </div>
  );
}
