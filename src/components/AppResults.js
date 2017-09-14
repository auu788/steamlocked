import React from 'react';
import ReactImageFallback from 'react-image-fallback';
import { Link } from 'react-router-dom';

import './AppResults.css';

const AppResults = (props) => {
    return (
        <div>
            <div className="category-name" >{props.categoryName}</div>
            <div className="apps-content" >
                {props.results.map((app) => {
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

export default AppResults;