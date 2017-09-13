import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

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
        console.log(country);
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
        return  (_.filter(this.props.listResults.payload, (elem) => {
            if (elem.name.toLowerCase().includes(this.state.filterQuery.toLowerCase())) {
                return elem;
            }
        }));
    }

    render() {
        return (
            <div id="wrapper">
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