var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

/* GET root page. */
router.get('/', function(req, res, next) {
  var tokenArray;
  var respObj = {};

  //default value of response
  respObj.Now = Date.now();
 

  if (req.headers.authorization) {
    tokenArray = req.headers.authorization.split(" ");
  }

  var decodedToken = jwt.decode(tokenArray[1],{complete: true});
  var token = tokenArray[1];
  
  if (!token) {
    console.log('No JWT token in request');
    res.status(200).send(JSON.stringify(respObj));
    return;
  };


  // Process to verify token
  // A few functions to get the signing key - input to validation
  //
  var jwksClient = require('jwks-rsa');
  var client = jwksClient({
    jwksUri: 'https://login.microsoftonline.com/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/discovery/v2.0/keys'
  });

  function getKey(header, callback){
    client.getSigningKey(header.kid, function(err, key) {
      var signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  var validateOptions = {
    "audience" : "api://43b81c01-b3a3-426d-b999-5db9fa5f1337",
    "issuer": "https://sts.windows.net/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/",
    "maxAge": "1h"
  };

  jwt.verify(token, getKey, validateOptions, function(err, decoded) {
    if (!err) {
      console.log(decoded);
      respObj.scope = decodedToken.payload.scp;
      respObj.user = decodedToken.payload.oid;
      respObj.status = "Token validated, let the business logic do it's part";
       
      res.status(200).send(respObj);
      return;

    } else {
      console.log(err);
      respObj.status = "Unable to validate token, act accordingly"
      respObj.err = err;

      res.status(200).send(respObj);
      return;
    }
  });

  
});

module.exports = router;
