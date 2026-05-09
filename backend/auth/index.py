import json
import os
import hashlib
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p91242628_chat_sfera_18plus')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Авторизация: вход по логину/паролю и создание пользователей (только для админов)"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    # login — вход по логину/паролю
    if action == 'login':
        username = body.get('username', '').strip()
        password = body.get('password', '').strip()
        if not username or not password:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Введите логин и пароль'})}

        pw_hash = hashlib.md5(password.encode()).hexdigest()
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, username, role FROM " + SCHEMA + ".users WHERE username = '" + username.replace("'", "''") + "' AND password_hash = '" + pw_hash + "'")
        row = cur.fetchone()
        conn.close()

        if not row:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный логин или пароль'})}

        user = {'id': row[0], 'username': row[1], 'role': row[2]}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'user': user})}

    # create_user — создание пользователя (только admin, проверяем по admin_id)
    if action == 'create_user':
        admin_id = int(body.get('admin_id', 0))

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT role FROM " + SCHEMA + ".users WHERE id = " + str(admin_id))
        row = cur.fetchone()

        if not row or row[0] != 'admin':
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Доступ запрещён'})}

        new_username = body.get('new_username', '').strip().replace("'", "''")
        new_password = body.get('new_password', '').strip()
        role = body.get('role', 'user')
        if role not in ('admin', 'user'):
            role = 'user'

        if not new_username or not new_password:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажите логин и пароль'})}

        new_hash = hashlib.md5(new_password.encode()).hexdigest()
        try:
            cur.execute("INSERT INTO " + SCHEMA + ".users (username, password_hash, role) VALUES ('" + new_username + "', '" + new_hash + "', '" + role + "') RETURNING id")
            new_id = cur.fetchone()[0]
            conn.commit()
            conn.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'id': new_id, 'username': new_username, 'role': role})}
        except Exception:
            conn.close()
            return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Такой логин уже существует'})}

    # get_users — список пользователей (только admin, проверяем по admin_id)
    if action == 'get_users':
        admin_id = int(body.get('admin_id', 0))

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT role FROM " + SCHEMA + ".users WHERE id = " + str(admin_id))
        row = cur.fetchone()

        if not row or row[0] != 'admin':
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Доступ запрещён'})}

        cur.execute("SELECT id, username, role, created_at FROM " + SCHEMA + ".users ORDER BY created_at DESC")
        rows = cur.fetchall()
        conn.close()

        users = [{'id': r[0], 'username': r[1], 'role': r[2], 'created_at': str(r[3])} for r in rows]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'users': users})}

    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Unknown action'})}