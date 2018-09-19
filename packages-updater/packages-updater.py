#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

import redis
import time
from steam import SteamClient
from steam.enums import EResult

r = redis.StrictRedis(host='redis', port=6379, db=0, charset="utf-8", decode_responses=True)

def handle_package(package):
    print('Package: {}'.format(package))
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
        print('Appid: {}'.format(app_id))
        app = {
            "app_id": app_id,
            "package": package_json
        }

        r.rpush('apps-queue', app)

def connect_to_steam():
    client = SteamClient()

    result = client.anonymous_login()

    if result != EResult.OK:
        print("Failed to login: {}".format(result))
        raise SystemExit
    
    return client

def is_valid_package(package):
    billingtype = package.get('billingtype')
    devcomp = package.get('extended', {}).get('devcomp')

    if (billingtype != 1 and billingtype != 3 and billingtype != 10) or devcomp == 1:
        return False
    
    return True

def update_changenumber(changenumber):
    print('Changenumber: {}'.format(changenumber))

def str2bool(v):
    if v != None:
        return v in ("1", "true", "True", 1)
    
    return False

while False:
    pipe = r.pipeline()

    pipe.get('current_change')
    pipe.lrange('packages-queue', 0, 99)
    pipe.ltrim('packages-queue', 100, -1)

    pipe_response = pipe.execute()
    changenumber = pipe_response[0]
    package_ids = [int(num) for num in pipe_response[1]]

    if not package_ids:
        time.sleep(5)
        continue

    print (package_ids)
    client = connect_to_steam()
    while True:
        try:
            data = client.get_product_info(packages=package_ids)

            for package in data.get('packages', {}).values():
                if is_valid_package(package):
                    handle_package(package)
            
            break
        except AttributeError:
            print ('Didn\'t get any products, retrying in 5 seconds...')
            time.sleep(5)
            pass
        
    update_changenumber(changenumber)
    time.sleep(10)