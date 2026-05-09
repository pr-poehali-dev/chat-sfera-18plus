import json
import os
import base64
import uuid
import boto3

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def handler(event: dict, context) -> dict:
    """Загрузка файлов (фото, видео, аватарки) в S3 хранилище"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    file_data = body.get('file')
    file_type = body.get('type', 'image/jpeg')
    folder = body.get('folder', 'media')

    if not file_data:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нет файла'})}

    ext_map = {
        'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
        'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm',
        'video/quicktime': 'mov',
    }
    ext = ext_map.get(file_type, 'bin')
    filename = f"{folder}/{uuid.uuid4()}.{ext}"

    if ',' in file_data:
        file_data = file_data.split(',', 1)[1]
    file_bytes = base64.b64decode(file_data)

    max_size = 50 * 1024 * 1024
    if len(file_bytes) > max_size:
        return {'statusCode': 413, 'headers': CORS, 'body': json.dumps({'error': 'Файл слишком большой (макс 50 МБ)'})}

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=filename, Body=file_bytes, ContentType=file_type)

    access_key = os.environ['AWS_ACCESS_KEY_ID']
    url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{filename}"

    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'url': url, 'filename': filename})}
