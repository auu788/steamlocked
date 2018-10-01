import db from './db';
import { escape } from 'mysql';
import _ from 'lodash';

export const getTimeUpdate = async (req, res, next) => {
    console.log(`[REQUEST] ${req.url}`);
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    let sqlQuery = 'SELECT update_time FROM changenumber';
	
    db.query(sqlQuery, (err, results) => {
        res.status(200).json({
            "success": true,
            "payload": results
        });
    });
}

export const getNewReleases = async (req, res, next) => {
    console.log(`[REQUEST] ${req.url}`);
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    let sqlQuery = "SELECT * \
                    FROM new_releases \
                    WHERE appid IN \
                        (SELECT appid \
                        FROM apps \
                        WHERE type='Game' AND \
                            isfreeapp IS NULL AND \
                            (releasestate<>'prerelease' or releasestate IS NULL))";
    
    db.query(sqlQuery, (err, results) => {
        res.status(200).json({
            "success": true,
            "payload": results
        });
    });
}

export const getSearchResults = async (req, res, next) => {
    console.log(`[REQUEST] ${req.url}`);
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    let searchQuery = req.params["searchQuery"];

    // Preparing query for SQL's boolean mode search
    let preparedQuery = '+*' + searchQuery + '*';
    preparedQuery = preparedQuery.replace(' ', '* +*');

    let sqlQuery = "SELECT appid, name, type \
                    FROM apps \
                    WHERE (releasestate <> 'prerelease' OR releasestate IS NULL) AND \
                        (appid = ? OR name LIKE ? OR MATCH(name) AGAINST (? IN BOOLEAN MODE)) \
                    ORDER BY MATCH(name) AGAINST (? IN BOOLEAN MODE) DESC LIMIT 150";

    db.query(sqlQuery, [searchQuery, '%'+searchQuery+'%', preparedQuery, preparedQuery], (err, results) => {
        if (err) throw err;

        // Grouping items by Game and DLC type
        results = _.mapValues(_.groupBy(results, 'type'),
            (tmpList) => tmpList.map(
                (res) => _.omit(res, 'type')
            )
        );

        res.status(200).json({
            "success": true,
            "query": searchQuery,
            "payload": results
        });
    });
}

export const getAppidInfo = async (req, res, next) => {
    console.log(`[REQUEST] ${req.url}`);
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const appid = req.params['appid'];

    let infoQuery = "SELECT DISTINCT appid, name, type, developer, publisher, release_date, dlcforappid, 'base_name' \
                    FROM apps \
                    WHERE (releasestate<>'prerelease' or releasestate IS NULL) AND appid = ?";
    
    let packagesQuery = "SELECT subid, subid_name, billingtype, AllowPurchaseFromRestrictedCountries, PurchaseRestrictedCountries, AllowCrossRegionTradingAndGifting, onlyallowrunincountries \
                        FROM packages \
                        WHERE appid = ?";

    db.query(infoQuery, appid, (err, appResults) => {
        if (err) throw err;
        
        if (appResults.length === 0) {
            res.status(400).json({
                "success": false,
                "appid": appid,
                "info": "No game / dlc with such appid, or game is not released."
            });

            return;
        }

		if (appResults[0].type === 'DLC') {
			const dlcForAppid = appResults[0].dlcforappid;
			
			let baseNameForDlcQuery =	"SELECT name \
										FROM apps \
										WHERE appid = ? AND type = 'Game'";
			
			db.query(baseNameForDlcQuery, dlcForAppid, (err, baseNameResult) => {
				if (err) throw err;
				
				appResults[0]["base_name"] = baseNameResult[0].name;
			});
		}
		else {
			appResults[0]["base_name"] = null;
		}
		
        if (appResults.length === 0) {
            res.status(400).json({
                "success": false,
                "appid": appid,
                "info": "No game / dlc with such appid, or game is not released."
            });
        }
        else {
            db.query(packagesQuery, appid, (err, packagesResults) => {
                if (err) throw err;

                appResults[0]["packages"] = packagesResults;

                res.status(200).json({
                    "success": true,
                    "payload": appResults
                });
            });
        }
    });
}

export const getList = async (req, res, next) => {
    console.log(`[REQUEST] ${req.url}`);
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    let billingtype = req.query.billingtype.split(',').map(Number).filter(Number.isInteger);
    let country = req.query.country;

    if (!req.query.billingtype || !country) {
        res.status(400).json({
            "success": false,
            "info": "There have to be 2 parameters, country and billingtype."
        });
    }
    else if (billingtype.length > 2 || billingtype.length < 1) {
        res.status(400).json({
            "success": false,
            "info": "Billingtype has to be number and there are allowed only two values separated by comma."
        });
    }
    else if (country.length !== 2 || !/^[a-zA-Z]+$/.test(country)) {
        res.status(400).json({
            "success": false,
            "info": "Country has to be 2-letter code."
        });
    }
    else {
        let billingtypeSqlQuery = billingtype.map((elem) => {
            return "billingtype = " + elem;
        }).join(" OR ");
        billingtypeSqlQuery = "AND (" + billingtypeSqlQuery + ")";

        let sqlQuery = "SELECT DISTINCT apps.appid, name \
                        FROM apps \
                        JOIN packages ON apps.appid = packages.appid \
                        WHERE type = 'Game' AND AllowPurchaseFromRestrictedCountries = 1 \
                            AND (releasestate <> 'prerelase' OR releasestate IS NULL) \
                            AND PurchaseRestrictedCountries LIKE ? \
                            " + billingtypeSqlQuery + " \
                        ORDER BY name"
        
        let query = db.query(sqlQuery, '%'+country+'%', (err, results) => {
            if (err) throw err;
            
            res.status(200).json({
                "success": true,
                "country": country,
                "billingtype": billingtype,
                "payload": results
            });
        });
    }
}