var createError = require('http-errors');
var express = require('express');
var expressSession = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var requestLogger = require('morgan');
var randomstring = require('randomstring');
var url = require('url');
var __ = require('underscore');
var qs = require('qs');
var request = require('then-request');
var querystring = require('querystring');
var moment = require('moment');
var logHelper = require('./logHelper');

var logger = logHelper.createAppLogger();
logger.warn('Logger started, NODE_ENV=' + process.env.NODE_ENV);

var indexRouter = require('../routes/index');
var mailRouter = require('../routes/mail');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// Define logging for middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(requestLogger('dev'));
} else {
    app.use(requestLogger('common'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({ secret: 'keyboard doggie', resave: true, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/mail', mailRouter);


/*
    Adding config for authentication
*/

var authServer = {
    authorizationEndpoint: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/oauth2/v2.0/token'
};

var client = {
    'client_id': 'cab2507d-e7d1-46fd-9580-ea7de0cd02ea',
    'client_secret': process.env.CLIENT_SECRET,
    'redirect_uris': ['http://localhost:3000/callback']
};

var state = null;
var scope = null;
var access_token = null;

app.get('/authorize', function(req, res) {

    state = randomstring.generate();
    scope = 'openid profile email Mail.Read  User.Read';

    var authorizeUrl = buildUrl(authServer.authorizationEndpoint, {
        response_type: 'code',
        client_id: client.client_id,
        redirect_uri: client.redirect_uris[0],
        state: state,
        scope: scope
    });

    logger.debug('Redirect to ' + authorizeUrl);
    res.redirect(authorizeUrl);

});

app.get('/callback', function(req, res){

    if (req.query.error) {
        res.render('error', {error: req.query.error});
        return;
    }

    if (req.query.state != state) {
        logger.error('State DOES NOT MATCH: expected ' + state + ' got ' + req.query.state);
        res.render('error', {error: 'State value did not match'});
        return;
    }

    var code = req.query.code;
    logger.debug('Got authorization code ' + code);


    //We have an auth code, let's exchange that for an access token
    //Constructing the request for access token

    var form_data = qs.stringify({
        grant_type: 'authorization_code',
        code: code,
        scope: scope,
        redirect_uri: client.redirect_uris[0]
    });

    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + encodeClientCredentials(client.client_id, client.client_secret)
    };

    request('POST', authServer.tokenEndpoint, {
        body: form_data,
        headers: headers
    }).done((tokenRes => {

        if (tokenRes.statusCode >= 200 && tokenRes.statusCode < 300) {
            var body = JSON.parse(tokenRes.getBody());

            access_token = body.access_token;
            logger.debug('We go access token '+ access_token);

            //extracting some information from the token
            //selecting payload part of token and decode base64
            const payloadStr = Buffer.from(access_token.split('.')[1], 'base64');   
            const payLoad = JSON.parse(payloadStr);

            var tokenInfo = {};
            //Multiply ith 1000 since JS uses milliseconds since Epoch - Unix seconds
            tokenInfo.exp = moment(payLoad.exp * 1000).format('MMMM Do YYYY, h:mm:ss a'); 
            tokenInfo.given_name = payLoad.given_name;
            tokenInfo.family_name = payLoad.family_name;
            tokenInfo.scp = payLoad.scp;

            logger.info(payLoad.exp);

            //Storing access token in session 
            req.session.access_token = access_token;           
            
            res.render('index', { title: 'Authenticated and access', code: code.substr(1,10), tokenInfo: tokenInfo });

        } else {

            logger.debug('We did not get access token ' + tokenRes.statusCode + tokenRes.body);
            res.render('index', { title: 'Authenticated and NO access?' });

        }
    }));

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');

});

// Utility function to build a proper request url
var buildUrl = function(base, options, hash) {
    var newUrl = url.parse(base, true);
    delete newUrl.search;
    if (!newUrl.query) {
        newUrl.query = {};
    }
    __.each(options, function(value, key) {
        newUrl.query[key] = value;
    });
    if (hash) {
        newUrl.hash = hash;
    }

    return url.format(newUrl);
};

//Utility function to encode client credentials to base64
var encodeClientCredentials = function(clientId, clientSecret) {
    return new Buffer.from(querystring.escape(clientId) + ':' + querystring.escape(clientSecret)).toString('base64');
};

module.exports = app;
