var createError = require('http-errors');
var express = require('express');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var path = require('path');
var cookieParser = require('cookie-parser');
var randomstring = require('randomstring');
var logHelper = require('./logHelper');
var config = require('../config/config.js');

var log = logHelper.createLogger();


log.info('Logger started, NODE_ENV=' + process.env.NODE_ENV);

// set up database for express session
// var MongoStore = require('connect-mongo')(expressSession);
// var mongoose = require('mongoose');

var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

//
// Functions to serialize and deserialize users for session mgmt
//

passport.serializeUser(function(user, done) {
    done(null, user.oid);
});
  
passport.deserializeUser(function(oid, done) {
    findByOid(oid, function (err, user) {
        done(err, user);
    });
});
  
// array to hold logged in users
var users = [];
  
var findByOid = function(oid, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        log.info('we are using user: ' + user.oid);
        if (user.oid === oid) {
            return fn(null, user);
        }
    }
    return fn(null, null);
};

//-----------------------------------------------------------------------------
// Use the OIDCStrategy within Passport.
// 
// Strategies in passport require a `verify` function, which accepts credentials
// (in this case, the `oid` claim in id_token), and invoke a callback to find
// the corresponding user object.
// 
// The following are the accepted prototypes for the `verify` function
// (1) function(iss, sub, done)
// (2) function(iss, sub, profile, done)
// (3) function(iss, sub, profile, access_token, refresh_token, done)
// (4) function(iss, sub, profile, access_token, refresh_token, params, done)
// (5) function(iss, sub, profile, jwtClaims, access_token, refresh_token, params, done)
// (6) prototype (1)-(5) with an additional `req` parameter as the first parameter
//
// To do prototype (6), passReqToCallback must be set to true in the config.
//-----------------------------------------------------------------------------
passport.use(new OIDCStrategy({
    identityMetadata: config.creds.identityMetadata,
    clientID: config.creds.clientID,
    responseType: config.creds.responseType,
    responseMode: config.creds.responseMode,
    redirectUrl: config.creds.redirectUrl,
    allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
    clientSecret: config.creds.clientSecret,
    validateIssuer: config.creds.validateIssuer,
    isB2C: config.creds.isB2C,
    issuer: config.creds.issuer,
    passReqToCallback: config.creds.passReqToCallback,
    scope: config.creds.scope,
    loggingLevel: config.creds.loggingLevel,
    nonceLifetime: config.creds.nonceLifetime,
    nonceMaxAmount: config.creds.nonceMaxAmount,
    useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
    cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
    clockSkew: config.creds.clockSkew,
},
function(iss, sub, profile, accessToken, refreshToken, done) {
    
    //Storing access token in profile, the user object in req
    profile.accessToken = accessToken;
    
    if (!profile.oid) {
        return done(new Error('No oid found'), null);
    }
    // asynchronous verification, for effect...
    process.nextTick(function () {
        findByOid(profile.oid, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                // "Auto-registration"
                users.push(profile);
                return done(null, profile);
            }
            return done(null, user);
        });
    });
}
));

var indexRouter = require('../routes/index');
var mailRouter = require('../routes/mail');
var userInfoRouter = require('../routes/userinformation');

var app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(methodOverride());
app.use(cookieParser());

// Define logging for middleware
app.use(require('express-bunyan-logger')(logHelper.expressLoggerConfig()));


// set up session middleware
// if (config.useMongoDBSessionStore) {
//     mongoose.connect(config.databaseUri);
//     app.use(express.session({
//         secret: 'secret',
//         cookie: {maxAge: config.mongoDBSessionMaxAge * 1000},
//         store: new MongoStore({
//             mongooseConnection: mongoose.connection,
//             clear_interval: config.mongoDBSessionMaxAge
//         })
//     }));
// } else {
app.use(expressSession({ secret: 'you will never guess it', resave: true, saveUninitialized: false }));
// }

app.use(bodyParser.urlencoded({ extended : true }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../public'));


//-----------------------------------------------------------------------------
// Set up the route controller
//
// 1. For 'login' route and 'returnURL' route, use `passport.authenticate`. 
// This way the passport middleware can redirect the user to login page, receive
// id_token etc from returnURL.
//
// 2. For the routes you want to check if user is already logged in, use 
// `ensureAuthenticated`. It checks if there is an user stored in session, if not
// it will call `passport.authenticate` to ask for user to log in.
//-----------------------------------------------------------------------------
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

app.use('/', indexRouter);
app.use('/mail', mailRouter);
app.use('/userinfo', userInfoRouter);

app.get('/', function(req, res) {
    res.render('index', { user: req.user });
});

app.get('/login',
    function(req, res, next) {
        passport.authenticate('azuread-openidconnect', 
            { 
                response: res,                          // required
                resourceURL: config.resourceURL,        // optional. Provide a value if you want to specify the resource.
                customState: randomstring.generate(),   // optional. Provide a value if you want to provide custom state value.
                failureRedirect: '/' 
            }
        )(req, res, next);
    }
    //,
    // function(req, res) {
    //     log.info('Login requested');
    //     res.redirect('/');
    // }
);

// 'GET returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
app.get('/auth/openid/return',
    function(req, res, next) {
        passport.authenticate('azuread-openidconnect', 
            { 
                response: res,                      // required
                failureRedirect: '/'  
            }
        )(req, res, next);
    },
    function(req, res) {
        log.info('Get request from Azure AD to our returnURL');
        res.redirect('/');
    });


// 'POST returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// body (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
app.post('/auth/openid/return',
    function(req, res, next) {
        passport.authenticate('azuread-openidconnect', 
            { 
                response: res,                      // required
                failureRedirect: '/'  
            }
        )(req, res, next);
    },
    function(req, res) {
        log.info('Post request from Azure AD to our returnURL');
        res.redirect('/');
    });

// 'logout' route, logout from passport, and destroy the session with AAD.
app.get('/logout', function(req, res){
    req.session.destroy(function() {
        log.info('Logout requested');
        req.logOut();
        res.redirect(config.destroySessionUrl);
    });
});

//Error logging for middleware
app.use(require('express-bunyan-logger').errorLogger(logHelper.expressLoggerConfig()));


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

module.exports = app;
