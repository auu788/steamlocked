import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Home from './Home';
import SearchPageContainer from '../containers/SearchPageContainer';
import AppPageContainer from '../containers/AppPageContainer';
import ListPageContainer from '../containers/ListPageContainer';
import ErrorPage from './ErrorPage';
import withTracker from './Analytics';

const Routes = () => {
    return (
    <BrowserRouter>
        <Switch>
            <Route exact path='/' component={withTracker(Home)} />
            <Route path='/list' component={withTracker(ListPageContainer)} />
            <Route path='/search/:appid' component={withTracker(SearchPageContainer)} />
            <Route path='/app/:appid' component={withTracker(AppPageContainer)} />
            <Route component={ErrorPage}/>
        </Switch>
    </BrowserRouter>
    );
}

export default Routes;