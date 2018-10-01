import { FETCH_APP_INFO, FETCH_APP_INFO_SUCCESS, FETCH_APP_INFO_FAILURE } from '../actions/index';

export default (state = {}, action) => {
    switch(action.type) {
        case FETCH_APP_INFO:
            return state;
        
        case FETCH_APP_INFO_SUCCESS:
            return action.payload.data;
        
        case FETCH_APP_INFO_FAILURE:
            return action.payload;

        default:
            return state;
    }
}