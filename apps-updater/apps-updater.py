#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

import redis
import time
import requests
from steam import SteamClient
from steam.enums import EResult

r = redis.StrictRedis(host='redis', port=6379, db=0, charset="utf-8", decode_responses=True)

def get_release_date(appid):
    response = requests.get('https://store.steampowered.com/api/appdetails/?filters=release_date&appids=' + str(appid)).json()
    if response.get(str(appid), {}).get('success') == True:
        return response.get(str(appid), {}).get('data', {}).get('release_date', {}).get('date')
    
    return None

def handle_app(app):
    appid = app.get('appid')
    releasestate = app.get('common', {}).get('releasestate')
    apptype = app.get('common', {}).get('type', '').lower()
    release_date = get_release_date(appid)
    name = app.get('common', {}).get('name')
    developer = app.get('extended', {}).get('developer')
    publisher = app.get('extended', {}).get('publisher')
    isfreeapp = app.get('extended', {}).get('isfreeapp')
    section_type = app.get('common', {}).get('section_type')
    dlcappid = app.get('common', {}).get('parent')

    jsonek = {
        'appid': appid,
        'releasestate': releasestate,
        'apptype': apptype,
        'release_date': release_date,
        'name': name,
        'developer': developer,
        'publisher': publisher,
        'isfreeapp': isfreeapp,
        'section_type': section_type,
        'dlcappid': dlcappid
    }
    
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
    app_ids = [int(num) for num in pipe_response[1]]

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
                    handle_app(app)
            
            break
        except AttributeError:
            print ('Didn\'t get any apps, retrying in 5 seconds...')
            time.sleep(5)
            pass
        
    update_changenumber(changenumber)
    time.sleep(30)