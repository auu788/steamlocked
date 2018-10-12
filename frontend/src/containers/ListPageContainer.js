import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Helmet } from 'react-helmet';

import { fetchList } from '../actions/index';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import List from '../components/List';

class ListPageContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            country: 'BR',
            filterQuery: ''
        };

        this.onFilterInputChange = this.onFilterInputChange.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);
    }
    
    componentDidMount() {
        this.props.fetchList(this.state.country);
    }

    onCountryChange(country) {
        this.props.fetchList(country);

        this.setState({
            country
        });
    }

    onFilterInputChange(inputValue) {
        this.setState({
            filterQuery: inputValue
        });
    }

    prepareGamesList() {
        return (_.filter(this.props.listResults.payload, (elem) => {
            if (elem.name.toLowerCase().includes(this.state.filterQuery.toLowerCase())) {
                return elem;
            }
        }));
    }

    render() {
        return (
            <div id="wrapper">
                <Helmet>
                    <title>List of region locked games · Steam Locked</title>
                    <meta name="description" content="Check out list of region locked games by country." />
                    <meta property="og:title" content="List of region locked games · Steam Locked" />
                    <meta property="og:description" content="Check out list of region locked games by country." />
                    <meta property="og:type" content="website" />
                    <meta property="og:site_name" content="Steam Locked" />
                    <meta property="og:image" content={require('../images/logo.png')} />
                    <meta name="twitter:card" content="summary_large_image" />
                </Helmet>
                <Navbar />
                <List filterQuery={this.onFilterInputChange} country={this.onCountryChange} gamesList={this.prepareGamesList()}/>
                <Footer />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchList: (country) => {
            dispatch(fetchList(country));
        }
    }
}

const mapStateToProps = (state) => {
    return ({
        listResults: state.listResults
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(ListPageContainer);