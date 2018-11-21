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
import traceback
import sentry_sdk
import pymysql.cursors
from datetime import datetime
from steam import SteamClient
from steam.enums import EResult

class Consts:
    LOG_PREFIX = "[apps-updater]"
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
        try:
            item = json.loads(item)
        except json.decoder.JSONDecodeError:
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
            print('{} [{}] Error while getting release date, retrying in 3 seconds...'.format(Consts.LOG_PREFIX, str(appid)))
            time.sleep(3)
        except requests.exceptions.ConnectionError:
            print('{} [{}] Error while getting release date, retrying in 5 seconds...'.format(Consts.LOG_PREFIX, str(appid)))
            time.sleep(5)

    if response.get(str(appid), {}).get('success'):
        return response.get(str(appid), {}).get('data', {}).get('release_date', {}).get('date')
    
    return None

def handle_db_connection():
    conn = pymysql.connect(
        host=Consts.MYSQL_HOST,
        user=Consts.MYSQL_USER,
        password=Consts.MYSQL_PASSWORD,
        db=Consts.MYSQL_DATABASE,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor)
                            
    return conn

def update_db_with_app(app):
    print('{} App: {}'.format(Consts.LOG_PREFIX, str(app['app_id'])))

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
    print('{} Existing app: {}'.format(Consts.LOG_PREFIX, str(app['app_id'])))

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
    print('{} Package: {} - {}'.format(Consts.LOG_PREFIX, app_id, str(package['package_id'])))
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
            print('{} Error while logging, retrying in 10 seconds...'.format(Consts.LOG_PREFIX))
            time.sleep(10)
    
    return client

def is_valid_app(app):
    releasestate = app.get('common', {}).get('releasestate', '').lower()
    apptype = app.get('common', {}).get('type', '').lower()

    if (apptype != 'game' and apptype != 'dlc') or releasestate == 'prerelease':
        print('{} [{}] releasestate: {}, apptype: {}'.format(Consts.LOG_PREFIX, app.get('appid'), releasestate, apptype))
        return False
    
    return True

def str2bool(v):
    if v:
        return v in ('1', 'true', 'True', 1)
    
    return False

def clear_new_released_db():
    conn = handle_db_connection()

    try:
        with conn.cursor() as cursor:
            sql = "DELETE * FROM `new_releases`"
        
        conn.commit()
    finally:
        conn.close()

def update_db_with_new_released_app(app):
    print('{} [{}] New released app: {}'.format(Consts.LOG_PREFIX, str(app['id']), app['name']))

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
    print('{} Getting new releases...'.format(Consts.LOG_PREFIX))
    STEAM_API_FEATURED = "http://store.steampowered.com/api/featuredcategories"

    while True:
        try:
            response = requests.get(STEAM_API_FEATURED).json()
            break
        except json.decoder.JSONDecodeError:
            print('{} Error while getting new releases, retrying in 3 seconds...'.format(Consts.LOG_PREFIX))
            time.sleep(3)
    
    new_releases = response.get('new_releases', {}).get('items', [])
    print('{} Fetched {} new released games'.format(Consts.LOG_PREFIX, len(new_releases)))

    if len(new_releases) > 0:
        clear_new_released_db()

    for app in new_releases:
        update_db_with_new_released_app(app)    


def run_apps_updater(redis, client, sentry_sdk):
    while True:
        pipe = redis.pipeline()

        pipe.get('current_change')
        pipe.lrange('apps-queue', 0, Consts.REDIS_BATCH_SIZE - 1)
        pipe.llen('apps-queue')

        pipe_response = pipe.execute()

        changenumber = pipe_response[0]
        app_to_packages = list_of_jsons_to_json(pipe_response[1])
        app_ids = app_to_packages.keys()
        apps_queue_size = pipe_response[2]

        print('{} Fetched {} apps from queue... ({} apps yet in queue)'.format(Consts.LOG_PREFIX, len(app_ids), apps_queue_size))
        
        if not app_ids:
            time.sleep(5)
            continue

        while True:
            try:
                # run new-releases updater every n minutes
                schedule.run_pending()
                
                while True:
                    data = client.get_product_info(apps=app_ids)
                    if data is not None:
                        break
                    else:
                        print('{} Data is None, retrying in 3 seconds...'.format(Consts.LOG_PREFIX))
                        time.sleep(3)
                        client = connect_to_steam()

                for app in data.get('apps', {}).values():
                    if is_valid_app(app):
                        handle_app(app, app_to_packages)
                
                break
            except AttributeError as e:
                print('{} Didn\'t get any apps, retrying in 5 seconds...'.format(Consts.LOG_PREFIX))
                sentry_sdk.capture_exception(e)
                time.sleep(5)
        
        redis.ltrim('apps-queue', Consts.REDIS_BATCH_SIZE, -1)
        print('{} Batch completed, retrying in 3 seconds...'.format(Consts.LOG_PREFIX))
        time.sleep(3)

if __name__ == "__main__":
    print('{} Starting in 15 seconds...'.format(Consts.LOG_PREFIX))
    time.sleep(15)
    print('{} Starting...'.format(Consts.LOG_PREFIX))

    sentry_sdk.init(
        Consts.SENTRY_URL,
        server_name = 'apps-updater',
        shutdown_timeout = 5
    )
    
    try:
        schedule.every(10).minutes.do(update_new_releases)

        r = redis.Redis(
            host='redis',
            port=6379,
            db=0,
            charset="utf-8",
            decode_responses=True)

        client = connect_to_steam()

        run_apps_updater(r, client, sentry_sdk)

    except Exception as e:
        traceback.print_exc()
        sentry_sdk.capture_exception(e)
