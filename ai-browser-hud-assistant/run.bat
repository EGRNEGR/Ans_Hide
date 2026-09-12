@echo off
chcp 65001 >nul
title AI Browser HUD Assistant Launcher
echo ========================================================
echo   AI Browser HUD Assistant (Windows 10/11)
echo   Проверка окружения и запуск...
echo ========================================================
echo.

:: Проверка прав администратора
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ВНИМАНИЕ] Рекомендуется запуск от имени Администратора!
    echo Библиотека "keyboard" требует прав Администратора для перехвата
    echo глобальных хоткеев (Alt+Shift+S) в Windows.
    echo Если хоткеи не реагируют, перезапустите: Правой кнопкой -> "Запуск от имени администратора".
    echo.
)

:: Проверка наличия Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Python не найден в системе!
    echo Установите Python 3.10+ с официального сайта python.org
    echo (Обязательно включите галочку "Add python.exe to PATH").
    pause
    exit /b
)

:: Установка зависимостей
echo [1/2] Проверка зависимостей...
pip install -r requirements.txt --quiet

:: Проверка ключа API
if "%GEMINI_API_KEY%"=="" (
    echo.
    echo [ИНФО] Переменная GEMINI_API_KEY не обнаружена.
    set /p USER_KEY="Введите ваш Gemini API Key (или нажмите Enter, если он уже вписан в .py): "
    if not "%USER_KEY%"=="" (
        set GEMINI_API_KEY=%USER_KEY%
    )
)

echo.
echo [2/2] Запуск AI Browser HUD Assistant...
echo - Хоткей захвата: Alt + Shift + S
echo - Хоткей скрытия: Alt + Shift + C
echo - Режим: Click-Through (клики проходят сквозь оверлей)
echo.
python browser_ai_hud.py

pause
