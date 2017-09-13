import React, { Component } from 'react';
import Select from 'react-select';
import _ from 'lodash';
import axios from 'axios';
import Flag from 'react-world-flags';

import './RegionLockInfo.css';
import '../utils/font-awesome/css/font-awesome.min.css'; 
import { COUNTRIES_LIST_ARRAY, COUNTRIES_NAMES_OBJECT } from '../utils/consts';
import 'react-select/dist/react-select.css';

const RegionLockInfoView = (props) => {
    return (
        <div id="region-lock-info-view">
            {props.dat}
            {!props.data.regionLocked &&
            <div id="no-region-lock">This game has no region locks!</div>}
            {/* {props.data.storeLocked &&
            <div className="locked-countries-wrapper">
                { <span>Steam Store</span>
                {props.data.storeLockedCountries.length > 0 &&
                    <div className="locked-countries">
                        <span>There is a risk you won't be able to <span style={{color: "#EFBE74"}}>ACTIVATE</span> your copy from these countries</span>
                        <div className="countries">
                            {props.data.storeLockedCountries.map((country) => {
                                return <span key={country.code}><Flag code={country.code} height="11" />{country.name}</span>;
                            })}
                        </div>
                    </div>}
                {props.data.storeRunLockedCountries.length > 0 &&
                    <div className="locked-countries">
                        <span>There is a risk you won't be able to <span style={{color: "#EFBE74"}}>ACTIVATE</span> and <span style={{color: "#EFBE74"}}>RUN</span> your copy from these countries</span>
                        <div className="countries">
                            {props.data.storeRunLockedCountries.map((country) => {
                                return <span key={country.code}><Flag code={country.code} height="11" />{country.name}</span>;
                            })}
                        </div>
                    </div>}
                {props.data.storeBannedCountries.length > 0 &&
                    <div className="locked-countries">
                        <span>Some versions of the game may be <span style={{color: "#EFBE74"}}>banned</span> in your and these countries</span>
                        <div className="countries">
                            {props.data.storeBannedCountries.map((country) => {
                                return <span key={country.code}><Flag code={country.code} height="11" />{country.name}</span>;
                            })}
                        </div>
                    </div>}
            </div>} } */}
            
            {props.data.keyLocked &&
            <div className="locked-countries-wrapper">
                <span>CD-Keys</span>
                {props.data.keyLockedCountries.length > 0 &&
                    <div className="locked-countries">
                        <span>There is a risk you won't be able to <span style={{color: "#EFBE74"}}>ACTIVATE</span> your copy from these countries</span>
                        <ul className="countries">
                            {props.data.keyLockedCountries.map((country) => {
                                return <li key={country.code}><Flag code={country.code} height="15" className="flag" /><span>{country.name}</span></li>;
                            })}
                        </ul>
                    </div>}
                {props.data.keyRunLockedCountries.length > 0 &&
                    <div className="locked-countries">
                        <span>There is a risk you won't be able to <span style={{color: "#EFBE74"}}>ACTIVATE</span> and <span style={{color: "#EFBE74"}}>RUN</span> your copy from these countries</span>
                        <ul className="countries">
                            {props.data.keyRunLockedCountries.map((country) => {
                                return <li key={country.code}><Flag code={country.code} height="15" className="flag" /><span>{country.name}</span></li>;
                            })}
                        </ul>
                    </div>}
                {props.data.keyBannedCountries.length > 0 &&
                    <div className="locked-countries">
                        <span>Some versions of the game may be <span style={{color: "#EFBE74"}}>banned</span> in your and these countries</span>
                        <ul className="countries">
                            {props.data.keyBannedCountries.map((country) => {
                                return <li key={country.code}><Flag code={country.code} height="15" className="flag" /><span>{country.name}</span></li>;
                            })}
                        </ul>
                    </div>}
            </div>} 
        </div>
    );
}

class RegionLockInfoWrapper extends Component {
    constructor(props) {
        super(props);

        this.state = {
            packages:               this.props.packages,
            selectorCountriesList:  COUNTRIES_LIST_ARRAY,
            userCountryCode:        'DE',

            regionLocked:                       false,
            storeLocked:                        false,
            keyLocked:                          false,
            crossRegionTradingAndGiftingLocked: false,
            storeLockedCountries:               [],
            storeBannedCountries:               [],
            storeRunLockedCountries:            [],
            keyLockedCountries:                 [],
            keyBannedCountries:                 [],
            keyRunLockedCountries:              []
        }

        this.onChange = this.onChange.bind(this);

        // const ipPromise = this.getIPAdress();
        // ipPromise
        //     .then((userCountryCode) => {
        //         this.setState({
        //             userCountryCode
        //         });
        //     })
        //     .catch(() => {
        //         this.setState({
        //             userCountryCode: 'US'
        //         })
        //     });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            packages: nextProps.packages
        });
        this.calculateRegionLocks(this.state.userCountryCode, nextProps.packages);
    }

    componentDidMount() {
        this.calculateRegionLocks(this.state.userCountryCode, this.state.packages);        
    }

    onChange(selectedValue) {
        this.setState({
            userCountryCode: selectedValue.value
        });

        this.calculateRegionLocks(selectedValue.value, this.state.packages);
    }

    calculateRegionLocks(userCountryCode, packages) {
        let crossRegionTradingAndGiftingLocked  = false,
            regionLocked                        = false,
            storeLocked                         = false,
            keyLocked                           = false;

        let storeLockedCountries                = [],
            storeBannedCountries                = [],
            storeRunLockedCountries             = [], 
            keyLockedCountries                  = [],
            keyBannedCountries                  = [],
            keyRunLockedCountries               = [];

        
        _.each(packages, (one) => {
            if (one.AllowCrossRegionTradingAndGifting === "false") {
                crossRegionTradingAndGiftingLocked = true;
            }

            if (one.PurchaseRestrictedCountries) {
                one.PurchaseRestrictedCountries = one.PurchaseRestrictedCountries.replace(/,/g, ' ').trim();

                if (!_.includes(one.PurchaseRestrictedCountries, userCountryCode)
                    && one.AllowPurchaseFromRestrictedCountries === 1) 
                {
                    regionLocked = true;
                    one.PurchaseRestrictedCountries = one.PurchaseRestrictedCountries.replace(/,/g, ' ');

                    if (one.billingtype === 3 || one.billingtype === 10) {
                        keyLockedCountries.push(...one.PurchaseRestrictedCountries.split(' '));    
                        keyLocked = true;                    
                    }

                    if (one.billingtype === 1 || one.billingtype === 10) {
                        storeLockedCountries.push(...one.PurchaseRestrictedCountries.split(' '));
                        storeLocked = true;
                    }
                }

                if (_.includes(one.PurchaseRestrictedCountries, userCountryCode)
                    && one.AllowPurchaseFromRestrictedCountries === 0)
                {
                    regionLocked = true;
                    one.PurchaseRestrictedCountries = one.PurchaseRestrictedCountries.replace(/,/g, ' ');

                    if (one.billingtype === 3 || one.billingtype === 10) {
                        keyBannedCountries.push(...one.PurchaseRestrictedCountries.split(' '));
                        keyLocked = true;                       
                    }

                    if (one.billingtype === 1 || one.billingtype === 10) {
                        storeBannedCountries.push(...one.PurchaseRestrictedCountries.split(' '));
                        storeLocked = true;
                    }
                }
            }

            if (one.onlyallowrunincountries) {

                if (!_.includes(one.onlyallowrunincountries, userCountryCode)) {
                    regionLocked = true;
                    one.onlyallowrunincountries = one.onlyallowrunincountries.replace(/,/g, ' ');                    

                    if (one.billingtype === 3 || one.billingtype === 10) {
                        keyRunLockedCountries.push(...one.onlyallowrunincountries.split(' '));
                        keyLocked = true;                       
                    }

                    if (one.billingtype === 1 || one.billingtype === 10) {
                        storeRunLockedCountries.push(...one.onlyallowrunincountries.split(' '));
                        storeLocked = true;
                    }
                }
            }
        });

        // storeLockedCountries = _.map(storeLockedCountries, (country) => {
        //     return COUNTRIES_NAMES_OBJECT[country];
        // });

        console.log("REGION LOCK LOCKED", storeLocked, keyLocked);
        this.setState({
            regionLocked,
            storeLocked,
            keyLocked,
            crossRegionTradingAndGiftingLocked,
            storeLockedCountries: _.sortBy(_.map(_.uniqBy(storeLockedCountries), (c) => { return {code: c, name: COUNTRIES_NAMES_OBJECT[c]} }), "name"),
            storeBannedCountries: _.sortBy(_.map(_.uniqBy(storeBannedCountries), (c) => { return {code: c, name: COUNTRIES_NAMES_OBJECT[c]} }), "name"),
            storeRunLockedCountries: _.sortBy(_.map(_.uniqBy(storeRunLockedCountries), (c) => { return {code: c, name: COUNTRIES_NAMES_OBJECT[c]} }), "name"),
            keyLockedCountries: _.sortBy(_.map(_.uniqBy(keyLockedCountries), (c) => { return {code: c, name: COUNTRIES_NAMES_OBJECT[c]} }), "name"),
            keyBannedCountries: _.sortBy(_.map(_.uniqBy(keyBannedCountries), (c) => { return {code: c, name: COUNTRIES_NAMES_OBJECT[c]} }), "name"),
            keyRunLockedCountries: _.sortBy(_.map(_.uniqBy(keyRunLockedCountries), (c) => { return {code: c, name: COUNTRIES_NAMES_OBJECT[c]} }), "name")
        });
    }

    async getIPAdress() {
        const request = await axios.get('https://freegeoip.net/json/');

        return request.data.country_code;
    }

    render() {
        console.log("RENDER REGIO NLOCK INFO", this.state);
        
        return (
            <div id="region-lock-info">
                <div id="country-selector">
                    <span>Your country</span>
                    <Select
                        options={this.state.selectorCountriesList}
                        value={this.state.userCountryCode}
                        clearable={false}
                        onChange={this.onChange}
                    />
                </div>
                <RegionLockInfoView data={this.state} />
            </div>
        );
    }
}

export default RegionLockInfoWrapper;