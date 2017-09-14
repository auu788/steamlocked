import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';

import './Navbar.css';

const Navbar = withRouter((props) => {
    return (
        <NavbarWithRoute {...props} />
    );
});

class NavbarWithRoute extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchQuery: ''
        };

        this.onInputChange = this.onInputChange.bind(this);
        this.clearInput = this.clearInput.bind(this);
    }

    componentDidMount() {
        if (this.props.inputValue) {
            this.setState({
                searchQuery: this.props.inputValue
            });
        }
    }

    onInputChange(event) {
        this.setState({
            searchQuery: event.target.value
        });
        
        if (this.props.location.pathname.startsWith('/search')) {
            this.props.searchQuery(event.target.value);

        } else {
            if (event.target.value.length > 2) {
                this.props.history.push('/search/' + event.target.value);
            }
        }
    }

    clearInput() {
        this.setState({searchQuery: ''});
        this.props.searchQuery('');
    }

    render() {
        return (
            <div id="navbar">
                <div id="input-group">
                    <input 
                        id="search-input" 
                        value={ this.state.searchQuery } 
                        onChange={ this.onInputChange } 
                        type="text" 
                        autoComplete="off" 
                        autoCorrect="off" 
                        spellCheck="false" 
                        autoFocus>
                    </input>
                    {this.state.searchQuery.length > 0 &&
                        <button id="clear-button" onClick={this.clearInput}>x</button>}
                </div>
                {this.props.location.pathname !== '/' &&
                    <Link to="/" id="home-button" className="button">Home</Link>}
                <Link to="/list" id="list-button" className="button">Region locked games list</Link>
            </div>
        );
    }
}

export default Navbar;