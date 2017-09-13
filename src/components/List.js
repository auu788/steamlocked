import React, { Component } from 'react';
import Select from 'react-select';

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

    shouldComponentUpdate(nextProps) {
        if (JSON.stringify(nextProps.gamesList) === JSON.stringify(this.props.gamesList)) {
            return false;
        }

        return true;
    }

    onFilterInputChange(filterQuery) {
        this.props.filterQuery(filterQuery.target.value);
        this.setState({
            inputValue: filterQuery.target.value
        })
    }

    onCountryChange(selectedCountry) {
        this.props.country(selectedCountry.value);
        this.setState({
            shopCountryCode: selectedCountry.value
        });
    }

    render() {
        console.log(this.props.gamesList);
        
        return (
            <div id="list-wrapper">
                <div id="list-control">
                    <input value={this.state.inputValue} onChange={this.onFilterInputChange} />
                    <Select
                        options={this.state.selectorCountriesList}
                        value={this.state.shopCountryCode}
                        clearable={false}
                        onChange={this.onCountryChange}
                    />
                </div>

                <div id="list-results">
                    <ListPagination data={this.props.gamesList} pageSize={15} />
                </div>
            </div>
        );
    }
}

export default List;