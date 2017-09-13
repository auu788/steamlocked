import React, { Component } from 'react';
import axios from 'axios';

import './NewReleases.css';

class NewReleases extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null
        }
    }

    componentDidMount() {
        const url = 'http://localhost:3030/api/newReleases';

        axios.get(url)
        .then((response) => {
            this.setState({
                data: response.data.payload
            })
        });
    }
    // SELECT COUNT(DISTINCT apps.appid) AS Count, apps.publisher FROM apps JOIN packages ON apps.appid = packages.appid WHERE packages.PurchaseRestrictedCountries IS NOT NULL AND (packages.billingtype = 10 OR packages.billingtype = 3) AND apps.type = 'Game' AND apps.publisher IS NOT NULL GROUP BY apps.publisher ORDER BY Count DESC;    render() {
    render() {
        return (
            <div id="new-releases-wrapper">
                <h1>New Releases</h1>
                <table id="new-releases-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>CD-Key Region Locked</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.data && this.state.data.map((elem) => {
                            return (
                                <tr key={elem.appid}>
                                    <td className="img-row"><a href={`/app/${elem.appid}`}><img alt={elem.name} src={`https://steamcdn-a.akamaihd.net/steam/apps/${elem.appid}/header_292x136.jpg`} /></a></td>
                                    <td className="name-row"><a href={`/app/${elem.appid}`}>{`${elem.name}`}</a></td>
                                    <td className="lock-row">TAK</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default NewReleases;