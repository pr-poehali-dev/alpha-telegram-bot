import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """Telegram бот для колл-центра Альфа-Банка"""
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        
        body = json.loads(body_str)
        
        if body.get('message'):
            return handle_message(body['message'])
        elif body.get('callback_query'):
            return handle_callback(body['callback_query'])
        
        return response(200, {'ok': True})
    
    except Exception as e:
        return response(500, {'error': str(e)})


def handle_message(message: dict) -> dict:
    """Обработка входящих сообщений"""
    chat_id = message['chat']['id']
    text = message.get('text', '')
    user = message['from']
    
    if text == '/start':
        return send_welcome(chat_id, user)
    elif text == '/menu':
        return send_main_menu(chat_id)
    elif text == '/requests':
        return send_requests_list(chat_id)
    elif text == '/stats':
        return send_statistics(chat_id)
    elif text == '/help':
        return send_help(chat_id)
    else:
        return send_message(chat_id, '❓ Неизвестная команда. Используйте /menu для вызова меню.')


def handle_callback(callback: dict) -> dict:
    """Обработка нажатий на кнопки"""
    chat_id = callback['message']['chat']['id']
    data = callback['data']
    
    if data == 'block_card':
        return send_block_card_form(chat_id)
    elif data == 'block_app':
        return send_block_app_form(chat_id)
    elif data == 'reissue_card':
        return send_reissue_card_form(chat_id)
    elif data == 'view_requests':
        return send_requests_list(chat_id)
    elif data.startswith('request_'):
        request_id = data.split('_')[1]
        return send_request_details(chat_id, request_id)
    elif data.startswith('complete_'):
        request_id = data.split('_')[1]
        return complete_request(chat_id, request_id)
    
    return response(200, {'ok': True})


def send_welcome(chat_id: int, user: dict) -> dict:
    """Приветственное сообщение"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "INSERT INTO admins (telegram_id, username, full_name) VALUES (%s, %s, %s) ON CONFLICT (telegram_id) DO UPDATE SET username = EXCLUDED.username",
            (chat_id, user.get('username', ''), f"{user.get('first_name', '')} {user.get('last_name', '')}")
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()
    
    welcome_text = """🏦 *Добро пожаловать в систему Альфа-Банк Колл-Центр*

Вы успешно авторизованы как администратор.

Доступные команды:
/menu - Главное меню
/requests - Список заявок
/stats - Статистика
/help - Справка

Используйте /menu для начала работы."""
    
    return send_message(chat_id, welcome_text, parse_mode='Markdown')


def send_main_menu(chat_id: int) -> dict:
    """Главное меню с кнопками"""
    keyboard = {
        'inline_keyboard': [
            [
                {'text': '🛡️ Блокировка карты', 'callback_data': 'block_card'},
                {'text': '📱 Блокировка приложения', 'callback_data': 'block_app'}
            ],
            [
                {'text': '💳 Перевыпуск карты', 'callback_data': 'reissue_card'}
            ],
            [
                {'text': '📋 Список заявок', 'callback_data': 'view_requests'}
            ]
        ]
    }
    
    return send_message(
        chat_id,
        '📊 *Главное меню администратора*\n\nВыберите действие:',
        reply_markup=keyboard,
        parse_mode='Markdown'
    )


def send_requests_list(chat_id: int) -> dict:
    """Список активных заявок"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            SELECT r.id, r.request_type, r.priority, r.status, r.created_at,
                   c.full_name, c.phone
            FROM requests r
            JOIN clients c ON r.client_id = c.id
            WHERE r.status IN ('pending', 'processing')
            ORDER BY 
                CASE r.priority 
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    ELSE 3
                END,
                r.created_at DESC
            LIMIT 10
        """)
        
        requests = cur.fetchall()
        
        if not requests:
            return send_message(chat_id, '✅ Нет активных заявок')
        
        keyboard = {'inline_keyboard': []}
        text = '*📋 Активные заявки:*\n\n'
        
        for req in requests:
            priority_emoji = '🔴' if req['priority'] == 'high' else '🟡' if req['priority'] == 'medium' else '🟢'
            status_emoji = '⏳' if req['status'] == 'pending' else '🔄'
            
            text += f"{priority_emoji} {status_emoji} *#{req['id']}* {req['request_type']}\n"
            text += f"👤 {req['full_name']}\n"
            text += f"📞 {req['phone']}\n\n"
            
            keyboard['inline_keyboard'].append([
                {'text': f"Заявка #{req['id']}", 'callback_data': f"request_{req['id']}"}
            ])
        
        return send_message(chat_id, text, reply_markup=keyboard, parse_mode='Markdown')
        
    finally:
        cur.close()
        conn.close()


def send_request_details(chat_id: int, request_id: str) -> dict:
    """Детали заявки"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            SELECT r.*, c.full_name, c.phone, c.email, c.card_number
            FROM requests r
            JOIN clients c ON r.client_id = c.id
            WHERE r.id = %s
        """, (request_id,))
        
        req = cur.fetchone()
        
        if not req:
            return send_message(chat_id, '❌ Заявка не найдена')
        
        text = f"""*📋 Заявка #{req['id']}*

*Тип:* {req['request_type']}
*Приоритет:* {req['priority']}
*Статус:* {req['status']}

*👤 Клиент:*
ФИО: {req['full_name']}
Телефон: {req['phone']}
Email: {req['email'] or 'не указан'}
Карта: {req['card_number'] or 'не указана'}

*Описание:*
{req['description'] or 'нет описания'}

*Создано:* {req['created_at']}"""
        
        keyboard = {'inline_keyboard': []}
        
        if req['status'] != 'completed':
            keyboard['inline_keyboard'].append([
                {'text': '✅ Завершить заявку', 'callback_data': f"complete_{req['id']}"}
            ])
        
        return send_message(chat_id, text, reply_markup=keyboard, parse_mode='Markdown')
        
    finally:
        cur.close()
        conn.close()


def complete_request(chat_id: int, request_id: str) -> dict:
    """Завершение заявки"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            UPDATE requests 
            SET status = 'completed', updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING client_id, request_type
        """, (request_id,))
        
        result = cur.fetchone()
        
        if result:
            cur.execute("""
                INSERT INTO audit_logs (action, admin_telegram_id, client_id, request_id, details)
                VALUES (%s, %s, %s, %s, %s)
            """, (result['request_type'], chat_id, result['client_id'], request_id, 'Заявка успешно завершена'))
            
            conn.commit()
            
            return send_message(chat_id, f'✅ Заявка #{request_id} успешно завершена!')
        else:
            return send_message(chat_id, '❌ Ошибка при завершении заявки')
        
    finally:
        cur.close()
        conn.close()


def send_statistics(chat_id: int) -> dict:
    """Статистика работы"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'processing') as processing,
                COUNT(*) FILTER (WHERE status = 'completed') as completed
            FROM requests
        """)
        
        stats = cur.fetchone()
        
        cur.execute("""
            SELECT request_type, COUNT(*) as count
            FROM requests
            GROUP BY request_type
            ORDER BY count DESC
            LIMIT 5
        """)
        
        top_types = cur.fetchall()
        
        text = f"""*📊 Статистика*

*Всего заявок:* {stats['total']}
*В очереди:* {stats['pending']}
*В работе:* {stats['processing']}
*Завершено:* {stats['completed']}

*Топ типов заявок:*
"""
        
        for t in top_types:
            text += f"• {t['request_type']}: {t['count']}\n"
        
        return send_message(chat_id, text, parse_mode='Markdown')
        
    finally:
        cur.close()
        conn.close()


def send_block_card_form(chat_id: int) -> dict:
    """Форма блокировки карты"""
    text = """*🛡️ Блокировка карты*

Для блокировки карты отправьте данные в формате:
```
/block_card
Номер карты: 1234 5678 9012 3456
Телефон: +7 999 123 45 67
Причина: утеря
```

Доступные причины: утеря, кража, мошенничество, по запросу клиента"""
    
    return send_message(chat_id, text, parse_mode='Markdown')


def send_block_app_form(chat_id: int) -> dict:
    """Форма блокировки приложения"""
    text = """*📱 Блокировка приложения*

Для блокировки приложения отправьте данные в формате:
```
/block_app
Телефон: +7 999 123 45 67
Email: client@example.com
Причина: утеря устройства
```"""
    
    return send_message(chat_id, text, parse_mode='Markdown')


def send_reissue_card_form(chat_id: int) -> dict:
    """Форма перевыпуска карты"""
    text = """*💳 Перевыпуск карты*

Для перевыпуска карты отправьте данные в формате:
```
/reissue_card
Номер карты: 1234 5678 9012 3456
Телефон: +7 999 123 45 67
Адрес: г. Москва, ул. Ленина, д. 1
Доставка: стандартная
```"""
    
    return send_message(chat_id, text, parse_mode='Markdown')


def send_help(chat_id: int) -> dict:
    """Справка по командам"""
    text = """*📖 Справка по командам*

*Основные команды:*
/start - Начало работы
/menu - Главное меню
/requests - Список активных заявок
/stats - Статистика работы
/help - Эта справка

*Операции:*
• Блокировка карты
• Блокировка приложения
• Перевыпуск карты
• Просмотр заявок
• Завершение заявок

Для выполнения операций используйте кнопки в меню (/menu)"""
    
    return send_message(chat_id, text, parse_mode='Markdown')


def send_message(chat_id: int, text: str, reply_markup: dict = None, parse_mode: str = None) -> dict:
    """Отправка сообщения через Telegram API"""
    import urllib.request
    import urllib.parse
    
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': text
    }
    
    if reply_markup:
        data['reply_markup'] = json.dumps(reply_markup)
    
    if parse_mode:
        data['parse_mode'] = parse_mode
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read())
            return response(200, result)
    except Exception as e:
        return response(500, {'error': str(e)})


def get_db_connection():
    """Подключение к БД"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def response(status: int, body: dict) -> dict:
    """Формирование ответа"""
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False
    }