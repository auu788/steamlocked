import express, { Router } from 'express';
import {
    getNewReleases,
    getSearchResults,
    getAppidInfo,
    getList
} from './endpoints';

const router = Router();

router.route('/api/newReleases')
    .get(getNewReleases);

router.route('/api/search/:searchQuery')
    .get(getSearchResults);

router.route('/api/appid/:appid(\\d+)')
    .get(getAppidInfo);

router.route('/api/list')
    .get(getList);

export default router;