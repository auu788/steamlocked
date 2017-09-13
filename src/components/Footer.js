import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer id="footer">
            <div id="footer-content">
                <span>Made by <a href="https://pawel.znamiec.me">Paweł Znamiec</a></span>
                <span>Last update: 00:00</span>
            </div>
            <span id="disclaimer">All data is powered by Steam. Not affiliated with Valve, Steam, or any of their partners. All copyrights reserved to their respective owners.</span>
        </footer>
    );
}

export default Footer;