#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

import os
import ast
import json
import time
import redis
import schedule
import requests
import sentry_sdk
import pymysql.cursors
from datetime import datetime
from steam import SteamClient
from steam.enums import EResult

LOG_PREFIX = "[apps-updater] "
REDIS_BATCH_SIZE = 50

MYSQL_HOST = "mariadb"
MYSQL_DATABASE = os.environ['MYSQL_DATABASE']
MYSQL_USER = os.environ['MYSQL_USER']
MYSQL_PASSWORD = os.environ['MYSQL_PASSWORD']

SENTRY_KEY = os.environ['SENTRY_KEY']
SENTRY_PROJECT = os.environ['SENTRY_PROJECT']
SENTRY_URL = "https://{}@sentry.io/{}".format(SENTRY_KEY, SENTRY_PROJECT)

def list_of_jsons_to_json(dict_list):
    result = {}

    for item in dict_list:
        item = ast.literal_eval(item)

        if item["package"]:
            if result.get(item["app_id"]):
                result.get(item["app_id"]).append(item["package"])
            else:
                result[item["app_id"]] = [item["package"]]
        else:
            result[item["app_id"]] = []

    return result

def get_release_date(appid):
    STEAM_API_URL = 'https://store.steampowered.com/api/appdetails/?filters=release_date&appids=' + str(appid)
    
    while True:
        try:
            response = requests.get(STEAM_API_URL).json()
            if response:
                break
        except json.decoder.JSONDecodeError:
            print (LOG_PREFIX + '[' + str(appid) + '] Error while getting release date, retrying in 3 seconds...')
            time.sleep(3)

    if response.get(str(appid), {}).get('success'):
        return response.get(str(appid), {}).get('data', {}).get('release_date', {}).get('date')
    
    return None

def handle_db_connection():
    conn = pymysql.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        db=MYSQL_DATABASE,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor)
                            
    return conn

def update_db_with_app(app):
    print(LOG_PREFIX + 'App: {}'.format(str(app['app_id'])))

    conn = handle_db_connection()
    updated_at = datetime.utcnow()

    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO `apps` \
                VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) \
                ON DUPLICATE KEY UPDATE \
                    appid=%s, \
                    name=%s, \
                    type=%s, \
                    developer=%s, \
                    publisher=%s, \
                    release_date=%s, \
                    dlcforappid=%s, \
                    isfreeapp=%s, \
                    section_type=%s, \
                    releasestate=%s, \
                    updated_at=%s"

            cursor.execute(sql, (
                app['app_id'], 
                app['name'],
                app['app_type'],
                app['developer'], 
                app['publisher'], 
                app['release_date'], 
                app['dlc_app_id'],
                app['is_free_app'], 
                app['section_type'], 
                app['release_state'],
                updated_at,
                app['app_id'], 
                app['name'],
                app['app_type'],
                app['developer'], 
                app['publisher'], 
                app['release_date'], 
                app['dlc_app_id'],
                app['is_free_app'], 
                app['section_type'], 
                app['release_state'],
                updated_at))
        conn.commit()
    finally:
        conn.close()
        
def update_db_with_existing_app(app):
    print(LOG_PREFIX + 'Existing app: {}'.format(str(app['app_id'])))

    conn = handle_db_connection()
    updated_at = datetime.utcnow()

    try:
        with conn.cursor() as cursor:
            sql = "UPDATE `apps` SET\
                    name=%s, \
                    type=%s, \
                    developer=%s, \
                    publisher=%s, \
                    release_date=%s, \
                    dlcforappid=%s, \
                    isfreeapp=%s, \
                    section_type=%s, \
                    releasestate=%s, \
                    updated_at=%s \
                WHERE appid=%s"

            cursor.execute(sql, (
                app['name'],
                app['app_type'],
                app['developer'], 
                app['publisher'], 
                app['release_date'], 
                app['dlc_app_id'],
                app['is_free_app'], 
                app['section_type'], 
                app['release_state'],
                updated_at,
                app['app_id']))
        conn.commit()
    finally:
        conn.close()

def update_db_with_package(package, app_id):
    print(LOG_PREFIX + 'Package: {} - {}'.format(app_id, str(package['package_id'])))
    conn = handle_db_connection()
    updated_at = datetime.utcnow()

    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO `packages` \
                VALUES(%s, %s, %s, %s, %s, %s, %s, %s) \
                ON DUPLICATE KEY UPDATE \
                    appid=%s, \
                    subid=%s, \
                    billingtype=%s, \
                    AllowPurchaseFromRestrictedCountries=%s, \
                    PurchaseRestrictedCountries=%s, \
                    AllowCrossRegionTradingAndGifting=%s, \
                    onlyallowrunincountries=%s, \
                    updated_at=%s"

            cursor.execute(sql, (
                app_id, 
                package['package_id'], 
                package['billing_type'],
                package['allow_purchase_from_restricted_countries'], 
                package['purchase_restricted_countries'], 
                package['allow_cross_region_trading_and_gifting'], 
                package['only_allow_run_in_countries'], 
                updated_at,
                app_id, 
                package['package_id'], 
                package['billing_type'],
                package['allow_purchase_from_restricted_countries'], 
                package['purchase_restricted_countries'], 
                package['allow_cross_region_trading_and_gifting'], 
                package['only_allow_run_in_countries'], 
                updated_at))
        conn.commit()
    finally:
        conn.close()

def handle_app(app, app_to_packages):
    app_id = int(app.get('appid'))
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

    if len(app_to_packages[app_id]) > 0:
        update_db_with_app(app_json)
    else:
        update_db_with_existing_app(app_json)
    
    for package_json in app_to_packages[app_id]:
        update_db_with_package(package_json, app_id)
    
def connect_to_steam():
    client = SteamClient()
    
    while True:
        result = client.anonymous_login()

        if result == EResult.OK:
            break
        else:
            print(LOG_PREFIX + 'Error while logging, retrying in 10 seconds...')
            time.sleep(10)
    
    return client

def is_valid_app(app):
    releasestate = app.get('common', {}).get('releasestate', '').lower()
    apptype = app.get('common', {}).get('type', '').lower()

    if (apptype != 'game' and apptype != 'dlc') or releasestate == 'prerelease':
        print(LOG_PREFIX + '[{}] releasestate: {}, apptype: {}'.format(app.get('appid'), releasestate, apptype))
        return False
    
    return True

def str2bool(v):
    if v:
        return v in ('1', 'true', 'True', 1)
    
    return False

def update_db_with_new_released_app(app):
    print(LOG_PREFIX + '[' + str(app['id']) + '] New released app: ' + app['name'])
    conn = handle_db_connection()

    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO `new_releases` \
                VALUES(%s, %s) \
                ON DUPLICATE KEY UPDATE \
                    appid=%s, \
                    name=%s"

            cursor.execute(sql, (
                app['id'],
                app['name'],
                app['id'], 
                app['name']))
        conn.commit()
    finally:
        conn.close()

def update_new_releases():
    print(LOG_PREFIX + 'Getting new releases...')
    STEAM_API_FEATURED = "http://store.steampowered.com/api/featuredcategories"

    while True:
        try:
            response = requests.get(STEAM_API_FEATURED).json()
            break
        except json.decoder.JSONDecodeError:
            print(LOG_PREFIX + 'Error while getting new releases, retrying in 3 seconds...')
            time.sleep(3)
    
    new_releases = response.get('new_releases', {}).get('items', [])
    print(LOG_PREFIX + 'Fetched {} new released games'.format(len(new_releases)))

    for app in new_releases:
        update_db_with_new_released_app(app)    


def run_apps_updater(redis, client, sentry_sdk):
    while True:
        pipe = redis.pipeline()

        pipe.get('current_change')
        pipe.lrange('apps-queue', 0, REDIS_BATCH_SIZE - 1)
        pipe.llen('apps-queue')

        pipe_response = pipe.execute()

        changenumber = pipe_response[0]
        apps = [app for app in pipe_response[1]]
        app_to_packages = list_of_jsons_to_json(apps)
        app_ids = app_to_packages.keys()
        apps_queue_size = pipe_response[2]

        print(LOG_PREFIX + 'Fetched {} apps from queue... ({} apps yet in queue)'.format(len(app_ids), apps_queue_size))
        
        if not app_ids:
            time.sleep(5)
            continue

        print(app_ids)

        while True:
            try:
                # run new-releases updater every n minutes
                schedule.run_pending()
                
                while True:
                    data = client.get_product_info(apps=app_ids)
                    if data is not None:
                        break
                    else:
                        print(LOG_PREFIX + 'Data is None, retrying in 3 seconds...')
                        time.sleep(3)
                        client = connect_to_steam()

                for app in data.get('apps', {}).values():
                    if is_valid_app(app):
                        handle_app(app, app_to_packages)
                
                break
            except UnicodeDecodeError as e:
                sentry_sdk.capture_exception(e)
                break
            except AttributeError as e:
                print(LOG_PREFIX + 'Didn\'t get any apps, retrying in 5 seconds...')
                sentry_sdk.capture_exception(e)
                time.sleep(5)
        
        redis.ltrim('apps-queue', REDIS_BATCH_SIZE, -1)
        print(LOG_PREFIX + 'Batch completed, retry in 3 seconds...')
        time.sleep(3)

if __name__ == "__main__":
    print(LOG_PREFIX + 'Starting in 15 seconds...')
    time.sleep(15)
    print(LOG_PREFIX + 'Starting...')

    sentry_sdk.init(
        SENTRY_URL,
        server_name = 'apps-updater'
    )
    
    try:
        schedule.every(10).minutes.do(update_new_releases)

        r = redis.StrictRedis(
            host='redis',
            port=6379,
            db=0,
            charset="utf-8",
            decode_responses=True)

        client = connect_to_steam()

        run_apps_updater(r, client, sentry_sdk)

    except Exception as e:
        sentry_sdk.capture_exception(e)
