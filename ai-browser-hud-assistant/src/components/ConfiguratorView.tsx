import React from "react";
import {
  Sliders,
  Keyboard,
  Sparkles,
  Layout,
  Clock,
  KeyRound,
  Download,
  RotateCcw,
  Check,
  ArrowUpDown,
  Code,
  RotateCw,
  Eye,
  Shield,
  EyeOff,
  Video
} from "lucide-react";
import { ScriptConfig } from "../types";
import { generatePythonScript, downloadTextFile } from "../utils/scriptGenerator";

interface ConfiguratorViewProps {
  config: ScriptConfig;
  onChange: (config: ScriptConfig) => void;
  onReset: () => void;
}

export function ConfiguratorView({ config, onChange, onReset }: ConfiguratorViewProps) {
  const update = <K extends keyof ScriptConfig>(key: K, value: ScriptConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const handleDownloadCustom = () => {
    const code = generatePythonScript(config);
    downloadTextFile("browser_ai_hud.py", code);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Конфигуратор параметров Python скрипта</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Настройте горячие клавиши (включая возврат ответа по Alt+Shift+D и скролл), строгую модель Gemini 3.6 Flash и системный промпт.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>По умолчанию</span>
          </button>

          <button
            onClick={handleDownloadCustom}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs md:text-sm font-medium transition active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Скачать настроенный .py</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hotkeys & Model */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Keyboard className="w-4 h-4 text-sky-400" />
            <span>Горячие клавиши управления</span>
          </h3>

          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Захват экрана:
                </label>
                <input
                  type="text"
                  value={config.captureHotkey}
                  onChange={(e) => update("captureHotkey", e.target.value.toLowerCase())}
                  placeholder="alt+shift+s"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Скрыть HUD:
                </label>
                <input
                  type="text"
                  value={config.hideHotkey}
                  onChange={(e) => update("hideHotkey", e.target.value.toLowerCase())}
                  placeholder="alt+shift+c"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-emerald-400 block mb-1">
                  Вернуть ответ:
                </label>
                <input
                  type="text"
                  value={config.showHotkey}
                  onChange={(e) => update("showHotkey", e.target.value.toLowerCase())}
                  placeholder="alt+shift+d"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Scroll hotkeys */}
            <div className="p-3 rounded-lg bg-slate-950 border border-sky-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-sky-300 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
                  <span>Прокрутка ответа в сквозном окне (без мыши)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-mono">
                  Click-Through Scroll
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Прокрутить ВВЕРХ:
                  </label>
                  <input
                    type="text"
                    value={config.scrollUpHotkey}
                    onChange={(e) => update("scrollUpHotkey", e.target.value.toLowerCase())}
                    placeholder="alt+shift+z"
                    className="w-full px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Прокрутить ВНИЗ:
                  </label>
                  <input
                    type="text"
                    value={config.scrollDownHotkey}
                    onChange={(e) => update("scrollDownHotkey", e.target.value.toLowerCase())}
                    placeholder="alt+shift+x"
                    className="w-full px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center justify-between">
                <span>Модель нейросети:</span>
                <span className="text-[11px] text-emerald-400 font-mono">Только 3.6 Flash (строго)</span>
              </label>
              <div className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-sky-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
                <span>gemini-3.6-flash</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Активна строго
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Устаревшие модели и автовыбор полностью удалены из кода. Все запросы направляются исключительно в <code>gemini-3.6-flash</code>.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Gemini API Key (опционально):
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => update("apiKey", e.target.value)}
                  placeholder="AIzaSy... (или пусто для чтения из %GEMINI_API_KEY%)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* HUD Geometry & Positioning */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Layout className="w-4 h-4 text-emerald-400" />
            <span>Параметры HUD-оверлея</span>
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Позиция оверлея на экране:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "bottom-right", label: "Справа внизу (по умолчанию)" },
                  { id: "top-right", label: "Справа вверху" },
                  { id: "bottom-left", label: "Слева внизу" },
                  { id: "top-left", label: "Слева вверху" },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => update("position", pos.id as any)}
                    className={`p-2 rounded-lg border text-xs font-medium text-left transition ${
                      config.position === pos.id
                        ? "bg-slate-800 border-sky-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Ширина окна (px):
                </label>
                <input
                  type="number"
                  min="320"
                  max="800"
                  value={config.overlayWidth}
                  onChange={(e) => update("overlayWidth", parseInt(e.target.value) || 500)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Высота окна (px):
                </label>
                <input
                  type="number"
                  min="200"
                  max="600"
                  value={config.overlayHeight}
                  onChange={(e) => update("overlayHeight", parseInt(e.target.value) || 330)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Автоскрытие ответа (секунд, 0 = не скрывать):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="5"
                  value={config.autoHideSeconds}
                  onChange={(e) => update("autoHideSeconds", parseInt(e.target.value))}
                  className="flex-1 accent-sky-500"
                />
                <span className="font-mono text-xs text-sky-400 font-semibold w-12 text-right">
                  {config.autoHideSeconds === 0 ? "Выкл" : `${config.autoHideSeconds} c`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Capture Invisibility (Zoom, Yandex Telemost, Teams, OBS) */}
      <div className="bg-slate-900/60 border border-purple-500/30 rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">
                Защита от захвата экрана (Zoom, Яндекс Телемост, Teams, OBS)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                WDA_EXCLUDEFROMCAPTURE (0x11)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              При включении этой функции окно оверлея <strong>полностью исключается из видеопотока захвата экрана</strong> через Win32 API <code className="text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded">SetWindowDisplayAffinity</code>. 
              Оно видно <strong>ТОЛЬКО вам</strong> на физическом мониторе. Для собеседников в Zoom, Яндекс Телемосте, Microsoft Teams, Discord и OBS на экране не будет ни оверлея, ни рамки, ни черного квадрата.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.excludeFromCapture}
              onChange={(e) => update("excludeFromCapture", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex items-center gap-2.5 text-slate-300">
            <Video className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-white font-medium block text-[11px]">Zoom & Яндекс Телемост</span>
              <span className="text-[10px] text-slate-400">Собеседники видят чистый экран браузера</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex items-center gap-2.5 text-slate-300">
            <EyeOff className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-white font-medium block text-[11px]">Без черного квадрата</span>
              <span className="text-[10px] text-slate-400">Флаг 0x11 вырезает окно из DWM</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex items-center gap-2.5 text-slate-300">
            <Shield className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-white font-medium block text-[11px]">Автоматически в скрипте</span>
              <span className="text-[10px] text-slate-400">Применяется сразу при показе HUD</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Prompt Customizer with Python Rule highlight */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Системный промпт ассистента</span>
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-mono">
            <Code className="w-3 h-3" />
            <span>Только чистый код (без комментариев и отступов)</span>
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Инструкция жестко указывает Gemini выводить для задач по программированию ТОЛЬКО сам код на Python 3 без комментариев, без вступительных фраз и без лишних отступов.
        </p>

        <textarea
          rows={5}
          value={config.systemPrompt}
          onChange={(e) => update("systemPrompt", e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-sky-500"
        />
      </div>
    </div>
  );
}
