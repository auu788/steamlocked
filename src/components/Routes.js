import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Home from './Home';
import SearchPageContainer from '../containers/SearchPageContainer';
import AppPageContainer from '../containers/AppPageContainer';

const Routes = () => {
    return (
    <BrowserRouter>
        <Switch>
            <Route exact path='/' component={Home} />
            <Route path='/search/:appid' component={SearchPageContainer} />
            <Route path='/app/:appid' component={AppPageContainer} />
        </Switch>
    </BrowserRouter>
    );
}

export default Routes;