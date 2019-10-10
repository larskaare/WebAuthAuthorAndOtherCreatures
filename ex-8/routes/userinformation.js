var express = require('express');
var router = express.Router();
var authUtil = require('../src/authutils');
var moment = require('moment');

/* GET home page. */
router.get('/', authUtil.ensureAuthenticated, function(req, res) {

    // Preparing username and expire date/time for access token
    const tokenExpireDate = moment(req.user.authInfo.access_token_exp * 1000).format('MMMM Do YYYY, h:mm:ss a');
    res.render('userinfo', { title: 'My Authentication, Authorization and MS Graph demo app', user: req.user, tokenExpDate: tokenExpireDate });
});

module.exports = router;
