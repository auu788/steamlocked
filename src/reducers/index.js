import { combineReducers } from 'redux';
import SearchReducer from './ReducerSearch';
import AppInfoReducer from './ReducerAppInfo';

const rootReducer = combineReducers({
    searchResults: SearchReducer,
    appInfo: AppInfoReducer
});

export default rootReducer;