#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

import os
import time
import json
import redis
import schedule
import traceback
import sentry_sdk
from steam import SteamClient
from steam.enums import EResult

class Consts:
    LOG_PREFIX = "[queue-updater]"

    MYSQL_HOST = "mariadb"
    MYSQL_DATABASE = os.environ['MYSQL_DATABASE']
    MYSQL_USER = os.environ['MYSQL_USER']
    MYSQL_PASSWORD = os.environ['MYSQL_PASSWORD']

    SENTRY_KEY = os.environ['SENTRY_KEY']
    SENTRY_PROJECT = os.environ['SENTRY_PROJECT']
    SENTRY_URL = "https://{}@sentry.io/{}".format(SENTRY_KEY, SENTRY_PROJECT)

    CHANGENUMBER_INIT = os.environ.get('CHANGENUMBER_INIT')

    PACKAGES_MANUAL_START = os.environ.get('PACKAGES_MANUAL_START')
    PACKAGES_MANUAL_END = os.environ.get('PACKAGES_MANUAL_END')

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

def update_queue():
    print('{} Checking queue...'.format(Consts.LOG_PREFIX))

    r = redis.Redis(host='redis', port=6379, db=0, charset="utf-8", decode_responses=True)
    
    changenumber_to_fetch = None

    if r.get('current_change_number'):
        changenumber_to_fetch = int(r.get('current_change_number'))
    else:
        if Consts.CHANGENUMBER_INIT:
            changenumber_to_fetch = int(Consts.CHANGENUMBER_INIT)
        else:
            raise("No changenumber...") 

    while True:
        client = connect_to_steam()
        res = client.get_changes_since(changenumber_to_fetch, True, True)
        if res is not None:
            break
        else:
            print('{} Changes response is None, retrying in 3 seconds...'.format(Consts.LOG_PREFIX))
            time.sleep(3)

    print('{} [{}] Fetched {} package changes and {} app changes...'.format(Consts.LOG_PREFIX, res.current_change_number, len(res.package_changes), len(res.app_changes)))

    redis_pipe = r.pipeline()
    for package_change in res.package_changes:
        redis_pipe.rpush('packages-queue', package_change.packageid)
        print('{} PACKAGE {} - {}'.format(Consts.LOG_PREFIX, package_change.packageid, package_change.change_number))

    for app_change in res.app_changes:
        app_json = {
            "app_id": app_change.appid,
            "package": {}
        }
        redis_pipe.rpush('apps-queue', json.dumps(app_json))
        print('{} APP {} - {}'.format(Consts.LOG_PREFIX, app_change.appid, app_change.change_number))

    redis_pipe.set('current_change_number', res.current_change_number)
    redis_pipe.execute()

    client.logout()

def update_queue_manually():
    r = redis.Redis(host='redis', port=6379, db=0, charset="utf-8", decode_responses=True)

    range_start = int(Consts.PACKAGES_MANUAL_START) if Consts.PACKAGES_MANUAL_START else 0

    redis_pipe = r.pipeline()
    for package_num in range(range_start, int(Consts.PACKAGES_MANUAL_END)):
        redis_pipe.rpush('packages-queue', package_num)
    redis_pipe.execute()

    print('{} Updated queue with numbers from {} to {}...'.format(Consts.LOG_PREFIX, range_start, Consts.PACKAGES_MANUAL_END))

if __name__ == "__main__":
    print('{} Starting in 15 seconds...'.format(Consts.LOG_PREFIX))
    time.sleep(15)
    print('{} Starting...'.format(Consts.LOG_PREFIX))

    sentry_sdk.init(
        Consts.SENTRY_URL,
        server_name = 'queue-updater',
        shutdown_timeout = 5
    )

    try:
        if Consts.PACKAGES_MANUAL_END:
            update_queue_manually()

        schedule.every(30).seconds.do(update_queue)

        while 1:
            schedule.run_pending()
            time.sleep(1)

    except Exception as e:
        traceback.print_exc()
        sentry_sdk.capture_exception(e)