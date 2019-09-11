var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'My Authentication, Authorization and MS Graph demo app (EX-1)' });
});

module.exports = router;
