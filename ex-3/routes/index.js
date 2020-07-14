var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

    res.render('index', { title: 'A&A - Scope (EX-3)' });
});

module.exports = router;
