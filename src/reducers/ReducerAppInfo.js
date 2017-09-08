import { FETCH_APP_INFO } from '../actions/index';

export default (state = {}, action) => {
    switch(action.type) {
        case FETCH_APP_INFO:
            return action.payload.data;
        
        default:
            return state;
    }
}