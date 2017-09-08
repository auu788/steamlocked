import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './Navbar.css';

class Navbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchQuery: ''
        };

        this.onInputChange = this.onInputChange.bind(this);
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
        
        this.props.searchQuery(event.target.value);
    }

    render() {
        return (
            <div id="navbar">
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
                <Link to="/list" id="list-button">Region locked games list</Link>
            </div>
        );
    }
}

export default Navbar;