import axios from 'axios';

export const FETCH_SEARCH_RESULTS = 'fetch_search_results';
export const FETCH_APP_INFO =       'fetch_app_info';
export const FETCH_LIST =           'fetch_list';

export function fetchSearchResults(searchQuery) {
    const request = axios.get(`http://localhost:3030/api/search/${searchQuery}`);

    return {
        type: FETCH_SEARCH_RESULTS,
        payload: request
    };
}

export function fetchAppInfo(appid) {
    const request = axios.get(`http://localhost:3030/api/appid/${appid}`);

    return {
        type: FETCH_APP_INFO,
        payload: request
    }
}

export function fetchList(country) {
    const request = axios.get(`http://localhost:3030/api/list?billingtype=3,10&country=${country}`);

    return {
        type: FETCH_LIST,
        payload: request
    }
}