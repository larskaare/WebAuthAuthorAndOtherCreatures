/**
 * A module for various authentication logics that potentially will be used a lot all over
 */

var config = require('../config/config.js');
var rp = require('request-promise');
var jwtDecode = require('jwt-decode');
var logHelper = require('./logHelper');

var log = logHelper.createLogger();

exports.ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
};

//The logics to determine if a refresh of the access token should be done.
exports.considerRefresh = async function (req, res, next) {

    if (Object.prototype.hasOwnProperty.call(req,'user')) {
        if (Object.prototype.hasOwnProperty.call(req.user,'authInfo')) {
            if (Object.prototype.hasOwnProperty.call(req.user.authInfo, 'access_token_exp')) {
                
                const currExp = req.user.authInfo.access_token_exp;
                const currDate = new Date();
                const currTime = Math.round(currDate.getTime() / 1000);

                //Differene in seconds between expire time and now before we refresh token
                const diffSecondsBeforeRefresh = config.diffSecondsBeforeRefresh;

                if ((currExp - currTime) <= diffSecondsBeforeRefresh) {
                    log.info('Attemting to refresh access token (limit: ' + diffSecondsBeforeRefresh +  ', refresh at or after: ' + (currExp - currTime) + ')');
                    const metaData = await getMetaData();
                    const newAccessToken = await getNewAccessToken(metaData,req.user.authInfo.refresh_token);
                    const newExpireDate = returnExpFromAccessToken(newAccessToken);
                    
                    // eslint-disable-next-line require-atomic-updates
                    req.user.authInfo.access_token = newAccessToken;
                    // eslint-disable-next-line require-atomic-updates
                    req.user.authInfo.access_token_exp = newExpireDate;

                } else {
                    // console.log('***** I Will NOT ******** >>',(currExp - currTime));
                    // Not refreshing yet
                }
    
                next();
            } else next();
        } else next();
    } else next();
   
};

//Function to get metadata from Azure
async function getMetaData () {

    var options = {
        uri: config.creds.identityMetadata,
        json: true
    };
  
    const result = await rp(options);

    return result;

}

async function getNewAccessToken(metadata,refresh_token) {

    var options = {
        method: 'POST',
        uri: metadata.token_endpoint,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'client_id' : config.creds.clientID,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
            'client_secret': config.creds.clientSecret
        }
    };
  
    const responseBody = await rp(options);
    const response = JSON.parse(responseBody);

    return response.access_token;
    
}

function returnExpFromAccessToken(access_token) {

    var decoded = jwtDecode(access_token);

    return decoded.exp;

}