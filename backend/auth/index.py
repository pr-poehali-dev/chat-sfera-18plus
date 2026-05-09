import json
import os
import hashlib
import base64
import boto3
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p91242628_chat_sfera_18plus')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def check_admin(cur, admin_id):
    cur.execute("SELECT role FROM " + SCHEMA + ".users WHERE id = " + str(int(admin_id)))
    row = cur.fetchone()
    return row and row[0] == 'admin'

def handler(event: dict, context) -> dict:
    """Сфера18+: авторизация, управление пользователями, профиль, аватары"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    # login
    if action == 'login':
        username = body.get('username', '').strip()
        password = body.get('password', '').strip()
        if not username or not password:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Введите логин и пароль'})}

        pw_hash = hashlib.md5(password.encode()).hexdigest()
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, username, role, banned, avatar_url, display_name, bio FROM " + SCHEMA + ".users WHERE username = '" + username.replace("'", "''") + "' AND password_hash = '" + pw_hash + "'")
        row = cur.fetchone()
        conn.close()

        if not row:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный логин или пароль'})}
        if row[3]:
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Ваш аккаунт заблокирован'})}

        user = {'id': row[0], 'username': row[1], 'role': row[2], 'avatar_url': row[4], 'display_name': row[5], 'bio': row[6]}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'user': user})}

    # create_user
    if action == 'create_user':
        admin_id = body.get('admin_id', 0)
        conn = get_conn()
        cur = conn.cursor()
        if not check_admin(cur, admin_id):
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Доступ запрещён'})}

        new_username = body.get('new_username', '').strip().replace("'", "''")
        new_password = body.get('new_password', '').strip()
        role = body.get('role', 'user')
        if role not in ('admin', 'user'): role = 'user'
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

    # get_users
    if action == 'get_users':
        admin_id = body.get('admin_id', 0)
        conn = get_conn()
        cur = conn.cursor()
        if not check_admin(cur, admin_id):
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Доступ запрещён'})}

        cur.execute("SELECT id, username, role, created_at, banned, avatar_url, display_name FROM " + SCHEMA + ".users ORDER BY created_at DESC")
        rows = cur.fetchall()
        conn.close()
        users = [{'id': r[0], 'username': r[1], 'role': r[2], 'created_at': str(r[3]), 'banned': r[4], 'avatar_url': r[5], 'display_name': r[6]} for r in rows]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'users': users})}

    # ban_user
    if action == 'ban_user':
        admin_id = body.get('admin_id', 0)
        target_id = int(body.get('target_id', 0))
        banned = bool(body.get('banned', True))
        conn = get_conn()
        cur = conn.cursor()
        if not check_admin(cur, admin_id):
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Доступ запрещён'})}
        cur.execute("UPDATE " + SCHEMA + ".users SET banned = " + str(banned) + " WHERE id = " + str(target_id))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # delete_user
    if action == 'delete_user':
        admin_id = body.get('admin_id', 0)
        target_id = int(body.get('target_id', 0))
        conn = get_conn()
        cur = conn.cursor()
        if not check_admin(cur, admin_id):
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Доступ запрещён'})}
        cur.execute("DELETE FROM " + SCHEMA + ".users WHERE id = " + str(target_id))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # change_role
    if action == 'change_role':
        admin_id = body.get('admin_id', 0)
        target_id = int(body.get('target_id', 0))
        new_role = body.get('role', 'user')
        if new_role not in ('admin', 'user'): new_role = 'user'
        conn = get_conn()
        cur = conn.cursor()
        if not check_admin(cur, admin_id):
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Доступ запрещён'})}
        cur.execute("UPDATE " + SCHEMA + ".users SET role = '" + new_role + "' WHERE id = " + str(target_id))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # change_password (admin for any user, or self)
    if action == 'change_password':
        admin_id = body.get('admin_id', 0)
        target_id = int(body.get('target_id', 0))
        new_password = body.get('new_password', '').strip()
        if not new_password:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажите пароль'})}
        conn = get_conn()
        cur = conn.cursor()
        if int(admin_id) != target_id and not check_admin(cur, admin_id):
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Доступ запрещён'})}
        new_hash = hashlib.md5(new_password.encode()).hexdigest()
        cur.execute("UPDATE " + SCHEMA + ".users SET password_hash = '" + new_hash + "' WHERE id = " + str(target_id))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # update_profile — обновление display_name и bio
    if action == 'update_profile':
        user_id = int(body.get('user_id', 0))
        display_name = body.get('display_name', '').strip().replace("'", "''")[:100]
        bio = body.get('bio', '').strip().replace("'", "''")[:500]
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("UPDATE " + SCHEMA + ".users SET display_name = '" + display_name + "', bio = '" + bio + "' WHERE id = " + str(user_id))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # upload_avatar — загрузка аватара в S3
    if action == 'upload_avatar':
        user_id = int(body.get('user_id', 0))
        file_data = body.get('file_data', '')
        file_ext = body.get('file_ext', 'jpg').lower().replace('.', '')
        if file_ext not in ('jpg', 'jpeg', 'png', 'webp', 'gif'): file_ext = 'jpg'

        raw = base64.b64decode(file_data)
        key = 'avatars/user_' + str(user_id) + '.' + file_ext
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        ct_map = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp', 'gif': 'image/gif'}
        s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=ct_map.get(file_ext, 'image/jpeg'))
        cdn_url = 'https://cdn.poehali.dev/projects/' + os.environ['AWS_ACCESS_KEY_ID'] + '/files/' + key

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("UPDATE " + SCHEMA + ".users SET avatar_url = '" + cdn_url + "' WHERE id = " + str(user_id))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'avatar_url': cdn_url})}

    # upload_media — загрузка фото/видео для чата
    if action == 'upload_media':
        user_id = int(body.get('user_id', 0))
        file_data = body.get('file_data', '')
        file_ext = body.get('file_ext', 'jpg').lower().replace('.', '')
        import time
        ts = str(int(time.time() * 1000))
        video_exts = ('mp4', 'mov', 'avi', 'webm', 'mkv')
        is_video = file_ext in video_exts
        key = ('media/video_' if is_video else 'media/photo_') + str(user_id) + '_' + ts + '.' + file_ext
        raw = base64.b64decode(file_data)
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        ct_map = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp', 'gif': 'image/gif',
            'mp4': 'video/mp4', 'mov': 'video/quicktime', 'avi': 'video/avi', 'webm': 'video/webm', 'mkv': 'video/x-matroska'
        }
        s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=ct_map.get(file_ext, 'application/octet-stream'))
        cdn_url = 'https://cdn.poehali.dev/projects/' + os.environ['AWS_ACCESS_KEY_ID'] + '/files/' + key
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'url': cdn_url, 'type': 'video' if is_video else 'photo'})}

    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Unknown action'})}
