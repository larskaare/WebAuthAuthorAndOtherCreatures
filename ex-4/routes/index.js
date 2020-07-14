var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'A&A - Using frameworks (EX-4)', user: req.user });
});

module.exports = router;
