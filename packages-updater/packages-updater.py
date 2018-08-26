#!/usr/bin/python
import gevent.monkey
gevent.monkey.patch_all()

import redis
import time

r = redis.StrictRedis(host='redis', port=6379, db=0, charset="utf-8", decode_responses=True)

while True:
    print ('{}: {}'.format(r.llen('packages-queue'), r.blpop('packages-queue')[1]))
    time.sleep(5)