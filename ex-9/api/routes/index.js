var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

/* GET root page. */
router.get('/', function(req, res, next) {
  var tokenArray;

  if (req.headers.authorization) {
    tokenArray = req.headers.authorization.split(" ");
  }

  var decoded = jwt.decode(tokenArray[1],{complete: true});
  
  if (!decoded) {
    console.log('No JWT token in request');
  };

  //We have a token - let's start to validate


  var respObj = {
    "Now": Date.now(),
    "Header": decoded.header,
    "Payload": decoded.payload
};
  
  res.status(200).send(respObj);
});

module.exports = router;
