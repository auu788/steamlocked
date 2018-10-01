import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Helmet } from 'react-helmet';

import { fetchAppInfo, fetchAppInfoSuccess, fetchAppInfoFailure } from '../actions/index';
import Navbar from '../components/Navbar';
import AppPage from '../components/AppPage';
import ErrorPage from '../components/ErrorPage';

class AppPageContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appid: this.props.match.params.appid
        }
    }

    componentDidMount() {
        this.props.fetchAppInfo(this.state.appid);
    }

    componentDidUpdate() {
        const { appid } = this.props.match.params;
        if (this.state.appid !== appid) {
            this.setState({
                appid: this.props.match.params.appid
            });

            this.props.fetchAppInfo(appid);
        }
    }

    render() {
        if (_.isEmpty(this.props.appInfo)) {
            console.log("TU");
            return (
                <div id="wrapper">
                </div>
            )
        } else if (!this.props.appInfo.success) {
            console.log("ERROR");
            return (
                <ErrorPage />
            );
        }

        return (
            <div id="wrapper">
                <Helmet>
                    <title>{this.props.appInfo.payload[0].name} · AppID: {this.state.appid} · Steam Locked</title>
                    <meta name="description" content={`Find out if ${this.props.appInfo.payload[0].name} [AppID: ${this.state.appid}] has any region locks or restrictions.`} />
                    <meta property="og:title" content={`${this.props.appInfo.payload[0].name} · AppID: ${this.state.appid} · Steam Locked`} />
                    <meta property="og:description" content={`Find out if ${this.props.appInfo.payload[0].name} [AppID: ${this.state.appid}] has any region locks or restrictions.`} />
                    <meta property="og:type" content="website" />
                    <meta property="og:site_name" content="Steam Locked" />
                    <meta property="og:image" content={`http://cdn.akamai.steamstatic.com/steam/apps/${this.state.appid}/header.jpg`} />
                    <meta name="twitter:card" content="summary_large_image" />
                </Helmet>
                <Navbar />
                <AppPage data={ this.props.appInfo.payload }/>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchAppInfo: (appid) => {
            dispatch(fetchAppInfo(appid))
                .then((response) => {
                    if (response.error) {
                        dispatch(fetchAppInfoFailure({"success": false}));
                    } else {
                        dispatch(fetchAppInfoSuccess(response.payload));
                    }
                });
        }
    }
};

const mapStateToProps = (state) => {
    return ({
        appInfo: state.appInfo
    })
};

export default connect(mapStateToProps, mapDispatchToProps)(AppPageContainer);