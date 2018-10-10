#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

import os
import time
import datetime
import pymysql.cursors

MYSQL_HOST = "mariadb"
MYSQL_DATABASE = os.environ['MYSQL_DATABASE']
MYSQL_USER = os.environ['MYSQL_USER']
MYSQL_PASSWORD = os.environ['MYSQL_PASSWORD']

# print("DB preparations will start in 10 seconds...")
# time.sleep(10)

print("DB preparations started")

conn = pymysql.connect(
    host=MYSQL_HOST,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    db=MYSQL_DATABASE,
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
            PRIMARY KEY (appid), \
            FULLTEXT (name))"
        
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

        cursor.execute(apps_table)
        cursor.execute(packages_table)
        cursor.execute(new_releases_table)
    conn.commit()
    print("DB preparation done successfully")
finally:
    conn.close()
