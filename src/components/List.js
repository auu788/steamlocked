import React, { Component } from 'react';
import Select from 'react-select';

import Note from './Note';
import ListPagination from './ListPagination';
import { COUNTRIES_LIST_ARRAY } from '../utils/consts';
import './List.css';

class List extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectorCountriesList: COUNTRIES_LIST_ARRAY,
            shopCountryCode: 'BR',
            inputValue: ''
        }

        this.onFilterInputChange = this.onFilterInputChange.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if ((JSON.stringify(nextProps.gamesList) === JSON.stringify(this.props.gamesList)) &&
            (this.state.inputValue === nextState.inputValue)) {
            return false;
        }

        return true;
    }

    onFilterInputChange(filterQuery) {
        this.setState({
            inputValue: filterQuery.target.value
        });
        this.props.filterQuery(filterQuery.target.value);
    }

    onCountryChange(selectedCountry) {
        this.setState({
            shopCountryCode: selectedCountry.value,
            inputValue: ''
        });

        this.props.filterQuery('');
        this.props.country(selectedCountry.value);
    }

    render() {
        return (
            <div id="list-wrapper">
                <div id="list-control-wrapper">
                    <div id="list-control-filter">
                        <span>Filter games</span>
                        <input value={this.state.inputValue} onChange={this.onFilterInputChange} />
                    </div>
                    <div id="list-control-select">
                        <span>Select country</span>
                        <Select
                            options={this.state.selectorCountriesList}
                            value={this.state.shopCountryCode}
                            clearable={false}
                            onChange={this.onCountryChange}
                        />
                    </div>
                </div>
                
                <Note type='list' />
                {this.props.gamesList.length === 0 &&
                    <div id="list-results">
                        <span id="no-results">No results</span>
                    </div>}
                {this.props.gamesList.length > 0 &&
                    <div id="list-results">
                        <span id="list-header">{this.props.gamesList.length} Region Locked Games</span>
                        <ListPagination data={this.props.gamesList} pageSize={20} />
                    </div>}
            </div>
        );
    }
}

export default List;