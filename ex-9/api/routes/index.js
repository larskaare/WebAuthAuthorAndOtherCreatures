var express = require('express');
var router = express.Router();

/* GET root page. */
router.get('/', function(req, res, next) {

  console.log(req.headers);

  var respObj = {"Now": Date.now()};
  
  res.status(200).send(respObj);
});

module.exports = router;
