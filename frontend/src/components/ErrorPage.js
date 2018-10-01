import React from 'react';
import { Link } from 'react-router-dom';

import Navbar from './Navbar';
import Footer from './Footer';
import './ErrorPage.css';

const ErrorPage = () => {
    return (
        <div id="wrapper">
            <Navbar />
                <div id="error-page-wrapper">
                    <span id="fzf">404</span><br />
                    <span>Back to <Link to='/'>Home</Link></span>
                </div>
            <Footer />
        </div>
    );
}

export default ErrorPage;