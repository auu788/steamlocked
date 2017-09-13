import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './ListPagination.css';

class ListPagination extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: undefined,
            currentPage: 1,
            pageSize: 20,
            lastPage: undefined
        }

        this.changePage = this.changePage.bind(this);
    }

    componentWillReceiveProps(nextProps) {
         
        let pageSize = nextProps.pageSize || this.state.pageSize;
        let groupedData = {};
        let tempArray = [];
        for (var i = 1, j = 1; i <= nextProps.data.length; i++) {
            if (i % pageSize === 0) {
                tempArray.push(nextProps.data[i-1]);
                groupedData[j] = tempArray;
                tempArray = [];
                j++;

            } else if (i === nextProps.data.length) {
                tempArray.push(nextProps.data[i-1]);
                groupedData[j] = tempArray;   

            } else {
                tempArray.push(nextProps.data[i-1]);
            }
        }

        let lastPage = (nextProps.data.length % pageSize === 0) ? (nextProps.data.length / pageSize) : parseInt((nextProps.data.length / pageSize) + 1, 10)

        console.log("PO", groupedData);
        this.setState({
            currentPage: 1,
            data: groupedData,
            pageSize: pageSize,
            lastPage: lastPage
        });
    }

    changePage(nextPage) {
        this.setState({
            currentPage: nextPage
        });
    }

    render() {
        console.log(this.state.data);
        if (this.state.data && !(1 in this.state.data)) {
            return (
                <div id="paginated-list">
                    <span id="no-results">No results</span>
                </div>);
        }

        return (
            <div id="paginated-list">
                <ul id="list-data">
                    {this.state.data &&
                        this.state.data[this.state.currentPage].map((elem) => {
                            return (
                                <Link to={`/app/${elem.appid}`}>
                                    <li key={elem.appid}>
                                        <img alt={elem.name} src={`https://steamcdn-a.akamaihd.net/steam/apps/${elem.appid}/capsule_sm_120.jpg`} />
                                        <span>{elem.name}</span>
                                    </li>
                                </Link>
                            );
                        })
                    }
                </ul>
                <div id="nav-controls">
                    <button className={"nav-button first-button " + (this.state.currentPage === 1 ? 'hidden-button' : '')} onClick={() => this.changePage(1)}>First</button>
                    <button className={"nav-button prev-button " + (this.state.currentPage === 1 ? 'hidden-button' : '')} onClick={() => this.changePage(this.state.currentPage - 1)}>Prev</button>
                    <span className={"current-page " + (this.state.lastPage === 1 ? 'hidden-button' : '')}>{this.state.currentPage} of {this.state.lastPage}</span>
                    <button className={"nav-button next-button " + (this.state.currentPage === this.state.lastPage ? 'hidden-button' : '')} onClick={() => this.changePage(this.state.currentPage + 1)}>Next</button>
                    <button className={"nav-button last-button " + (this.state.currentPage === this.state.lastPage ? 'hidden-button' : '')} onClick={() => this.changePage(this.state.lastPage)}>Last</button>
                </div>
            </div>
        );
    }   
}

export default ListPagination;