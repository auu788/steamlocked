import axios from 'axios';

export const FETCH_SEARCH_RESULTS =     'fetch_search_results';
export const FETCH_APP_INFO =           'fetch_app_info';
export const FETCH_APP_INFO_SUCCESS =   'fetch_app_info_success';
export const FETCH_APP_INFO_FAILURE =   'fetch_app_info_failure';
export const FETCH_LIST =               'fetch_list';

export function fetchSearchResults(searchQuery) {
    const request = axios.get(`https://api.steamlocked.com/search/${searchQuery}`);

    return {
        type: FETCH_SEARCH_RESULTS,
        payload: request
    };
}

export function fetchAppInfo(appid) {
    const request = axios.get(`https://api.steamlocked.com/appid/${appid}`)

    return {
        type: FETCH_APP_INFO,
        payload: request
    }
}

export function fetchAppInfoSuccess(response) {
    return {
        type: FETCH_APP_INFO_SUCCESS,
        payload: response
    }
}

export function fetchAppInfoFailure(response) {
    return {
        type: FETCH_APP_INFO_FAILURE,
        payload: response
    }
}

export function fetchList(country) {
    const request = axios.get(`https://api.steamlocked.com/list?billingtype=3,10&country=${country}`);

    return {
        type: FETCH_LIST,
        payload: request
    }
}