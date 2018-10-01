import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactImageFallback from 'react-image-fallback';

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

    componentWillMount() {
        this.calculatePages(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.calculatePages(nextProps);
    }

    calculatePages(propsData) {
        let pageSize = propsData.pageSize || this.state.pageSize;
        let groupedData = {};
        let tempArray = [];
        for (var i = 1, j = 1; i <= propsData.data.length; i++) {
            if (i % pageSize === 0) {
                tempArray.push(propsData.data[i-1]);
                groupedData[j] = tempArray;
                tempArray = [];
                j++;

            } else if (i === propsData.data.length) {
                tempArray.push(propsData.data[i-1]);
                groupedData[j] = tempArray;   

            } else {
                tempArray.push(propsData.data[i-1]);
            }
        }

        let lastPage = (propsData.data.length % pageSize === 0) ? (propsData.data.length / pageSize) : parseInt((propsData.data.length / pageSize) + 1, 10)

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

        const listOffsetY = document.querySelector('#paginated-list').offsetTop;
        window.scrollTo(0, listOffsetY);
    }

    render() {
        let heightStyle = {}

        if (this.state.data && this.state.data[this.state.currentPage].length === this.state.pageSize) {
            heightStyle = {
                minHeight: "780px"
            }
        } else {
            heightStyle = {
                minHeight: "auto"
            }
        }

        return (
            <div id="paginated-list">
                <ul id="list-data" style={heightStyle}>
                    {this.state.data &&
                        this.state.data[this.state.currentPage].map((elem) => {
                            return (
                                <Link key={elem.appid} to={`/app/${elem.appid}`}>
                                    <li>
                                        <ReactImageFallback
                                            src={`https://steamcdn-a.akamaihd.net/steam/apps/${elem.appid}/capsule_sm_120.jpg`}
                                            fallbackImage={require('../images/error-120.jpg')}
                                            initialImage={require('../images/spinner.svg')}
                                            alt={elem.name} />
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