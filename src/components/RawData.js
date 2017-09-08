import React from 'react';

import './RawData.css';

const RawData = (props) => {
    return (
        <div id="raw-data-wrapper">
            <span>Raw data</span>
            <div id="raw-data-table">
                {props.packages.map((pack) => {
                    return (
                        <table key={pack.subid} className="raw-data-element">
                            <tbody>
                                <tr>
                                    <th>SubID:</th>
                                    <td>{pack.subid}</td>
                                </tr>
                                <tr>
                                    <th>Package name:</th>
                                    {!pack.subid_name &&
                                    <td>-</td>}
                                    {pack.subid_name && pack.subid_name.length > 0 && 
                                    <td>{pack.subid_name.trim()}</td>}
                                </tr>
                                <tr>
                                    <th>Billingtype:</th>
                                    {pack.billingtype === 1 && <td>Store</td>}
                                    {pack.billingtype === 3 && <td>CD-Key</td>}
                                    {pack.billingtype === 10 && <td>Store & CD-Key</td>}
                                </tr>
                                <tr>
                                    <th>Cross region gifting and trading:</th>
                                    {!pack.AllowCrossOriginTradingAndGifting && <td>Blocked</td>}
                                    {pack.AllowCrossOriginTradingAndGifting && <td>Allowed</td>}
                                </tr>
                                {pack.PurchaseRestrictedCountries && pack.AllowPurchaseFromRestrictedCountries === 1 &&
                                <tr>
                                    <th>Countries allowed to activate:</th>
                                    <td>{pack.PurchaseRestrictedCountries}</td>
                                </tr>}
                                {pack.PurchaseRestrictedCountries && pack.AllowPurchaseFromRestrictedCountries === 0 &&
                                <tr>
                                    <th>Banned countries:</th>
                                    <td>{pack.PurchaseRestrictedCountries}</td>
                                </tr>}
                                {pack.onlyallowrunincountries && 
                                <tr>
                                    <th>Countries allowed to run:</th>
                                    <td>{pack.onlyallowrunincountries}</td>
                                </tr>
                                }
                            </tbody>
                        </table>
                    );
                })}
            </div>
        </div>
    );
}

export default RawData;