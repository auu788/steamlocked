import React, { Component } from 'react';
import axios from 'axios';

import AppResults from './AppResults';
import './NewReleases.css';

class NewReleases extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null
        }
    }

    componentDidMount() {
        const url = 'http://api.znamiec.me/api/newReleases';

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
                {this.state.data &&
                    <AppResults results={this.state.data} categoryName={"New Releases"} />}
            </div>
        )
    }
}

export default NewReleases;