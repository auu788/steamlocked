import React, { Component } from 'react';

import './Note.css';

class Note extends Component {
    constructor(props) {
        super(props);

        this.state = {
            "expanded": false
        }

        this.onClick = this.onClick.bind(this);
    }

    componentWillMount() {
        if (!localStorage.getItem("expanded")) {
            localStorage.setItem("expanded", true);

        } else {
            this.setState({
                "expanded": JSON.parse(localStorage.getItem("expanded"))
            });
        }
    }

    onClick() {
        this.setState({
            "expanded": !this.state.expanded
        });

        localStorage.setItem("expanded", !this.state.expanded);
    }

    render() {
        return (
            <div id="general-info-wrapper">
                <div id="info-header">
                    <span>Note</span>
                    <button className="expand" onClick={this.onClick}>
                        {this.state.expanded && '−'}
                        {!this.state.expanded && '+'}
                    </button>
                </div>
                {this.state.expanded &&
                <div id="content">
                    <p>On May 2017, Steam introduced new gifting system. Two biggest changes are:</p>
                    <ul>
                        <li>Gifts can't be stored in inventory anymore, but have to be sent to receiver instantly (or with automatic delay).</li>
                        <li>Gifts can't be sent from country with cheaper prices to country with more expensive prices (around 10% difference in price).</li>
                    </ul>
                    <p>These changes affect every purchase since May 2017.</p>
                    <p>More info: <a href='https://steamcommunity.com/games/593110/announcements/detail/1301948399254001159'>Steam Blog Post</a></p>
                    <br/>
                    <p>Right now Steam and publishers thave their own region restriction systems:</p> 
                    <ul>
                        <li>Steam - every Steam Store gift purchase is restricted by rule: can't gift from cheaper country to more expensive one; CD-Key's are unaffected.</li>
                        <li>Publishers - can region lock Steam Store gifts and CD-Keys, although right now publisher's region locks on Steam Store are overwrited by Steam's region lock system.</li>
                    </ul>
                    { this.props.type === 'list' &&
                        <p><b>Below are listed only CD-Key region locks.</b></p>}
                    { this.props.type === 'app' && 
                        <p>Steam Store region locks are not listed below, but you can find them in 'Raw Data' section.</p>}
                </div>
                }
            </div>
        );
    }
}

export default Note;