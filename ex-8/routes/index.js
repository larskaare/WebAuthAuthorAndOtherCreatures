var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Getting a access token (Code Flow with PKCE) (EX-8)' });
});

module.exports = router;
