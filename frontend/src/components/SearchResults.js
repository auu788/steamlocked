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

    if (!_.isEmpty(props.results.game)) {
        gamesCount = (Object.keys(props.results.game).length === 1) ? '1 Game' : `${Object.keys(props.results.game).length} Games`;        
    }
    
    if (!_.isEmpty(props.results.dlc)) {
        dlcsCount = (Object.keys(props.results.dlc).length === 1) ? '1 DLC' : `${Object.keys(props.results.dlc).length} DLCs`;        
    }

    return (
        <div id="search-results-wrapper">
            {!_.isEmpty(props.results.game) &&
            <AppResults results={props.results.game} categoryName={gamesCount} />}

            {!_.isEmpty(props.results.dlc) &&
            <AppResults results={props.results.dlc} categoryName={dlcsCount} />}
        </div>
    );
}

export default SearchResults;