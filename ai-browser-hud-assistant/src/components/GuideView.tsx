import React, { useState } from "react";
import {
  ShieldAlert,
  Terminal,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Copy,
  Check,
  HelpCircle,
  Play,
  ArrowUpDown,
  Code,
  RotateCw,
  FileQuestion,
  Archive
} from "lucide-react";

export function GuideView() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Question 3 Direct Answer Highlight Card */}
      <div className="bg-gradient-to-r from-sky-950/70 via-slate-900/90 to-indigo-950/70 border border-sky-500/40 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
            <Archive className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-white font-semibold text-base flex items-center gap-2">
              <span>Ответ на вопрос: Будет ли работать Python код отдельно без остальных файлов?</span>
            </h2>
            <div className="text-xs text-slate-300 leading-relaxed space-y-1.5">
              <p>
                <strong className="text-emerald-400 font-bold">ДА, будет работать абсолютно автономно!</strong> Файл <code className="text-sky-300 px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">browser_ai_hud.py</code> — это <strong>полностью самодостаточный скрипт</strong> (Single-file script).
              </p>
              <p className="text-slate-300">
                В него уже встроено всё необходимое: Win32 API захват окна из видеопамяти, клиент Gemini 3.6 Flash с ключом, потокобезопасный GUI на PyQt6 и глобальные хоткеи. Ему <strong>НЕ нужны</strong> веб-файлы (HTML, React, Vite, CSS, package.json).
              </p>
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2 mt-2">
                <span className="text-slate-300 text-xs">
                  👉 Достаточно скачать только один файл: <strong className="text-white">browser_ai_hud.py</strong> и установить зависимости командой:
                </span>
                <code className="text-sky-300 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                  pip install PyQt6 google-genai pywin32 pillow keyboard
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-400" />
          <span>Быстрый запуск за 3 шага (Windows 10 / 11)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[11px]">1</span>
              <span>Установка библиотек</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Откройте PowerShell или командную строку и выполните команду:
            </p>
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-200">
              <span className="truncate">pip install PyQt6 google-genai pywin32 pillow keyboard</span>
              <button
                onClick={() => copy("pip install PyQt6 google-genai pywin32 pillow keyboard", "pip")}
                className="hover:text-white text-slate-400 ml-2"
                title="Копировать"
              >
                {copiedCmd === "pip" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">2</span>
              <span>Модель и чистый код</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Строго <code className="text-sky-300">gemini-3.6-flash</code>. На кодинг выводятся только готовые строки Python-кода:
            </p>
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-200">
              <span className="truncate">gemini-3.6-flash • Pure Code</span>
              <span className="text-emerald-400 text-[10px] font-bold">✓ ГОТОВО</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[11px]">3</span>
              <span>Запуск от Администратора</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Запустите консоль от имени Администратора для работы глобальных хоткеев:
            </p>
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-200">
              <span className="truncate">python browser_ai_hud.py</span>
              <button
                onClick={() => copy("python browser_ai_hud.py", "run")}
                className="hover:text-white text-slate-400 ml-2"
                title="Копировать"
              >
                {copiedCmd === "run" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hotkeys Summary Bar */}
      <div className="bg-slate-900/90 border border-sky-500/30 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-sky-400" />
          <span>Таблица глобальных горячих клавиш скрипта</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <kbd className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-xs font-bold border border-sky-500/30">
              ALT + SHIFT + S
            </kbd>
            <p className="text-xs text-slate-200 font-medium mt-1.5">Снимок и анализ окна</p>
            <p className="text-[11px] text-slate-400">Кадр отправляется в Gemini без потери фокуса ввода</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700">
              ALT + SHIFT + C
            </kbd>
            <p className="text-xs text-slate-200 font-medium mt-1.5">Скрыть оверлей</p>
            <p className="text-[11px] text-slate-400">Закрывает окно, сохраняя предыдущий ответ в памяти</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30 bg-emerald-950/20">
            <kbd className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
              ALT + SHIFT + D
            </kbd>
            <p className="text-xs text-emerald-200 font-medium mt-1.5">Вернуть ответ</p>
            <p className="text-[11px] text-slate-400">Показывает оверлей с предыдущим сохраненным текстом</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <kbd className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-xs font-bold border border-sky-500/30">
              ALT + SHIFT + Z
            </kbd>
            <p className="text-xs text-slate-200 font-medium mt-1.5">Прокрутить ВВЕРХ</p>
            <p className="text-[11px] text-slate-400">Скролл оверлея вверх без переключения мыши</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <kbd className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-xs font-bold border border-sky-500/30">
              ALT + SHIFT + X
            </kbd>
            <p className="text-xs text-slate-200 font-medium mt-1.5">Прокрутить ВНИЗ</p>
            <p className="text-[11px] text-slate-400">Скролл длинного листинга кода вниз</p>
          </div>
        </div>
      </div>

      {/* Windows Technical Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Python Code Rule */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Code className="w-4 h-4" />
            <span>Требование к коду: Чистый Python 3</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            В системный промпт модели жестко прописано:
          </p>
          <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
            <li>Только сам код без комментариев (<code className="text-sky-300">#</code>, docstrings запрещены).</li>
            <li>Никаких вводных слов вроде <em>"Вот код решения"</em> или <em>"Сложность O(N)"</em>.</li>
            <li>Без лишних пустых строк и отступов — максимально компактный и синтаксически верный код.</li>
            <li>Исключительно Python 3, даже если в условии C++ или Java.</li>
          </ul>
        </div>

        {/* Restore HUD Feature */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
            <RotateCw className="w-4 h-4" />
            <span>Сохранение ответа и вызов по Alt+Shift+D</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            При закрытии оверлея по <code className="text-slate-200">Alt+Shift+C</code> процесс в памяти не сбрасывает полученный от нейросети ответ.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Нажав в любой момент <code className="text-emerald-300">Alt+Shift+D</code>, окно мгновенно отображается на экране с сохраненным содержимым без повторной отправки запроса в Gemini и без траты токенов.
          </p>
        </div>

        {/* Administrator Rights */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>Права Администратора в Windows</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Библиотека <code className="text-amber-300">keyboard</code> регистрирует системный хук <code className="text-slate-400">SetWindowsHookEx(WH_KEYBOARD_LL)</code>.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            В Windows 10/11 механизм <strong>User Account Control (UAC)</strong> запрещает стандартным процессам перехватывать нажатия в привилегированных окнах. Запуск от имени Администратора решает эту проблему.
          </p>
        </div>

        {/* DPI Awareness */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Monitor className="w-4 h-4" />
            <span>DPI-масштабирование (125%, 150%, 4K мониторы)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Если на экране включено масштабирование Windows (125% или 150%), в скрипте вызывается:
          </p>
          <pre className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-purple-300 overflow-x-auto">
            ctypes.windll.user32.SetProcessDpiAwarenessContext(-4)
          </pre>
          <p className="text-xs text-slate-400">
            Флаг <code className="text-slate-300">-4 (PER_MONITOR_AWARE_V2)</code> обеспечивает пиксель-в-пиксель снимок без обрезания краев.
          </p>
        </div>
      </div>
    </div>
  );
}
