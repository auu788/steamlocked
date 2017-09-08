import axios from 'axios';

export const FETCH_SEARCH_RESULTS = 'fetch_search_results';
export const FETCH_APP_INFO =       'fetch_app_info';

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