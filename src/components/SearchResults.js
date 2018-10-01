import React from 'react';
import _ from 'lodash';

import AppResults from './AppResults';
import './SearchResults.css';

const NoMatch = () => {
    return (
        <div id="search-results-wrapper">
            <div id="no-results">No results</div>
        </div>
    );
}

const SearchResults = (props) => {
    if (_.isEmpty(props.results)) {
        return (<NoMatch />);
    }

    let gamesCount, dlcsCount;

    if (!_.isEmpty(props.results.Game)) {
        gamesCount = (Object.keys(props.results.Game).length === 1) ? '1 Game' : `${Object.keys(props.results.Game).length} Games`;        
    }
    
    if (!_.isEmpty(props.results.DLC)) {
        dlcsCount = (Object.keys(props.results.DLC).length === 1) ? '1 DLC' : `${Object.keys(props.results.DLC).length} DLCs`;        
    }

    return (
        <div id="search-results-wrapper">
            {!_.isEmpty(props.results.Game) &&
            <AppResults results={props.results.Game} categoryName={gamesCount} />}

            {!_.isEmpty(props.results.DLC) &&
            <AppResults results={props.results.DLC} categoryName={dlcsCount} />}
        </div>
    );
}

export default SearchResults;