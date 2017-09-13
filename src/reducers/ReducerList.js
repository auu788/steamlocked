import { FETCH_LIST } from '../actions/index';

export default (state = {}, action) => {
    switch(action.type) {
        case FETCH_LIST:
            return action.payload.data;

        default:
            return state;
    }
}