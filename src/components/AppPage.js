import React from 'react';
import ReactImageFallback from 'react-image-fallback';
import { Link } from 'react-router-dom';

import RegionLockInfo from './RegionLockInfo';
import RawData from './RawData';
import Footer from './Footer';
import Note from './Note';
import './AppPage.css';

const AppInfo = (props) => {
    const app = props.data;

    return (
        <div id="app-info">
            <ReactImageFallback
                src={`https://steamcdn-a.akamaihd.net/steam/apps/${app.appid}/header.jpg`}
                fallbackImage={require('../images/error.jpg')}
                initialImage={require('../images/spinner.svg')}
                alt={app.name} />
            <div id="app-details">
                <span id="title">{ app.name }</span>
                <span id="type">{ app.type }</span>
                <table>
                    <tbody>
                        { app.dlcforappid && 
                        <tr>
                            <td className="prop-title">Base game:</td>
                            <td><Link to={`/app/${ app.dlcforappid }`}>{ app.base_name }</Link></td>
                        </tr> }
                        { app.developer &&
                        <tr>
                            <td className="prop-title">Developer:</td>
                            <td> { app.developer } </td>
                        </tr> }
                        { app.publisher &&
                        <tr>
                            <td className="prop-title">Publisher:</td>
                            <td> { app.publisher } </td>
                        </tr> }
                        { app.release_date &&
                        <tr>
                            <td className="prop-title">Release date:</td>
                            <td> { app.release_date } </td>
                        </tr> }
                        <tr>
                            <td className="prop-title">Links:</td>
                            <td><a href={`https://steamdb.info/app/${app.appid}`}>SteamDB</a> | <a href={`https://store.steampowered.com/appid/${app.appid}`}>Steam Store</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const AppPage = (props) => {
    const app = props.data[0];

    return (
        <div id="app-info-wrapper">
            <AppInfo data={app} />
            <Note type='app' />
            <RegionLockInfo packages={app.packages} />
            <RawData packages={app.packages} />
            <Footer />
        </div>
    );
}

export default AppPage;