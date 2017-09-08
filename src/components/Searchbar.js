import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchSearchResults } from '../actions/index';

import '../utils/font-awesome/css/font-awesome.min.css'; 

class Searchbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focus: false,
            value: ''
        };

        this.onFocus = this.onFocus.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        if (this.props.searchValue !== null && this.props.searchValue !== undefined) {
            console.log("Weszlo");
            this.setState({
                value: this.props.searchValue
            })
        }
    }

    onChange(event) {
        this.setState({value: event.target.value});
        this.props.onUserInput(event.target.value);
    }

    onFocus() {
        this.setState({
            focus: !this.state.focus
        });
    }

    render() {
        console.log("aSDFDF", this.props);
        let focusColor;

        let style = {
            width: this.props.width
        };

        if (this.state.focus) {
            focusColor = 'black';
        } else {
            focusColor = 'grey';
        }

        return (
            <div id="search-box" style={style}>
                <label id="search-label" style={{color: focusColor}}>
                    <input autoFocus type="text" value={this.state.value} onBlur={this.onFocus} onFocus={this.onFocus} onChange={this.onChange} id="search-input" />
                </label>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchSearchResults: (searchQuery) => {
            dispatch(fetchSearchResults(searchQuery))
        }
    }
}

export default connect(null, mapDispatchToProps)(Searchbar);