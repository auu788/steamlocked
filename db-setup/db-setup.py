#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

import time
import pymysql.cursors

print("DB preparations will start in 10 seconds...")
time.sleep(10)
print("DB preparations started")
conn = pymysql.connect(
    host='mariadb',
    user='test-user',
    password='userPWD',
    db='test-db',
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor)

try:
    with conn.cursor() as cursor:
        database_collation = "ALTER DATABASE `test-db` \
            CHARACTER SET `utf8mb4` \
            COLLATE `utf8mb4_unicode_ci`"

        cursor.execute(database_collation)
        
        apps_table = "CREATE TABLE IF NOT EXISTS `apps` ( \
            appid INTEGER NOT NULL, \
            name VARCHAR(1024) NOT NULL, \
            type VARCHAR(255) NOT NULL, \
            developer VARCHAR(255), \
            publisher VARCHAR(255), \
            release_date VARCHAR(255), \
            dlcforappid INTEGER, \
            isfreeapp INTEGER, \
            section_type VARCHAR(255), \
            releasestate VARCHAR(255), \
            updated_at DATETIME, \
            PRIMARY KEY (appid))"
        
        packages_table = "CREATE TABLE IF NOT EXISTS `packages` ( \
            appid INTEGER NOT NULL, \
            subid INTEGER NOT NULL, \
            billingtype INTEGER NOT NULL, \
            AllowPurchaseFromRestrictedCountries INTEGER, \
            PurchaseRestrictedCountries VARCHAR(2048), \
            AllowCrossRegionTradingAndGifting VARCHAR(255), \
            onlyallowrunincountries VARCHAR(2048), \
            updated_at DATETIME, \
            PRIMARY KEY (appid, subid))"

        new_releases_table = "CREATE TABLE IF NOT EXISTS `new_releases` ( \
            appid INTEGER NOT NULL, \
            name VARCHAR(255), \
            PRIMARY KEY (appid))"

        changenumber_table = "CREATE TABLE IF NOT EXISTS `changenumber` ( \
            current_change_number INTEGER NOT NULL, \
            update_time VARCHAR(255))"

        cursor.execute(apps_table)
        cursor.execute(packages_table)
        cursor.execute(new_releases_table)
        cursor.execute(changenumber_table)
    conn.commit()
    print("DB preparation done successfully")
finally:
    conn.close()
