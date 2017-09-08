import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';

import registerServiceWorker from './registerServiceWorker';
import reducers from './reducers/index';
import Routes from './components/Routes';

const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

render(
    <Provider store={createStoreWithMiddleware(reducers)}>
        <Routes />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();