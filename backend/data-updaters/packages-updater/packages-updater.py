#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

import os
import time
import redis
import traceback
import sentry_sdk
from steam import SteamClient
from steam.enums import EResult

LOG_PREFIX = "[packages-updater] "

SENTRY_KEY = os.environ['SENTRY_KEY']
SENTRY_PROJECT = os.environ['SENTRY_PROJECT']
SENTRY_URL = "https://{}@sentry.io/{}".format(SENTRY_KEY, SENTRY_PROJECT)
REDIS_BATCH_SIZE = 100

# List of packages ids, which throws an error by internal libraries
PACKAGES_BLACK_LIST = [82985]

def handle_package(package, redis):
    print(LOG_PREFIX + 'Package: {}'.format(package.get('packageid')))
    package_id = package.get('packageid')
    billing_type = package.get('billingtype')
    allow_cross_region_trading_and_gifting = str2bool(package.get('extended', {}).get('allowcrossregiontradingandgifting'))
    allow_purchase_from_restricted_countries = str2bool(package.get('extended', {}).get('allowpurchasefromrestrictedcountries'))
    purchase_restricted_countries = package.get('extended', {}).get('purchaserestrictedcountries')
    only_allow_run_in_countries = package.get('extended', {}).get('onlyallowrunincountries')
    
    package_json = {
        "package_id": package_id,
        "billing_type": billing_type,
        "allow_cross_region_trading_and_gifting": allow_cross_region_trading_and_gifting,
        "allow_purchase_from_restricted_countries": allow_purchase_from_restricted_countries,
        "purchase_restricted_countries": purchase_restricted_countries,
        "only_allow_run_in_countries": only_allow_run_in_countries,
    }

    for app_id in package.get('appids', {}).values():
        app = {
            "app_id": app_id,
            "package": package_json
        }

        redis.rpush('apps-queue', app)

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

def is_valid_package(package):
    billingtype = package.get('billingtype')
    devcomp = package.get('extended', {}).get('devcomp')

    if (billingtype != 1 and billingtype != 3 and billingtype != 10) or devcomp == 1:
        return False
    
    return True

def str2bool(v):
    if v:
        return v in ("1", "true", "True", 1)
    
    return False

def run_packages_updater(redis):
    while True:
        pipe = redis.pipeline()

        pipe.get('current_change')
        pipe.lrange('packages-queue', 0, REDIS_BATCH_SIZE - 1)
        pipe.llen('packages-queue')

        pipe_response = pipe.execute()
        changenumber = pipe_response[0]
        package_ids = [int(num) for num in pipe_response[1] if int(num) not in PACKAGES_BLACK_LIST]
        packages_queue_size = pipe_response[2]

        print(LOG_PREFIX + 'Fetched {} packages from queue... ({} packages yet in queue)'.format(len(package_ids), packages_queue_size))

        print(package_ids)
        if not package_ids:
            time.sleep(5)
            continue

        while True:
            client = connect_to_steam()
            try:
                data = client.get_product_info(packages=package_ids)

                for package in data.get('packages', {}).values():
                    if is_valid_package(package):
                        handle_package(package, redis)
                
                break
            except AttributeError:
                print(LOG_PREFIX + 'Didn\'t get any products, retrying in 5 seconds...')
                time.sleep(5)
        
        redis.ltrim('packages-queue', REDIS_BATCH_SIZE, -1)
        print(LOG_PREFIX + 'Batch completed, retry in 10 seconds...')
        time.sleep(10)

if __name__ == "__main__":
    print(LOG_PREFIX + 'Starting in 15 seconds...')
    time.sleep(15)
    print(LOG_PREFIX + 'Starting...')

    sentry_sdk.init(
        SENTRY_URL,
        server_name = 'packages-updater',
        shutdown_timeout = 5
    )

    try:
        r = redis.StrictRedis(
            host='redis',
            port=6379,
            db=0,
            charset="utf-8",
            decode_responses=True)
    
        run_packages_updater(r)

    except Exception as e:
        traceback.print_exc()
        sentry_sdk.capture_exception(e)
