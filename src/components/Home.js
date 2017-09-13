import React, { Component } from 'react';
import { Redirect  } from 'react-router-dom';
import Navbar from './Navbar';

import NewReleases from './NewReleases';
import Footer from './Footer';
import './Home.css';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchQuery: ''
        };

        this.onInputChange = this.onInputChange.bind(this);
        this.redirect = this.redirect.bind(this);
    }

    onInputChange(searchQuery) {
        this.setState({
            searchQuery
        });
    }

    redirect() {
        if (this.state.searchQuery.length > 2) {
            return (
                <Redirect push from='/' to={`/search/${this.state.searchQuery}`} />
            );
        }
    }

    render() {
        return (
            <div id="wrapper">
                { this.redirect() }
                <Navbar searchQuery={ this.onInputChange } />
                <NewReleases />
                <Footer />
            </div>
        );
    }
}

export default Home;
