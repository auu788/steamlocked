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
    sub_id = package.get('packageid')
    billingtype = package.get('billingtype')
    allowcrossregiontradingandgifting = str2bool(package.get('extended', {}).get('allowcrossregiontradingandgifting'))
    allowpurchasefromrestrictedcountries = str2bool(package.get('extended', {}).get('allowpurchasefromrestrictedcountries'))
    purchaserestrictedcountries = package.get('extended', {}).get('purchaserestrictedcountries')
    onlyallowrunincountries = package.get('extended', {}).get('onlyallowrunincountries')

    for appid in package.get('appids', {}).values():
        print('Appid: {}'.format(appid))
        r.rpush('apps-queue', appid)

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