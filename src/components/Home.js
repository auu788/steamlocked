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
                    <meta property="og:title" content="Steam Locked · Home" />
                    <meta property="og:description" content="Find out if the Steam game you want to buy has any region locks or restrictions." />
                    <meta property="og:type" content="website" />
                    <meta property="og:site_name" content="Steam Locked" />
                    <meta property="og:image" content={require('../images/logo.png')} />
                    <meta name="twitter:card" content="summary_large_image" />
                </Helmet>
                <Navbar />
                <NewReleases />
                <Footer />
            </div>
        );
    }
}

export default Home;
