#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

import os
import time
import redis
import schedule
import sentry_sdk
from steam import SteamClient
from steam.enums import EResult

MYSQL_HOST = "mariadb"
MYSQL_DATABASE = os.environ['MYSQL_DATABASE']
MYSQL_USER = os.environ['MYSQL_USER']
MYSQL_PASSWORD = os.environ['MYSQL_PASSWORD']

SENTRY_KEY = os.environ['SENTRY_KEY']
SENTRY_PROJECT = os.environ['SENTRY_PROJECT']
SENTRY_URL = "https://{}@sentry.io/{}".format(SENTRY_KEY, SENTRY_PROJECT)

def update_queue():
    print('Checking queue...')
    client = SteamClient()

    result = client.anonymous_login()

    if result != EResult.OK:
        print("Failed to login: %s" % repr(result))
        raise SystemExit

    r = redis.StrictRedis(host='redis', port=6379, db=0, charset="utf-8", decode_responses=True)

    res = None

    if r.get('current_change') != None:
        res = client.get_changes_since(int(r.get('current_change')), False, True)
    else:
        res = client.get_changes_since(5105280, False, True)
    
    print('Fetched {} package changes'.format(len(res.package_changes)))

    redis_pipe = r.pipeline()
    for package_change in res.package_changes:
        redis_pipe.rpush('packages-queue', package_change.packageid)
        print('PACKAGE {} - {}'.format(package_change.packageid, package_change.change_number))

    # for app_change in res.app_changes:
    #     app_json = {
    #         "app_id": app_change.appid,
    #         "package": {}
    #     }
    #     redis_pipe.rpush('apps-queue', app_json)
    #     print('APP {} - {}'.format(app_change.appid, app_change.change_number))

    redis_pipe.set('current_change', res.current_change_number)
    redis_pipe.execute()

    client.logout()

if __name__ == "__main__":
    print('queue-updater will start in 15 seconds...')
    time.sleep(15)
    print('queue-updater is starting...')

    sentry_sdk.init(
        SENTRY_URL,
        server_name = 'queue-updater'
    )

    try:
        schedule.every().minute.do(update_queue)

        while 1:
            schedule.run_pending()
            time.sleep(1)

    except Exception as e:
        sentry_sdk.capture_exception(e)