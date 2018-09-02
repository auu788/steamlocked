#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

from steam import SteamClient
from steam.enums import EResult
import redis
import schedule
import time

def updateQueue():
    print ('Checking...')
    client = SteamClient()

    result = client.anonymous_login()

    if result != EResult.OK:
        print("Failed to login: %s" % repr(result))
        raise SystemExit

    r = redis.StrictRedis(host='redis', port=6379, db=0, charset="utf-8", decode_responses=True)

    res = None

    if r.get('current_change') != None:
        res = client.get_changes_since(int(r.get('current_change')), True, True)
    else:
        res = client.get_changes_since(5027651, True, True)

    redis_pipe = r.pipeline()
    for package_change in res.package_changes:
        redis_pipe.rpush('packages-queue', package_change.packageid)
        print ('PACKAGE {} - {}'.format(package_change.packageid, package_change.change_number))

    for app_change in res.app_changes:
        redis_pipe.rpush('apps-queue', app_change.appid)
        print ('APP {} - {}'.format(app_change.appid, app_change.change_number))

    redis_pipe.set('current_change', res.current_change_number)
    redis_pipe.execute()

    client.logout()

schedule.every().minute.do(updateQueue)

while 1:
    schedule.run_pending()
    time.sleep(1)
