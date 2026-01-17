"""
Скрипт для настройки webhook Telegram бота

Использование:
python setup_webhook.py
"""

import requests
import os

TELEGRAM_BOT_TOKEN = "8555997475:AAHegFCmXVzlpTG3x9mAUMjMyrpARoNiGjk"
WEBHOOK_URL = "https://functions.poehali.dev/475a3d5b-8b0b-413b-b4dd-71318038759e"

def set_webhook():
    """Установка webhook для бота"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
    data = {
        "url": WEBHOOK_URL,
        "allowed_updates": ["message", "callback_query"]
    }
    
    response = requests.post(url, json=data)
    result = response.json()
    
    print("Результат установки webhook:")
    print(result)
    
    if result.get("ok"):
        print("\n✅ Webhook успешно установлен!")
    else:
        print("\n❌ Ошибка установки webhook")
    
    return result

def get_webhook_info():
    """Получение информации о webhook"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
    
    response = requests.get(url)
    result = response.json()
    
    print("\nИнформация о webhook:")
    if result.get("ok"):
        info = result.get("result", {})
        print(f"URL: {info.get('url', 'не установлен')}")
        print(f"Pending updates: {info.get('pending_update_count', 0)}")
        if info.get('last_error_message'):
            print(f"Последняя ошибка: {info.get('last_error_message')}")
    
    return result

def set_commands():
    """Установка меню команд бота"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setMyCommands"
    commands = [
        {"command": "start", "description": "Начать работу с ботом"},
        {"command": "menu", "description": "Главное меню"},
        {"command": "requests", "description": "Список активных заявок"},
        {"command": "stats", "description": "Статистика работы"},
        {"command": "help", "description": "Справка по командам"}
    ]
    
    data = {"commands": commands}
    
    response = requests.post(url, json=data)
    result = response.json()
    
    print("\nРезультат установки команд:")
    print(result)
    
    if result.get("ok"):
        print("✅ Команды успешно установлены!")
    else:
        print("❌ Ошибка установки команд")
    
    return result

if __name__ == "__main__":
    print("🤖 Настройка Telegram бота для Альфа-Банк Колл-Центра\n")
    
    print("1. Установка webhook...")
    set_webhook()
    
    print("\n2. Установка команд...")
    set_commands()
    
    print("\n3. Проверка webhook...")
    get_webhook_info()
    
    print("\n✅ Настройка завершена!")
    print(f"\nТеперь откройте бота в Telegram и отправьте /start")
    print(f"Webhook URL: {WEBHOOK_URL}")
