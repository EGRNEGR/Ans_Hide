import { ScriptConfig } from "../types";

export function generatePythonScript(config: ScriptConfig): string {
  const apiKeyLiteral = config.apiKey.trim()
    ? `os.environ.get("GEMINI_API_KEY", "${config.apiKey.trim()}")`
    : `os.environ.get("GEMINI_API_KEY", "YOUR_KEY")`;

  return `"""
================================================================================
AI Browser HUD Assistant for Windows 10/11 (v2.2 gemini-3.6-flash, Pure Code, Restore HUD)
================================================================================
Фоновый анализ активного окна браузера с помощью Gemini 3.6 Flash без потери фокуса ввода.
Снимок из памяти через Win32 API + Мультимодальный ИИ + Прозрачный Click-Through HUD (PyQt6).

НОВЫЕ ВОЗМОЖНОСТИ:
• Исключительно модель '${config.model}' — без перебора устаревших моделей.
• Задачи по кодингу: ТОЛЬКО чистый код на Python 3, без комментариев, без вступительных
  слов, пояснений и лишних пустых строк/отступов.
• Сохранение истории ответа:
  - ${config.hideHotkey.toUpperCase()} — скрыть оверлей
  - ${config.showHotkey.toUpperCase()} — открыть оверлей с предыдущим сохраненным ответом
• Навигация без мыши (сквозное окно):
  - ${config.scrollUpHotkey.toUpperCase()} — прокрутить ответ ВВЕРХ
  - ${config.scrollDownHotkey.toUpperCase()} — прокрутить ответ ВНИЗ
  - ${config.captureHotkey.toUpperCase()} — новый снимок и анализ экрана
• Аудиозахват динамиков собеседника (Zoom / Яндекс Телемост):
  - ${config.audioHotkey.toUpperCase()} — старт / стоп прослушивания речи собеседника из динамиков

КОМАНДЫ ДЛЯ УСТАНОВКИ ЗАВИСИМОСТЕЙ (в консоли Windows / cmd / PowerShell):
--------------------------------------------------------------------------------
pip install PyQt6 google-genai pywin32 pillow keyboard sounddevice numpy
================================================================================
"""

import sys
import os
import io
import time
import wave
import ctypes
import threading
from typing import Optional, Tuple
from PIL import Image

# 1. Настройка Windows DPI Awareness для корректных координат и масштабирования
try:
    ctypes.windll.user32.SetProcessDpiAwarenessContext(ctypes.c_void_p(-4))
except Exception:
    try:
        ctypes.windll.shcore.SetProcessDpiAwareness(2)
    except Exception:
        try:
            ctypes.windll.user32.SetProcessDPIAware()
        except Exception:
            pass

# Windows Win32 API
import win32gui
import win32ui
import win32con

# Глобальные горячие клавиши
import keyboard

# Аудиозахват динамиков и микрофона
try:
    import sounddevice as sd
    import numpy as np
    SOUND_AVAILABLE = True
except ImportError:
    SOUND_AVAILABLE = False

# GUI & HUD (PyQt6)
from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QObject
from PyQt6.QtGui import QTextCursor
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QTextEdit, QFrame
)

# Официальный SDK Google Gemini
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


# ==============================================================================
# КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ
# ==============================================================================
class Config:
    GEMINI_API_KEY = ${apiKeyLiteral}
    MODEL_NAME = "${config.model}"

    CAPTURE_HOTKEY = "${config.captureHotkey}"
    AUDIO_HOTKEY = "${config.audioHotkey}"
    HIDE_HOTKEY = "${config.hideHotkey}"
    SHOW_HOTKEY = "${config.showHotkey}"
    SCROLL_UP_HOTKEY = "${config.scrollUpHotkey}"
    SCROLL_DOWN_HOTKEY = "${config.scrollDownHotkey}"

    SYSTEM_PROMPT = (
        "${config.systemPrompt.replace(/\\n/g, "\\\\n").replace(/"/g, '\\\\"')}"
    )

    AUDIO_PROMPT = (
        "${(config.audioPrompt || "Ты — персональный тайный ассистент на собеседовании. Дай точный, четкий, без воды ответ на вопрос собеседника.").replace(/\\n/g, "\\\\n").replace(/"/g, '\\\\"')}"
    )

    OVERLAY_WIDTH = ${config.overlayWidth}
    OVERLAY_HEIGHT = ${config.overlayHeight}
    CORNER_MARGIN = ${config.cornerMargin}
    SCROLL_STEP = 90
    AUTO_HIDE_SECONDS = ${config.autoHideSeconds}

    # Защита от захвата экрана (Zoom, Яндекс Телемост, Microsoft Teams, Discord, OBS, Google Meet)
    # Использует SetWindowDisplayAffinity с флагом WDA_EXCLUDEFROMCAPTURE (0x00000011).
    # Окно видно пользователю на мониторе, но полностью исключено из видеопотока захвата и трансляции экрана!
    HIDE_FROM_SCREEN_CAPTURE = ${config.excludeFromCapture ? "True" : "False"}


# ==============================================================================
# 1. ЗАХВАТ ОКНА БЕЗ ПОТЕРИ ФОКУСА (Win32 API)
# ==============================================================================
class WindowCapture:
    @staticmethod
    def get_foreground_window() -> Tuple[Optional[int], str, Tuple[int, int, int, int]]:
        hwnd = win32gui.GetForegroundWindow()
        if not hwnd or not win32gui.IsWindow(hwnd):
            return None, "", (0, 0, 0, 0)
        
        title = win32gui.GetWindowText(hwnd)
        rect = win32gui.GetWindowRect(hwnd)
        return hwnd, title, rect

    @staticmethod
    def capture_window_from_memory(hwnd: int) -> Optional[Image.Image]:
        if not hwnd or not win32gui.IsWindow(hwnd):
            return None

        if win32gui.IsIconic(hwnd):
            return None

        left, top, right, bottom = win32gui.GetWindowRect(hwnd)
        width = right - left
        height = bottom - top

        if width <= 0 or height <= 0:
            return None

        hwnd_dc = None
        mfc_dc = None
        save_dc = None
        save_bitmap = None

        try:
            hwnd_dc = win32gui.GetWindowDC(hwnd)
            mfc_dc = win32ui.CreateDCFromHandle(hwnd_dc)
            save_dc = mfc_dc.CreateCompatibleDC()

            save_bitmap = win32ui.CreateBitmap()
            save_bitmap.CreateCompatibleBitmap(mfc_dc, width, height)
            save_dc.SelectObject(save_bitmap)

            PW_RENDERFULLCONTENT = 2
            success = ctypes.windll.user32.PrintWindow(hwnd, save_dc.GetSafeHdc(), PW_RENDERFULLCONTENT)

            if success == 0:
                save_dc.BitBlt((0, 0), (width, height), mfc_dc, (0, 0), win32con.SRCCOPY)

            bmp_info = save_bitmap.GetInfo()
            bmp_bits = save_bitmap.GetBitmapBits(True)

            img = Image.frombuffer(
                "RGB",
                (bmp_info["bmWidth"], bmp_info["bmHeight"]),
                bmp_bits,
                "raw",
                "BGRX",
                0,
                1
            )
            return img

        except Exception as e:
            print(f"[WindowCapture] Ошибка захвата: {e}")
            return None

        finally:
            if save_bitmap:
                win32gui.DeleteObject(save_bitmap.GetHandle())
            if save_dc:
                save_dc.DeleteDC()
            if mfc_dc:
                mfc_dc.DeleteDC()
            if hwnd_dc:
                win32gui.ReleaseDC(hwnd, hwnd_dc)


# ==============================================================================
# 2. АУДИОЗАХВАТ ДИНАМИКОВ СОБЕСЕДНИКА (Zoom / Яндекс Телемост / Teams)
# ==============================================================================
class AudioLoopbackRecorder:
    def __init__(self, samplerate: int = 16000):
        self.samplerate = samplerate
        self.is_recording = False
        self.audio_frames = []
        self._stream = None
        self._lock = threading.Lock()

    def start(self) -> bool:
        if not SOUND_AVAILABLE:
            print("[Audio] sounddevice / numpy не установлены. Выполните: pip install sounddevice numpy")
            return False

        with self._lock:
            if self.is_recording:
                return True
            self.audio_frames = []
            self.is_recording = True

        def callback(indata, frames, time_info, status):
            if status:
                print(f"[Audio Status] {status}")
            with self._lock:
                if self.is_recording:
                    self.audio_frames.append(indata.copy())

        loopback_device = None
        try:
            wasapi_api_index = None
            hostapis = sd.query_hostapis()
            for idx, api in enumerate(hostapis):
                if "WASAPI" in api.get("name", "").upper():
                    wasapi_api_index = idx
                    break

            if wasapi_api_index is not None:
                devices = sd.query_devices()
                default_output = sd.default.device[1]
                default_output_name = devices[default_output]["name"] if default_output >= 0 else ""

                for dev_idx, dev in enumerate(devices):
                    if dev.get("hostapi") == wasapi_api_index and dev.get("max_output_channels", 0) > 0:
                        if default_output_name and default_output_name in dev.get("name", ""):
                            loopback_device = dev_idx
                            break
                        elif loopback_device is None:
                            loopback_device = dev_idx
        except Exception as e:
            print(f"[Audio] Поиск WASAPI Loopback: {e}")

        try:
            if loopback_device is not None:
                try:
                    self._stream = sd.InputStream(
                        samplerate=self.samplerate,
                        channels=1,
                        dtype="int16",
                        device=loopback_device,
                        callback=callback,
                        extra_settings=sd.WasapiSettings(exclusive=False)
                    )
                    self._stream.start()
                    print(f"[Audio] Запись звука начата через WASAPI Loopback (#{loopback_device}).")
                    return True
                except Exception as loop_err:
                    print(f"[Audio] Loopback fallback: {loop_err}")

            self._stream = sd.InputStream(
                samplerate=self.samplerate,
                channels=1,
                dtype="int16",
                callback=callback
            )
            self._stream.start()
            print("[Audio] Запись звука начата через стандартное устройство ввода.")
            return True

        except Exception as err:
            print(f"[Audio Ошибка запуска записи]: {err}")
            with self._lock:
                self.is_recording = False
            return False

    def stop(self) -> Optional[bytes]:
        with self._lock:
            if not self.is_recording:
                return None
            self.is_recording = False

        try:
            if self._stream:
                self._stream.stop()
                self._stream.close()
                self._stream = None
        except Exception as e:
            print(f"[Audio] Ошибка остановки стрима: {e}")

        with self._lock:
            if not self.audio_frames:
                print("[Audio] Аудиопоток пуст.")
                return None
            try:
                audio_data = np.concatenate(self.audio_frames, axis=0)
            except Exception as e:
                print(f"[Audio Concatenate]: {e}")
                return None

        buffer = io.BytesIO()
        try:
            with wave.open(buffer, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(self.samplerate)
                wf.writeframes(audio_data.tobytes())
            wav_bytes = buffer.getvalue()
            return wav_bytes
        except Exception as e:
            print(f"[Audio WAV Encode]: {e}")
            return None


# ==============================================================================
# 3. ИНТЕГРАЦИЯ С GEMINI 3.6 FLASH (ТОЛЬКО gemini-3.6-flash)
# ==============================================================================
class GeminiWorker(QObject):
    started = pyqtSignal(str)
    response_ready = pyqtSignal(str)
    error_occurred = pyqtSignal(str)

    def __init__(self, config: Config):
        super().__init__()
        self.config = config
        self._client = None
        self._init_client()

    def _init_client(self):
        if not GENAI_AVAILABLE:
            return
        api_key = self.config.GEMINI_API_KEY
        if api_key:
            try:
                self._client = genai.Client(api_key=api_key)
            except Exception as e:
                print(f"[GeminiWorker] Ошибка клиента: {e}")

    def analyze_async(self, image: Image.Image, window_title: str):
        thread = threading.Thread(
            target=self._execute_analysis,
            args=(image, window_title),
            daemon=True
        )
        thread.start()

    def analyze_audio_async(self, audio_wav_bytes: bytes):
        thread = threading.Thread(
            target=self._execute_audio_analysis,
            args=(audio_wav_bytes,),
            daemon=True
        )
        thread.start()

    def _execute_analysis(self, image: Image.Image, window_title: str):
        print(f"\\n[AI] Запуск анализа окна через '{self.config.MODEL_NAME}': '{window_title}'...")
        self.started.emit(window_title)

        if not GENAI_AVAILABLE:
            msg = "Библиотека google-genai не найдена. Выполните: pip install google-genai"
            print(f"[AI ОШИБКА] {msg}")
            self.error_occurred.emit(msg)
            return

        api_key = self.config.GEMINI_API_KEY
        if not api_key:
            msg = "GEMINI_API_KEY не указан!"
            print(f"[AI ОШИБКА] {msg}")
            self.error_occurred.emit(msg)
            return

        if not self._client:
            try:
                self._client = genai.Client(api_key=api_key)
            except Exception as e:
                print(f"[AI ОШИБКА] Клиент Gemini: {e}")
                self.error_occurred.emit(f"Ошибка клиента: {e}")
                return

        try:
            buffer = io.BytesIO()
            img_optimized = image.copy()
            img_optimized.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            img_optimized.save(buffer, format="JPEG", quality=85, optimize=True)
            image_bytes = buffer.getvalue()

            image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")

            print(f"[AI] Отправка запроса строго в модель '{self.config.MODEL_NAME}'...")
            response = self._client.models.generate_content(
                model=self.config.MODEL_NAME,
                contents=[
                    image_part,
                    types.Part.from_text(
                        text="Внимательно изучи скриншот. Если это задача по кодингу — выведи ТОЛЬКО код на Python 3, "
                             "без комментариев, без пустых отступов и без пояснений."
                    )
                ],
                config=types.GenerateContentConfig(
                    system_instruction=self.config.SYSTEM_PROMPT,
                    max_output_tokens=1600,
                    temperature=0.1,
                )
            )

            if not response or not response.text:
                raise RuntimeError("Модель " + self.config.MODEL_NAME + " вернула пустой ответ.")

            raw_text = response.text.strip()
            lines = raw_text.splitlines()
            if len(lines) >= 2 and lines[0].startswith(chr(96) * 3) and lines[-1].startswith(chr(96) * 3):
                clean_text = "\\n".join(lines[1:-1]).strip()
            else:
                clean_text = raw_text

            print(f"\\n[AI УСПЕХ] Ответ ({self.config.MODEL_NAME}):\\n{'-'*50}\\n{clean_text}\\n{'-'*50}\\n")
            self.response_ready.emit(clean_text)

        except Exception as err:
            error_msg = str(err)
            print(f"[AI ОШИБКА] {error_msg}")
            if "API_KEY_INVALID" in error_msg:
                user_msg = "Неверный Gemini API Key. Проверьте ключ."
            elif "RESOURCE_EXHAUSTED" in error_msg:
                user_msg = "Превышен лимит запросов API. Подождите пару секунд."
            else:
                user_msg = f"Ошибка модели {self.config.MODEL_NAME}: {error_msg}"
            self.error_occurred.emit(user_msg)

    def _execute_audio_analysis(self, audio_wav_bytes: bytes):
        print(f"\\n[AI] Запуск прямого анализа аудио через '{self.config.MODEL_NAME}'...")
        self.started.emit("Аудио собеседника (Zoom/Телемост)")

        if not GENAI_AVAILABLE:
            self.error_occurred.emit("Библиотека google-genai не найдена. Выполните: pip install google-genai")
            return

        api_key = self.config.GEMINI_API_KEY
        if not api_key:
            self.error_occurred.emit("GEMINI_API_KEY не указан!")
            return

        if not self._client:
            try:
                self._client = genai.Client(api_key=api_key)
            except Exception as e:
                self.error_occurred.emit(f"Ошибка клиента: {e}")
                return

        try:
            audio_part = types.Part.from_bytes(data=audio_wav_bytes, mime_type="audio/wav")

            print(f"[AI] Отправка аудиозаписи в модель '{self.config.MODEL_NAME}'...")
            response = self._client.models.generate_content(
                model=self.config.MODEL_NAME,
                contents=[
                    audio_part,
                    types.Part.from_text(
                        text="Прослушай аудиозапись собеседника из Zoom/Телемоста. "
                             "Дай ТОЧНЫЙ, ЧЕТКИЙ, БЕЗ ВОДЫ ответ на его вопрос. "
                             "Если вопрос по коду — выведи чистый готовый код на Python 3."
                    )
                ],
                config=types.GenerateContentConfig(
                    system_instruction=self.config.AUDIO_PROMPT,
                    max_output_tokens=1600,
                    temperature=0.1,
                )
            )

            if not response or not response.text:
                raise RuntimeError("Модель не вернула ответ на аудиозапись.")

            clean_text = response.text.strip()
            lines = clean_text.splitlines()
            if len(lines) >= 2 and lines[0].startswith(chr(96) * 3) and lines[-1].startswith(chr(96) * 3):
                clean_text = "\\n".join(lines[1:-1]).strip()

            print(f"\\n[AI ГОЛОС УСПЕХ] Ответ ({self.config.MODEL_NAME}):\\n{'-'*50}\\n{clean_text}\\n{'-'*50}\\n")
            self.response_ready.emit(clean_text)

        except Exception as err:
            self.error_occurred.emit(f"Ошибка аудио-анализа: {err}")


# ==============================================================================
# 3. HUD-ОВЕРЛЕЙ С РЕЖИМОМ CLICK-THROUGH, ИСТОРИЕЙ И КЛАВИАТУРНОЙ ПРОКРУТКОЙ
# ==============================================================================
class HUDOverlay(QWidget):
    def __init__(self, config: Config):
        super().__init__()
        self.config = config
        self.last_saved_response = "Предыдущих ответов пока нет. Нажмите ALT+SHIFT+S для анализа."
        self.last_saved_title = ""

        self._init_window_flags()
        self._init_ui()

        self.auto_hide_timer = QTimer(self)
        self.auto_hide_timer.setSingleShot(True)
        self.auto_hide_timer.timeout.connect(self.hide)

    def _init_window_flags(self):
        self.setWindowFlags(
            Qt.WindowType.WindowStaysOnTopHint
            | Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.Tool
            | Qt.WindowType.WindowDoesNotAcceptFocus
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setAttribute(Qt.WidgetAttribute.WA_ShowWithoutActivating, True)

    def _init_ui(self):
        self.setFixedSize(self.config.OVERLAY_WIDTH, self.config.OVERLAY_HEIGHT)

        self.card = QFrame(self)
        self.card.setGeometry(0, 0, self.config.OVERLAY_WIDTH, self.config.OVERLAY_HEIGHT)
        self.card.setStyleSheet("""
            QFrame {
                background-color: rgba(10, 15, 30, 248);
                border: 2px solid rgba(56, 189, 248, 0.6);
                border-radius: 14px;
            }
        """)

        layout = QVBoxLayout(self.card)
        layout.setContentsMargins(16, 12, 16, 12)
        layout.setSpacing(6)

        header_layout = QHBoxLayout()
        header_layout.setSpacing(8)

        self.status_dot = QLabel("●")
        self.status_dot.setStyleSheet("color: #38bdf8; font-size: 13px; background: transparent; border: none;")
        header_layout.addWidget(self.status_dot)

        self.status_label = QLabel("Ожидание")
        self.status_label.setStyleSheet("""
            color: #f8fafc;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 12px;
            font-weight: bold;
            background: transparent;
            border: none;
        """)
        header_layout.addWidget(self.status_label)

        header_layout.addStretch()

        py_badge = QLabel("Python Code Only")
        py_badge.setStyleSheet("""
            color: #38bdf8;
            background-color: rgba(56, 189, 248, 0.15);
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 5px;
            padding: 2px 6px;
            font-family: 'Consolas', monospace;
            font-size: 10px;
            font-weight: bold;
        """)
        header_layout.addWidget(py_badge)

        # Бейдж невидимости для захвата экрана (Zoom / Яндекс Телемост / Teams / OBS)
        if getattr(self.config, "HIDE_FROM_SCREEN_CAPTURE", True):
            stealth_badge = QLabel("🛡️ Capture Hidden")
            stealth_badge.setToolTip("Окно невидимо для Zoom, Яндекс Телемост, Teams, Discord, OBS (SetWindowDisplayAffinity)")
            stealth_badge.setStyleSheet("""
                color: #c084fc;
                background-color: rgba(192, 132, 252, 0.15);
                border: 1px solid rgba(192, 132, 252, 0.4);
                border-radius: 5px;
                padding: 2px 6px;
                font-family: 'Consolas', monospace;
                font-size: 10px;
                font-weight: bold;
            """)
            header_layout.addWidget(stealth_badge)

        self.badge_model = QLabel(self.config.MODEL_NAME)
        self.badge_model.setStyleSheet("""
            color: #a7f3d0;
            background-color: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 5px;
            padding: 2px 6px;
            font-family: 'Consolas', monospace;
            font-size: 10px;
        """)
        header_layout.addWidget(self.badge_model)

        layout.addLayout(header_layout)

        divider = QFrame()
        divider.setFrameShape(QFrame.Shape.HLine)
        divider.setStyleSheet("background-color: rgba(255, 255, 255, 0.12); max-height: 1px; border: none;")
        layout.addWidget(divider)

        self.text_area = QTextEdit()
        self.text_area.setReadOnly(True)
        self.text_area.setAcceptRichText(True)
        self.text_area.setStyleSheet("""
            QTextEdit {
                background: transparent;
                border: none;
                color: #f8fafc;
                font-family: 'Consolas', 'Fira Code', monospace;
                font-size: 13px;
                line-height: 1.45;
            }
            QScrollBar:vertical {
                border: none;
                background: rgba(255, 255, 255, 0.05);
                width: 6px;
                border-radius: 3px;
            }
            QScrollBar::handle:vertical {
                background: rgba(56, 189, 248, 0.5);
                border-radius: 3px;
            }
        """)
        layout.addWidget(self.text_area)

        footer_layout = QHBoxLayout()
        hint_scroll = QLabel(
            f"▲▼ {self.config.SCROLL_UP_HOTKEY.upper()}/{self.config.SCROLL_DOWN_HOTKEY.upper()}: скролл | "
            f"{self.config.AUDIO_HOTKEY.upper()}: микрофон/динамики | "
            f"{self.config.HIDE_HOTKEY.upper()}: скрыть | {self.config.SHOW_HOTKEY.upper()}: открыть"
        )
        hint_scroll.setStyleSheet("color: #64748b; font-size: 10px; background: transparent; border: none;")
        footer_layout.addWidget(hint_scroll)
        layout.addLayout(footer_layout)

    def _apply_stealth_and_click_through(self):
        try:
            hwnd = int(self.winId())

            ex_style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
            win32gui.SetWindowLong(
                hwnd,
                win32con.GWL_EXSTYLE,
                ex_style | win32con.WS_EX_TRANSPARENT
            )

            if getattr(self.config, "HIDE_FROM_SCREEN_CAPTURE", True):
                WDA_EXCLUDEFROMCAPTURE = 0x00000011
                res = ctypes.windll.user32.SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)
                if res == 0:
                    WDA_MONITOR = 0x00000001
                    ctypes.windll.user32.SetWindowDisplayAffinity(hwnd, WDA_MONITOR)
        except Exception as e:
            print(f"[HUDOverlay] Ошибка применения системных атрибутов: {e}")

    def showEvent(self, event):
        super().showEvent(event)
        self._apply_stealth_and_click_through()

    def reposition_to_corner(self):
        screen = QApplication.primaryScreen().availableGeometry()
        x = screen.right() - self.width() - self.config.CORNER_MARGIN
        y = screen.bottom() - self.height() - self.config.CORNER_MARGIN
        self.move(x, y)

    def scroll_up(self):
        if self.isVisible():
            bar = self.text_area.verticalScrollBar()
            bar.setValue(bar.value() - self.config.SCROLL_STEP)

    def scroll_down(self):
        if self.isVisible():
            bar = self.text_area.verticalScrollBar()
            bar.setValue(bar.value() + self.config.SCROLL_STEP)

    def show_recording_started(self):
        if self.auto_hide_timer.isActive():
            self.auto_hide_timer.stop()

        self.reposition_to_corner()
        self.status_dot.setText("●")
        self.status_dot.setStyleSheet("color: #ef4444; font-size: 13px; background: transparent; border: none;")
        self.status_label.setText("Запись входящей речи (Zoom / Телемост)...")

        self.text_area.setHtml(
            "<div style='margin-top: 6px;'>"
            "<p style='color: #f87171; font-weight: bold; font-size: 13px; font-family: Segoe UI, sans-serif;'>"
            "🎙️ Идет прослушивание голоса собеседника из динамиков..."
            "</p>"
            f"<p style='color: #cbd5e1; font-size: 11px; line-height: 1.5;'>"
            f"Когда собеседник закончит вопрос — нажмите <b>{self.config.AUDIO_HOTKEY.upper()}</b> еще раз.<br>"
            "Запись мгновенно отправится в Gemini для четкого, точного ответа без воды."
            "</p>"
            "</div>"
        )
        self.show()
        self._apply_stealth_and_click_through()

    def show_restored_response(self):
        self.reposition_to_corner()
        self.status_dot.setText("●")
        self.status_dot.setStyleSheet("color: #38bdf8; font-size: 13px; background: transparent; border: none;")
        self.status_label.setText("Сохраненный ответ")

        html_formatted = (
            self.last_saved_response.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\\n", "<br>")
        )
        self.text_area.setHtml(
            f"<div style='color: #f8fafc; font-size: 13px; font-family: Consolas, monospace; line-height: 1.45;'>{html_formatted}</div>"
        )
        self.show()
        self._apply_stealth_and_click_through()

    def show_thinking(self, window_title: str):
        if self.auto_hide_timer.isActive():
            self.auto_hide_timer.stop()

        self.last_saved_title = window_title
        self.reposition_to_corner()
        self.status_dot.setText("●")
        self.status_dot.setStyleSheet("color: #38bdf8; font-size: 13px; background: transparent; border: none;")

        title_short = (window_title[:26] + "...") if len(window_title) > 28 else window_title
        self.status_label.setText(f"Думаю... [{title_short}]" if title_short else "Думаю...")

        self.text_area.setHtml(
            "<p style='color: #94a3b8; font-style: italic; margin-top: 8px;'>"
            "Запрос отправлен в " + self.config.MODEL_NAME + "... Генерируется чистый Python-код без комментариев.<br>"
            "Фокус ввода в окне браузера сохранен."
            "</p>"
        )

        self.show()
        self._apply_stealth_and_click_through()

    def show_response(self, text: str):
        self.last_saved_response = text

        self.status_dot.setText("●")
        self.status_dot.setStyleSheet("color: #10b981; font-size: 13px; background: transparent; border: none;")
        self.status_label.setText("Готово")
        self.badge_model.setText(self.config.MODEL_NAME)

        html_formatted = (
            text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\\n", "<br>")
        )
        self.text_area.setHtml(
            f"<div style='color: #f8fafc; font-size: 13px; font-family: Consolas, monospace; line-height: 1.45;'>{html_formatted}</div>"
        )

        cursor = self.text_area.textCursor()
        cursor.movePosition(QTextCursor.MoveOperation.Start)
        self.text_area.setTextCursor(cursor)

        self.show()
        self._apply_stealth_and_click_through()

        if self.config.AUTO_HIDE_SECONDS > 0:
            self.auto_hide_timer.start(self.config.AUTO_HIDE_SECONDS * 1000)

    def show_error(self, message: str):
        self.status_dot.setText("●")
        self.status_dot.setStyleSheet("color: #ef4444; font-size: 13px; background: transparent; border: none;")
        self.status_label.setText("Ошибка")

        self.text_area.setHtml(
            f"<p style='color: #fca5a5; font-size: 12px;'><b>Ошибка:</b><br>{message}</p>"
        )
        self.show()
        self._apply_stealth_and_click_through()


# ==============================================================================
# 4. ДИСПЕТЧЕР ХОТКЕЕВ И СВЯЗКА (Safe Qt Bridge)
# ==============================================================================
class HotkeyBridge(QObject):
    trigger_capture = pyqtSignal()
    trigger_audio_toggle = pyqtSignal()
    trigger_hide = pyqtSignal()
    trigger_show = pyqtSignal()
    trigger_scroll_up = pyqtSignal()
    trigger_scroll_down = pyqtSignal()


class ApplicationController:
    def __init__(self, app: QApplication):
        self.app = app
        self.config = Config()

        self.overlay = HUDOverlay(self.config)
        self.recorder = AudioLoopbackRecorder()

        self.worker = GeminiWorker(self.config)
        self.worker.started.connect(self.overlay.show_thinking)
        self.worker.response_ready.connect(self.overlay.show_response)
        self.worker.error_occurred.connect(self.overlay.show_error)

        self.bridge = HotkeyBridge()
        self.bridge.trigger_capture.connect(self._handle_capture)
        self.bridge.trigger_audio_toggle.connect(self._handle_audio_toggle)
        self.bridge.trigger_hide.connect(self.overlay.hide)
        self.bridge.trigger_show.connect(self.overlay.show_restored_response)
        self.bridge.trigger_scroll_up.connect(self.overlay.scroll_up)
        self.bridge.trigger_scroll_down.connect(self.overlay.scroll_down)

        self._setup_hotkeys()

    def _setup_hotkeys(self):
        try:
            keyboard.add_hotkey(
                self.config.CAPTURE_HOTKEY,
                lambda: self.bridge.trigger_capture.emit(),
                suppress=False
            )
            keyboard.add_hotkey(
                self.config.AUDIO_HOTKEY,
                lambda: self.bridge.trigger_audio_toggle.emit(),
                suppress=False
            )
            keyboard.add_hotkey(
                self.config.HIDE_HOTKEY,
                lambda: self.bridge.trigger_hide.emit(),
                suppress=False
            )
            keyboard.add_hotkey(
                self.config.SHOW_HOTKEY,
                lambda: self.bridge.trigger_show.emit(),
                suppress=False
            )
            keyboard.add_hotkey(
                self.config.SCROLL_UP_HOTKEY,
                lambda: self.bridge.trigger_scroll_up.emit(),
                suppress=False
            )
            keyboard.add_hotkey(
                self.config.SCROLL_DOWN_HOTKEY,
                lambda: self.bridge.trigger_scroll_down.emit(),
                suppress=False
            )
            print("[OK] Горячие клавиши активны (Ctrl + Alt):")
            print(f"     • {self.config.CAPTURE_HOTKEY.upper()} — снимок и анализ окна")
            print(f"     • {self.config.AUDIO_HOTKEY.upper()} — СТАРТ / СТОП прослушки динамиков (голос собеседника в Zoom)")
            print(f"     • {self.config.HIDE_HOTKEY.upper()} — скрыть HUD")
            print(f"     • {self.config.SHOW_HOTKEY.upper()} — восстановить HUD с сохраненным ответом")
            print(f"     • {self.config.SCROLL_UP_HOTKEY.upper()} — прокрутка ответа ВВЕРХ")
            print(f"     • {self.config.SCROLL_DOWN_HOTKEY.upper()} — прокрутка ответа ВНИЗ")
        except Exception as e:
            print(f"[ОШИБКА] Не удалось зарегистрировать хоткеи: {e}")
            print("Запустите консоль от имени Администратора Windows!")

    def _handle_capture(self):
        hwnd, title, rect = WindowCapture.get_foreground_window()
        if not hwnd:
            self.overlay.show_error("Не удалось определить активное окно Windows.")
            return

        if hwnd == int(self.overlay.winId()):
            return

        img = WindowCapture.capture_window_from_memory(hwnd)
        if not img:
            self.overlay.show_error(
                f"Не удалось сделать снимок окна:\\n{title or 'Без названия'}"
            )
            return

        self.worker.analyze_async(img, title)

    def _handle_audio_toggle(self):
        if not self.recorder.is_recording:
            started = self.recorder.start()
            if started:
                self.overlay.show_recording_started()
            else:
                self.overlay.show_error(
                    "Не удалось включить аудиозахват. Убедитесь, что установлены sounddevice и numpy:\\n"
                    "pip install sounddevice numpy"
                )
        else:
            wav_bytes = self.recorder.stop()
            if wav_bytes:
                self.worker.analyze_audio_async(wav_bytes)
            else:
                self.overlay.show_error("Аудиозапись оказалась пустой или слишком короткой.")


# ==============================================================================
# ТОЧКА ВХОДА (MAIN)
# ==============================================================================
def main():
    print("=" * 70)
    print("AI Browser HUD Assistant запущен!")
    print(f"Модель: {Config.MODEL_NAME} (строго)")
    print(f"Хоткей анализа экрана:  {Config.CAPTURE_HOTKEY.upper()}")
    print(f"Хоткей прослушки речи:  {Config.AUDIO_HOTKEY.upper()} (старт/стоп записи голоса собеседника)")
    print(f"Хоткей скрытия:         {Config.HIDE_HOTKEY.upper()}")
    print(f"Хоткей возврата:        {Config.SHOW_HOTKEY.upper()} (показать предыдущий ответ)")
    print(f"Хоткей скролла вверх:   {Config.SCROLL_UP_HOTKEY.upper()}")
    print(f"Хоткей скролла вниз:    {Config.SCROLL_DOWN_HOTKEY.upper()}")
    print("Правило генерации: ТОЛЬКО чистый код Python 3 без комментариев и отступов.")
    print("Окно работает в режиме Click-Through (прозрачно для кликов мыши).")
    print("Защита от захвата экрана: SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE = 0x11) АКТИВНА.")
    print("-> Окно НЕВИДИМО в Zoom, Яндекс Телемост, Microsoft Teams, Discord, OBS Studio!")
    print("=" * 70)

    app = QApplication(sys.argv)
    app.setQuitOnLastWindowClosed(False)

    controller = ApplicationController(app)
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
`;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
