import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Command,
  MousePointerClick,
  CheckCircle2,
  Clock,
  Layers,
  Cpu,
  RefreshCw,
  Eye,
  EyeOff,
  RotateCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Send,
  Code2,
  ArrowUp,
  ArrowDown,
  Terminal,
  Shield,
  Video
} from "lucide-react";
import { ScriptConfig, Scenario } from "../types";

const DEMO_SCENARIOS: Scenario[] = [
  {
    id: "leetcode",
    title: "LeetCode: Двусвязный список и реверс (C++)",
    category: "Алгоритмы / Pure Python Code",
    browserUrl: "https://leetcode.com/problems/reverse-linked-list",
    pageTitle: "206. Reverse Linked List - LeetCode",
    contentSnippet: `Task (C++ prototype on screen):
struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};
Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    mockAiAnswer: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head: ListNode) -> ListNode:
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`
  },
  {
    id: "database",
    title: "SQL & Пагинация: Переписать на Python ORM",
    category: "Бэкенд / Pure Python Code",
    browserUrl: "https://sqlzoo.net/wiki/SELECT_basics",
    pageTitle: "SQL Zoo - Query Optimization Challenge",
    contentSnippet: `SELECT u.id, u.username, COUNT(o.id) as orders_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id
HAVING COUNT(o.id) > 5
ORDER BY orders_count DESC LIMIT 20;`,
    mockAiAnswer: `from sqlalchemy import select, func, desc

stmt = (
    select(User.id, User.username, func.count(Order.id).label("orders_count"))
    .outerjoin(Order, User.id == Order.user_id)
    .group_by(User.id, User.username)
    .having(func.count(Order.id) > 5)
    .order_by(desc("orders_count"))
    .limit(20)
)
results = session.execute(stmt).all()`
  },
  {
    id: "translate",
    title: "MDN: Intersection Observer API",
    category: "Теория / Кратко",
    browserUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API",
    pageTitle: "Intersection Observer API - MDN Web Docs",
    contentSnippet: `The Intersection Observer API provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport.`,
    mockAiAnswer: `Intersection Observer API асинхронно отслеживает пересечение элемента с viewport для ленивой загрузки изображений и бесконечной прокрутки без нагрузки на CPU.`
  }
];

interface SimulatorViewProps {
  config: ScriptConfig;
}

export function SimulatorView({ config }: SimulatorViewProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(DEMO_SCENARIOS[0]);
  const [browserInputText, setBrowserInputText] = useState("def solve():");
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [overlayStatus, setOverlayStatus] = useState<"idle" | "thinking" | "ready" | "error">("idle");
  const [overlayContent, setOverlayContent] = useState("");
  const [lastSavedAnswer, setLastSavedAnswer] = useState<string>(DEMO_SCENARIOS[0].mockAiAnswer);
  const [telemetry, setTelemetry] = useState<Array<{ step: string; time: string; details: string }>>([]);
  const [clickThroughActive, setClickThroughActive] = useState(true);
  const [browserClicksCount, setBrowserClicksCount] = useState(0);
  const [lastClickedElement, setLastClickedElement] = useState<string | null>(null);
  const [liveApiActive, setLiveApiActive] = useState(false);
  const [isCallingLiveApi, setIsCallingLiveApi] = useState(false);
  const [screenShareMode, setScreenShareMode] = useState(false);

  const browserInputRef = useRef<HTMLInputElement>(null);
  const overlayScrollRef = useRef<HTMLDivElement>(null);

  const scrollOverlay = (direction: "up" | "down") => {
    if (overlayScrollRef.current) {
      const step = 80;
      overlayScrollRef.current.scrollTop += direction === "down" ? step : -step;
    }
  };

  // Trigger analysis
  const triggerCapture = async () => {
    setIsOverlayVisible(true);
    setOverlayStatus("thinking");
    setOverlayContent("Запрос строго в gemini-3.6-flash... Формируется только чистый Python-код без комментариев.");

    const t0 = performance.now();
    setTelemetry([
      { step: "1. Global Hook", time: "0 ms", details: `keyboard: перехвачен ${config.captureHotkey.toUpperCase()}` },
      { step: "2. Win32 HWND", time: "3 ms", details: `win32gui.GetForegroundWindow -> HWND: 0x${Math.floor(Math.random() * 0xfffff).toString(16).toUpperCase()}` },
      { step: "3. Memory Capture", time: "18 ms", details: "PrintWindow(..., PW_RENDERFULLCONTENT) -> 0 focus stolen" },
      { step: "4. Stealth Protection", time: "22 ms", details: config.excludeFromCapture ? "SetWindowDisplayAffinity(0x11) -> Окно скрыто от Zoom / Телемост" : "Capture Affinity: Default" },
    ]);

    // Keep focus inside browser input to visually prove zero focus loss
    if (browserInputRef.current) {
      browserInputRef.current.focus();
    }

    if (liveApiActive) {
      setIsCallingLiveApi(true);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Окно: ${selectedScenario.pageTitle}\nСодержимое:\n${selectedScenario.contentSnippet}\nВвод пользователя: ${browserInputText}\nСТРОГОЕ ТРЕБОВАНИЕ: Только чистый код на Python 3 без комментариев, без вступительных фраз и без лишних отступов!`,
            systemPrompt: config.systemPrompt,
            model: "gemini-3.6-flash",
          }),
        });
        const data = await res.json();
        const duration = Math.round(performance.now() - t0);

        if (data.success && data.text) {
          setOverlayStatus("ready");
          setOverlayContent(data.text);
          setLastSavedAnswer(data.text);
          setTelemetry(prev => [
            ...prev,
            { step: "4. Gemini 3.6 Flash", time: `${duration} ms`, details: "Модель: gemini-3.6-flash (Чистый Python-код)" },
            { step: "5. Win32 Click-Through", time: `${duration + 4} ms`, details: "WS_EX_TRANSPARENT + Hotkey Scroll" },
          ]);
        } else {
          throw new Error(data.error || "Неизвестная ошибка API");
        }
      } catch (err: any) {
        setOverlayStatus("error");
        setOverlayContent(`Ошибка обращения к API: ${err.message}. Используем демонстрационный чистый ответ.`);
        setTimeout(() => {
          setOverlayStatus("ready");
          setOverlayContent(selectedScenario.mockAiAnswer);
          setLastSavedAnswer(selectedScenario.mockAiAnswer);
        }, 1200);
      } finally {
        setIsCallingLiveApi(false);
      }
    } else {
      setTimeout(() => {
        const duration = Math.round(performance.now() - t0);
        setOverlayStatus("ready");
        setOverlayContent(selectedScenario.mockAiAnswer);
        setLastSavedAnswer(selectedScenario.mockAiAnswer);
        setTelemetry(prev => [
          ...prev,
          { step: "4. Gemini 3.6 Flash", time: `${duration} ms`, details: "Строго gemini-3.6-flash (без комментариев)" },
          { step: "5. Win32 Click-Through", time: `${duration + 2} ms`, details: "Хоткеи: Alt+Shift+Z/X (скролл), Alt+Shift+D (возврат)" },
        ]);
      }, 550);
    }
  };

  const hideOverlay = () => {
    setIsOverlayVisible(false);
    setOverlayStatus("idle");
    setTelemetry(prev => [
      ...prev,
      { step: "Hide Trigger", time: "Now", details: `${config.hideHotkey.toUpperCase()}: окно скрыто. Ответ сохранен в памяти!` }
    ]);
  };

  const showRestoredOverlay = () => {
    setIsOverlayVisible(true);
    setOverlayStatus("ready");
    setOverlayContent(lastSavedAnswer || selectedScenario.mockAiAnswer);
    setTelemetry(prev => [
      ...prev,
      { step: "Restore Trigger", time: "Now", details: `${config.showHotkey.toUpperCase()}: окно восстановлено с предыдущим ответом!` }
    ]);
  };

  // Keyboard shortcut listener within simulator (support English & Russian keymaps)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Capture hotkey: Alt+Shift+S (or 'ы')
      if (e.altKey && e.shiftKey && (e.key === "s" || e.key === "S" || e.key === "ы" || e.key === "Ы")) {
        e.preventDefault();
        triggerCapture();
      }
      // Hide hotkey: Alt+Shift+C (or 'с')
      else if (e.altKey && e.shiftKey && (e.key === "c" || e.key === "C" || e.key === "с" || e.key === "С")) {
        e.preventDefault();
        hideOverlay();
      }
      // Restore previous response hotkey: Alt+Shift+D (or 'в')
      else if (e.altKey && e.shiftKey && (e.key === "d" || e.key === "D" || e.key === "в" || e.key === "В")) {
        e.preventDefault();
        showRestoredOverlay();
      }
      // Scroll UP: Alt+Shift+Z (or 'я')
      else if (e.altKey && e.shiftKey && (e.key === "z" || e.key === "Z" || e.key === "я" || e.key === "Я")) {
        e.preventDefault();
        scrollOverlay("up");
        setTelemetry(prev => [
          ...prev,
          { step: "Scroll UP", time: "Now", details: "Горячая клавиша ALT+SHIFT+Z -> прокрутка вверх на 80px" }
        ]);
      }
      // Scroll DOWN: Alt+Shift+X (or 'ч')
      else if (e.altKey && e.shiftKey && (e.key === "x" || e.key === "X" || e.key === "ч" || e.key === "Ч")) {
        e.preventDefault();
        scrollOverlay("down");
        setTelemetry(prev => [
          ...prev,
          { step: "Scroll DOWN", time: "Now", details: "Горячая клавиша ALT+SHIFT+X -> прокрутка вниз на 80px" }
        ]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [config, selectedScenario, browserInputText, liveApiActive, lastSavedAnswer]);

  const handleBrowserElementClick = (name: string) => {
    setBrowserClicksCount(c => c + 1);
    setLastClickedElement(name);
    setTimeout(() => setLastClickedElement(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Command className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm md:text-base">Интерактивный симулятор Windows 10/11</span>
              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                0% потери фокуса
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                Только gemini-3.6-flash
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Снимок: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-sky-300 font-mono text-[11px]">{config.captureHotkey.toUpperCase()}</kbd> | 
              Скрыть: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[11px]">{config.hideHotkey.toUpperCase()}</kbd> | 
              Вернуть: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-emerald-300 font-mono text-[11px]">{config.showHotkey.toUpperCase()}</kbd> | 
              Скролл: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-sky-300 font-mono text-[11px]">{config.scrollUpHotkey.toUpperCase()}/{config.scrollDownHotkey.toUpperCase()}</kbd>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerCapture}
            className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs md:text-sm font-medium rounded-lg transition-all shadow-sm active:scale-95"
            title="Запустить захват и анализ"
          >
            <Sparkles className="w-4 h-4" />
            <span>Захват ({config.captureHotkey.toUpperCase()})</span>
          </button>

          {!isOverlayVisible && (
            <button
              onClick={showRestoredOverlay}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs md:text-sm font-medium rounded-lg transition border border-emerald-700/50"
              title="Показать оверлей с предыдущим ответом"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Вернуть ответ ({config.showHotkey.toUpperCase()})</span>
            </button>
          )}

          {isOverlayVisible && (
            <>
              <button
                onClick={() => scrollOverlay("up")}
                className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition border border-slate-700"
                title="Прокрутить оверлей вверх"
              >
                <ArrowUp className="w-3.5 h-3.5 text-sky-400" />
                <span>{config.scrollUpHotkey.toUpperCase()}</span>
              </button>
              <button
                onClick={() => scrollOverlay("down")}
                className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition border border-slate-700"
                title="Прокрутить оверлей вниз"
              >
                <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                <span>{config.scrollDownHotkey.toUpperCase()}</span>
              </button>
              <button
                onClick={hideOverlay}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs md:text-sm rounded-lg transition border border-slate-700"
                title="Скрыть окно"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Скрыть ({config.hideHotkey.toUpperCase()})</span>
              </button>
            </>
          )}

          <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700 cursor-pointer text-xs text-slate-300 hover:text-white transition">
            <input
              type="checkbox"
              checked={liveApiActive}
              onChange={(e) => setLiveApiActive(e.target.checked)}
              className="rounded border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Тест Gemini Live</span>
          </label>

          <button
            type="button"
            onClick={() => setScreenShareMode(!screenShareMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              screenShareMode
                ? "bg-purple-600/30 text-purple-200 border-purple-500/80 shadow-sm shadow-purple-500/30"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white"
            }`}
            title="Проверить, как экран выглядит во время демонстрации в Zoom или Яндекс Телемост"
          >
            <Video className={`w-3.5 h-3.5 ${screenShareMode ? "text-purple-300 animate-pulse" : "text-slate-400"}`} />
            <span>{screenShareMode ? "Вид Zoom / Телемост (ВКЛ)" : "Вид в Zoom / Телемосте"}</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 shrink-0 font-medium mr-1">Сценарий окна:</span>
        {DEMO_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => {
              setSelectedScenario(sc);
              setLastSavedAnswer(sc.mockAiAnswer);
              if (isOverlayVisible) {
                setOverlayStatus("ready");
                setOverlayContent(sc.mockAiAnswer);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 shrink-0 ${
              selectedScenario.id === sc.id
                ? "bg-slate-800 text-sky-400 border border-sky-500/30"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80"
            }`}
          >
            <span>{sc.title}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400">{sc.category}</span>
          </button>
        ))}
      </div>

      {/* Virtual Desktop & Browser Container */}
      <div className="relative rounded-2xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-2xl">
        {/* Windows 11 Window Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            {/* Active Tab */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-t-lg border-t border-x border-slate-800 text-xs text-slate-200 font-medium">
              <div className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{selectedScenario.pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="hidden sm:inline">HWND: 0x004A12F0</span>
            <span className="text-emerald-400 font-sans text-[11px] font-semibold">● Активно (Фокус ввода)</span>
          </div>
        </div>

        {/* Browser URL Bar */}
        <div className="bg-slate-900/50 border-b border-slate-800/80 px-4 py-2 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <span>←</span>
            <span>→</span>
            <span>⟳</span>
          </div>
          <div className="flex-1 px-3 py-1 bg-slate-950 rounded-md border border-slate-800 text-slate-300 font-mono text-xs flex items-center justify-between">
            <span className="truncate">{selectedScenario.browserUrl}</span>
            <span className="text-emerald-500 text-[10px]">🔒 SSL</span>
          </div>
        </div>

        {/* Screen Share Mode Info Banner */}
        {screenShareMode && (
          <div className="bg-purple-950/90 border-b border-purple-500/40 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-purple-200">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
              <span>
                <strong>Трансляция экрана (Zoom / Яндекс Телемост):</strong>{" "}
                {config.excludeFromCapture ? (
                  <span className="text-emerald-300 font-medium">
                    Оверлей HUD полностью исключен из видеопотока (SetWindowDisplayAffinity 0x11). Собеседники видят чистый браузер!
                  </span>
                ) : (
                  <span className="text-amber-300 font-medium">
                    Оверлей виден на видео (защита отключена в настройках).
                  </span>
                )}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500/30 font-mono text-purple-300">
              WDA_EXCLUDEFROMCAPTURE (0x11)
            </span>
          </div>
        )}

        {/* Browser Page Body */}
        <div className="p-6 relative min-h-[360px] bg-slate-950">
          <div className="space-y-4 max-w-2xl">
            <div>
              <span className="text-xs uppercase tracking-wider text-sky-400 font-mono font-semibold">
                {selectedScenario.category}
              </span>
              <h2 className="text-lg font-bold text-white mt-1">{selectedScenario.pageTitle}</h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {selectedScenario.contentSnippet}
            </div>

            {/* Simulated Live Input in Browser */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
              <label className="text-xs text-slate-400 font-medium block">
                Интерактивное поле ввода (проверка: фокус НЕ теряется при анализе):
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={browserInputRef}
                  type="text"
                  value={browserInputText}
                  onChange={(e) => setBrowserInputText(e.target.value)}
                  placeholder="Печатайте здесь... Фокус не пропадет при нажатии Alt+Shift+S!"
                  className="flex-1 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-500 transition"
                />
                <button
                  onClick={() => handleBrowserElementClick("Кнопка 'Отправить в браузере'")}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition active:scale-95"
                >
                  Кликнуть кнопку
                </button>
              </div>
            </div>

            {/* Click target underneath where the HUD sits */}
            <div className="mt-8 pt-4 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-emerald-400" />
                <span>Зона проверки сквозного клика (Click-Through):</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBrowserElementClick("Кнопка под оверлеем №1")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 transition text-xs font-medium"
                >
                  Кнопка браузера №1
                </button>
                <button
                  onClick={() => handleBrowserElementClick("Кнопка под оверлеем №2")}
                  className="px-3 py-1.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 transition text-xs font-medium"
                >
                  Кнопка браузера №2
                </button>
              </div>
            </div>

            {/* Click event toast indicator */}
            {lastClickedElement && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Успешный клик по: <strong>{lastClickedElement}</strong> (всего кликов: {browserClicksCount})!
                  {clickThroughActive && isOverlayVisible && " Клик прошел сквозным образом СКВОЗЬ HUD-оверлей!"}
                </span>
              </div>
            )}
          </div>

          {/* HUD OVERLAY SIMULATION */}
          {isOverlayVisible && (
            <div
              className={`absolute transition-all duration-300 z-30 ${
                config.position === "top-right"
                  ? "top-4 right-4"
                  : config.position === "bottom-left"
                  ? "bottom-4 left-4"
                  : config.position === "top-left"
                  ? "top-4 left-4"
                  : "bottom-4 right-4"
              } ${clickThroughActive ? "pointer-events-none" : "pointer-events-auto"}`}
              style={{
                width: `${Math.min(config.overlayWidth, 460)}px`,
                maxWidth: "92%",
              }}
            >
              {/* If Screen Share Mode is ON and Exclude From Capture is active: Show the stealth outline proving it is hidden from meeting viewers */}
              {screenShareMode && config.excludeFromCapture ? (
                <div className="rounded-2xl border-2 border-dashed border-purple-500/50 bg-purple-950/20 backdrop-blur-sm p-4 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-purple-300 text-xs font-semibold">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span>НЕВИДИМО ДЛЯ ЗАХВАТА ЭКРАНА</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500/40 text-purple-200 font-mono">
                      WDA_EXCLUDEFROMCAPTURE
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200/80 leading-relaxed">
                    Для участников Zoom, Яндекс Телемост, Teams и OBS эта область <strong>полностью пустая</strong> (отображается страница под ней). Вы же видите подсказку на своем физическом мониторе.
                  </p>
                </div>
              ) : (
                /* Modern Glassmorphic HUD Window */
                <div className="relative rounded-2xl bg-slate-900/95 border border-sky-500/40 backdrop-blur-xl shadow-2xl p-4 text-left overflow-hidden ring-1 ring-white/10">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/90 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          overlayStatus === "thinking"
                            ? "bg-sky-400 animate-ping"
                            : overlayStatus === "ready"
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }`}
                      />
                      <span className="font-semibold text-slate-100">
                        {overlayStatus === "thinking"
                          ? "Думаю..."
                          : overlayStatus === "ready"
                          ? "Готово"
                          : "Ошибка"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-[10px] font-mono text-sky-400 font-bold">
                        Pure Python Code
                      </span>
                      {config.excludeFromCapture && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" />
                          <span>Capture Hidden</span>
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-[10px] font-mono text-emerald-300 font-semibold">
                        gemini-3.6-flash
                      </span>
                    </div>
                  </div>

                  {/* Body Content with Scroll Support */}
                  <div
                    ref={overlayScrollRef}
                    className="mt-2.5 max-h-[175px] overflow-y-auto pr-1 text-xs text-slate-200 leading-relaxed space-y-1.5 font-mono scroll-smooth"
                  >
                    {overlayStatus === "thinking" ? (
                      <div className="flex items-center gap-2 text-sky-300 py-3">
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span className="italic text-xs font-sans">Запрос в gemini-3.6-flash... Генерируется чистый Python-код без комментариев</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-[11.5px] leading-relaxed select-text font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-emerald-300">
                        {overlayContent}
                      </div>
                    )}
                  </div>

                  {/* Footer with Hotkeys for Scroll, Hide, Restore */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-sky-300/80 font-mono">
                      ▲▼ {config.scrollUpHotkey.toUpperCase()} / {config.scrollDownHotkey.toUpperCase()}: скролл
                    </span>
                    <div className="space-x-2 font-mono">
                      <span className="text-slate-400">{config.hideHotkey.toUpperCase()}: скрыть</span>
                      <span className="text-emerald-400">{config.showHotkey.toUpperCase()}: вернуть</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Virtual Desktop Taskbar */}
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200 text-xs">Windows 11 HUD Environment</span>
            <span className="text-slate-400">|</span>
            <span className="text-[11px] text-slate-400">PyQt6 + Win32 Hook</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={clickThroughActive}
                onChange={(e) => setClickThroughActive(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span>Эмуляция Click-Through (прозрачность клика)</span>
            </label>
            <span className="font-mono text-[11px] text-slate-400">12:35</span>
          </div>
        </div>
      </div>

      {/* Telemetry & Technical Flow Logs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>Архитектурный трейс выполнения (Zero-Focus Overhead)</span>
        </h3>

        {telemetry.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            Нажмите кнопку захвата или комбинацию клавиш {config.captureHotkey.toUpperCase()}, чтобы увидеть пошаговый отчет вызовов Win32 API и Gemini 3.6 Flash.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
            {telemetry.map((t, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-medium text-slate-300">{t.step}</span>
                  <span className="font-mono text-sky-400">{t.time}</span>
                </div>
                <p className="text-slate-400 text-[11px] font-mono truncate">{t.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
