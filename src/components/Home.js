import React, { Component } from 'react';
import Navbar from './Navbar';
import { Helmet } from 'react-helmet';

import NewReleases from './NewReleases';
import Footer from './Footer';
import './Home.css';

class Home extends Component {
    render() {
        return (
            <div id="wrapper">
                <Helmet>
                    <title>Steam Locked · Home</title>
                    <meta name="description" content="Find out if the Steam game you want to buy has any region locks or restrictions." />
                </Helmet>
                <Navbar />
                <NewReleases />
                <Footer />
            </div>
        );
    }
}

export default Home;
