#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

import redis
import time
import requests
import json
import mysql.connector as db
from steam import SteamClient
from steam.enums import EResult
import pymysql.cursors

r = redis.StrictRedis(host='redis', port=6379, db=0, charset="utf-8", decode_responses=True)

def list_of_jsons_to_json(dict_list):
    result = {}

    for item in dict_list:
        if (item["package"]):
            if result.get(item["appid"]):
                result.get(item["appid"]).append(item["package"])
            else:
                result[item["appid"]] = [item["package"]]

    return result

def get_release_date(appid):
    response = requests.get('https://store.steampowered.com/api/appdetails/?filters=release_date&appids=' + str(appid)).json()
    if response.get(str(appid), {}).get('success') == True:
        return response.get(str(appid), {}).get('data', {}).get('release_date', {}).get('date')
    
    return None

def handle_db_connection():
    conn = pymysql.connect(host='localhost',
                            user='user',
                            password='passwd',
                            db='db',
                            charset='utf8mb4',
                            cursorclass=pymysql.cursors.DictCursor)
                            
    return conn

def update_db_with_app(app):
    conn = handle_db_connection()

    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO `users` \
                (`email`, `password`) \
                VALUES (%s, %s)"
            
            cursor.execute(sql, ('email', 'secret'))
        conn.commit()
    finally:
        conn.close()

def update_db_with_package(package, app_id):
    conn = handle_db_connection()

    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO `users` \
                (`email`, `password`) \
                VALUES (%s, %s)"
            
            cursor.execute(sql, ('email', 'secret'))
        conn.commit()
    finally:
        conn.close()

def handle_app(app, app_to_packages):
    app_id = app.get('appid')
    release_state = app.get('common', {}).get('releasestate')
    app_type = app.get('common', {}).get('type', '').lower()
    release_date = get_release_date(app_id)
    name = app.get('common', {}).get('name')
    developer = app.get('extended', {}).get('developer')
    publisher = app.get('extended', {}).get('publisher')
    is_free_app = app.get('extended', {}).get('isfreeapp')
    section_type = app.get('common', {}).get('section_type')
    dlc_app_id = app.get('common', {}).get('parent')

    app_json = {
        'app_id': app_id,
        'release_state': release_state,
        'app_type': app_type,
        'release_date': release_date,
        'name': name,
        'developer': developer,
        'publisher': publisher,
        'is_free_app': is_free_app,
        'section_type': section_type,
        'dlc_app_id': dlc_app_id
    }

    update_db_with_app(app_json)
    
    for package_json in app_to_packages[app_id]:
        update_db_with_package(package_json, app_id)
    
def connect_to_steam():
    client = SteamClient()

    result = client.anonymous_login()

    if result != EResult.OK:
        print("Failed to login: {}".format(result))
        raise SystemExit
    
    return client

def is_valid_app(app):
    releasestate = app.get('common', {}).get('releasestate', '').lower()
    apptype = app.get('common', {}).get('type', '').lower()

    if (apptype != 'game' and apptype != 'dlc') or releasestate == 'prerelease':
        print ('[{}] releasestate: {}, apptype: {}'.format(app.get('appid'), releasestate, apptype))
        return False
    
    return True

def update_changenumber(changenumber):
    print('Changenumber: {}'.format(changenumber))

def str2bool(v):
    if v != None:
        return v in ('1', 'true', 'True', 1)
    
    return False

while True:
    pipe = r.pipeline()

    pipe.get('current_change')
    pipe.lrange('apps-queue', 0, 49)
    pipe.ltrim('apps-queue', 50, -1)

    pipe_response = pipe.execute()

    changenumber = pipe_response[0]
    apps = [json.loads(app) for app in pipe_response[1]]
    app_to_packages = list_of_jsons_to_json(apps)
    app_ids = [int(app_id) for app_id in apps]

    if not app_ids:
        time.sleep(5)
        continue

    print (app_ids)
    client = connect_to_steam()
    while True:
        try:
            data = client.get_product_info(apps=app_ids)

            for app in data.get('apps', {}).values():
                if is_valid_app(app):
                    handle_app(app, app_to_packages)
            
            break
        except AttributeError:
            print ('Didn\'t get any apps, retrying in 5 seconds...')
            time.sleep(5)
            pass
        
    update_changenumber(changenumber)
    time.sleep(30)