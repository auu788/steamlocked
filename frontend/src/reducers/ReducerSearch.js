import { FETCH_SEARCH_RESULTS } from '../actions/index';

export default (state = {}, action) => {
    switch(action.type) {
        case FETCH_SEARCH_RESULTS:
            return action.payload.data;

        default:
            return state;
    }
}