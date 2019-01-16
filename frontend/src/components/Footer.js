import React, { Component } from 'react';
import axios from 'axios';
import TimeAgo from 'react-timeago'

import './Footer.css';

class Footer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            time: undefined
        };
    }

    componentDidMount() {
        const url = 'https://api.steamlocked.com/timeUpdate';
        
        axios.get(url)
        .then((response) => {
            this.setState({
                time: response.data.payload[0].updated_at
            });
        });
    }

    render() {
        return (
            <footer id="footer">
                <div id="footer-content">
                    <span>Made by <a href="mailto:pawel@znamiec.me">Paweł Znamiec</a></span>
                    <span>Last update: <TimeAgo date={new Date(this.state.time)} live={false}/></span>
                </div>
                <span id="disclaimer">All data is powered by Steam. Not affiliated with Valve, Steam, or any of their partners. All copyrights reserved to their respective owners.</span>
            </footer>
        );
    }
}

export default Footer;