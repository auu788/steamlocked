import express, { Router } from 'express';
import {
    getNewReleases,
    getSearchResults,
    getAppidInfo,
    getList,
    getTimeUpdate
} from './endpoints';

const router = Router();

router.route('/timeUpdate')
    .get(getTimeUpdate);

router.route('/newReleases')
    .get(getNewReleases);

router.route('/search/:searchQuery')
    .get(getSearchResults);

router.route('/appid/:appid(\\d+)')
    .get(getAppidInfo);

router.route('/list')
    .get(getList);

export default router;