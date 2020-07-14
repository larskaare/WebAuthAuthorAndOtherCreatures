var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Getting a access token (EX-2)' });
});

module.exports = router;
