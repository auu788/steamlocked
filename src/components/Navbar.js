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
        
        this.props.searchQuery(event.target.value);
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
                <Link to="/list" id="list-button">Region locked games list</Link>
            </div>
        );
    }
}

export default Navbar;