import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchSearchResults } from '../actions/index';
import Navbar from '../components/Navbar';
import SearchResults from '../components/SearchResults';

class SearchPageContainer extends Component {
    constructor(props) {
        super(props);

        if (this.props.match.params.appid.length < 3) {
            this.props.history.push('/');
        }

        this.state = {
            searchQuery: this.props.match.params.appid,
            searchResults: {}
        };

        this.onInputChange = this.onInputChange.bind(this);
    }

    componentDidMount() {
        this.props.fetchSearchResults(this.state.searchQuery);
        //this.getSearchResults(this.state.searchQuery);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.searchResults || nextProps.searchResults === this.props.searchResults) {
            return false;            
        }
        return true;
    }

    // TODO
    // componentDidUpdate() {
    //     if (Object.keys(this.props.searchResults.payload).length > 0) {
    //         if (Object.keys(this.props.searchResults.payload.Game).length === 1 &&
    //             !this.props.searchResults.payload.DLC) {
    //                 this.props.history.push(`/appid/${this.props.searchResults.payload.Game[0].appid}`);
    //         }
    //     }
    // }

    onInputChange(searchQuery) {
        const { history } = this.props;

        if (searchQuery.length < 3) {
            history.push('/');
        } 
        else {
            this.setState({
                searchQuery
            });

            this.props.fetchSearchResults(searchQuery);
            history.push(`/search/${searchQuery}`);
        }
    }

    // getSearchResults(searchQuery) {
    //     const request = axios.get(`http://localhost:3030/api/search/${searchQuery}`)
    //         .then((response) => {
    //             return response.data.payload;
    //         })
    //         .catch(() => {
    //             return {};
    //         });

    //     this.setState({
    //         searchResults: request
    //     });
    // }

    render() {
        const debounceOnInputChange = _.debounce(this.onInputChange, 500);
        
        return (
            <div id="wrapper">
                { this.state.searchQuery.length > 0 &&
                <Navbar
                    inputValue={ this.state.searchQuery } 
                    searchQuery={ debounceOnInputChange }
                /> }
                <SearchResults results={ this.props.searchResults.payload } />
            </div>
        );
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchSearchResults: (searchQuery) => {
            dispatch(fetchSearchResults(searchQuery));
        }
    }
};

const mapStateToProps = (state) => {
    return ({
        searchResults: state.searchResults
    });
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPageContainer);