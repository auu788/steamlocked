import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Helmet } from 'react-helmet';

import { fetchAppInfo } from '../actions/index';
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
        if (!this.props.appInfo || _.isEmpty(this.props.appInfo)) {
            return (
                <ErrorPage />
            );
        }

        return (
            <div id="wrapper">
                <Helmet>
                    <title>{this.props.appInfo.payload[0].name} · AppID: {this.state.appid} · Steam Locked</title>
                    <meta name="description" content={`Find out if ${this.props.appInfo.payload[0].name} [AppID: ${this.state.appid}] has any region locks or restrictions.`} />
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
            dispatch(fetchAppInfo(appid));
        }
    }
};

const mapStateToProps = (state) => {
    return ({
        appInfo: state.appInfo
    })
};

export default connect(mapStateToProps, mapDispatchToProps)(AppPageContainer);