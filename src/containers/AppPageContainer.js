import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchAppInfo } from '../actions/index';
import Navbar from '../components/Navbar';
import AppPage from '../components/AppPage';

class AppPageContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appid: this.props.match.params.appid,
            searchQuery: ''
        }

        this.onInputChange = this.onInputChange.bind(this);
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

    onInputChange(searchQuery) {
        this.setState({
            searchQuery
        });

        if (searchQuery.length > 2) {
            this.props.history.push(`/search/${searchQuery}`);
        }
    }

    render() {
        if (!this.props.appInfo || _.isEmpty(this.props.appInfo)) {
            return null;
        }

        return (
            <div>
                <Navbar
                    inputValue={ this.state.searchQuery } 
                    searchQuery={ this.onInputChange }
                />
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