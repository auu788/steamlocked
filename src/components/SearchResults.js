import React from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import ReactImageFallback from "react-image-fallback";

import './SearchResults.css';

const NoMatch = () => {
    return (
        <div id="no-results">No results</div>
    );
}

const AppResults = (props) => {
    return (
        <div>
            <div className="category-name" >{props.categoryName}</div>
            <div className="apps-content" >
                {props.searchResults.map((app) => {
                    return (<Link to={`/app/${app.appid}`} className="block" key={app.appid}>
                                <ReactImageFallback
                                    src={`https://steamcdn-a.akamaihd.net/steam/apps/${app.appid}/header_292x136.jpg`}
                                    fallbackImage={require('../images/error.jpg')}
                                    initialImage={require('../images/spinner.svg')}
                                    alt={app.name} />
                                <span>{app.name}</span>
                            </Link>);
                })}
            </div>
        </div>
    )
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
            <AppResults searchResults={props.results.Game} categoryName={gamesCount} />}

            {!_.isEmpty(props.results.DLC) &&
            <AppResults searchResults={props.results.DLC} categoryName={dlcsCount} />}
        </div>
    );
}

export default SearchResults;