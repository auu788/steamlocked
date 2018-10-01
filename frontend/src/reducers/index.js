import { combineReducers } from 'redux';
import SearchReducer from './ReducerSearch';
import AppInfoReducer from './ReducerAppInfo';
import ListReducer from './ReducerList';

const rootReducer = combineReducers({
    searchResults: SearchReducer,
    appInfo: AppInfoReducer,
    listResults: ListReducer
});

export default rootReducer;