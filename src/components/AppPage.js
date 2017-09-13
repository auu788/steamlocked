import React, { Component } from 'react';
import ReactImageFallback from 'react-image-fallback';
import { Link } from 'react-router-dom';

import RegionLockInfo from './RegionLockInfo';
import RawData from './RawData';
import Footer from './Footer';
import './AppPage.css';

class Note extends Component {
    constructor(props) {
        super(props);

        this.state = {
            "expanded": false
        }

        this.onClick = this.onClick.bind(this);
    }

    componentWillMount() {
        if (!localStorage.getItem("expanded")) {
            localStorage.setItem("expanded", true);

        } else {
            this.setState({
                "expanded": JSON.parse(localStorage.getItem("expanded"))
            });
        }
    }

    onClick() {
        this.setState({
            "expanded": !this.state.expanded
        });

        localStorage.setItem("expanded", !this.state.expanded);
    }

    render() {
        if (this.state.expanded) {
            console.log("WŁACZONY");
        } else {
            console.log("WYŁACZONY");
        }

        return (
            <div id="general-info-wrapper">
                <div id="info-header">
                    <span>Note</span>
                    <button className="expand" onClick={this.onClick}>
                        {this.state.expanded && '−'}
                        {!this.state.expanded && '+'}
                    </button>
                </div>
                {this.state.expanded &&
                <div id="content">
                    <p>On May 2017, Steam introduced new gifting system. Two biggest changes are:</p>
                    <ul>
                        <li>Gifts can't be stored in inventory anymore, but have to be sent to receiver instantly (or with automatic delay).</li>
                        <li>Gifts can't be sent from country with cheaper prices to country with more expensive prices (around 10% difference in price).</li>
                    </ul>
                    <p>These changes affect every purchase since May 2017.</p>
                    <p>More info: <a href='https://steamcommunity.com/games/593110/announcements/detail/1301948399254001159'>Steam Blog Post</a></p>
                    <br/>
                    <p>Right now Steam and publishers thave their own region restriction systems:</p> 
                    <ul>
                        <li>Steam - every Steam Store gift purchase is restricted by rule: can't gift from cheaper country to more expensive one; CD-Key's are unaffected.</li>
                        <li>Publishers - can region lock Steam Store gifts and CD-Keys, although right now publisher's region locks on Steam Store are overwrited by Steam's region lock system.</li>
                    </ul>
                    <p>Steam Store region locks are not listed below, but you can find them in 'Raw Data' section.</p>
                </div>
                }
            </div>
        );
    }
}

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
                            <td><a href={`https://steamdb.info/app/${app.appid}`}>SteamDB</a> | <a href={`https://store.steampowered/appid/${app.appid}`}>Steam Store</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const AppPage = (props) => {
    const app = props.data[0];
    console.log("AAFASDFASDF", app);

    return (
        <div id="app-info-wrapper">
            <AppInfo data={app} />
            <Note />
            <RegionLockInfo packages={app.packages} />
            <RawData packages={app.packages} />
            <Footer />
        </div>
    );
}

export default AppPage;