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
  } else {
    console.log('No JWT token in request');
    res.status(401).send('Access denied');
    return;
  }

  var decodedToken = jwt.decode(tokenArray[1],{complete: true});
  var token = tokenArray[1];
  

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
    "audience" : "api://b7f6e800-ffa7-4ffc-920f-000ec3343bce",
    "issuer": "https://sts.windows.net/3aa4a235-b6e2-48d5-9195-7fcf05b459b0/",
    "maxAge": "1h"
  };

  jwt.verify(token, getKey, validateOptions, function(err, decoded) {
    if (!err) {
      console.log(decoded);

      //validating a few other claims in the token
      //AppID  - it was issued from a known client
      if (decoded.appid == 'b1621ac1-750a-4ee2-915b-0388732a97d3') {
        res.status(200).send(returnQuote());
        return;
      } else {
        console.log('Got token from a non-certified client (appid)');
        res.status(401).send('Token failed validation');
        return;
      }


    } else {
      console.log(err);
      respObj.status = "Unable to validate token, act accordingly"
      respObj.err = err;

      res.status(401).send('Token failed validation');
      return;
    }
  });

    
});

function returnQuote() {
  const quotes = [
    "The greatest glory in living lies not in never falling, but in rising every time we fall. -Nelson Mandela",
    "The way to get started is to quit talking and begin doing. -Walt Disney",
    "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma – which is living with the results of other people's thinking. -Steve Jobs",
    "If life were predictable it would cease to be life, and be without flavor. -Eleanor Roosevelt",
    "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough. -Oprah Winfrey",
    "Two is more than One! -McDonald"
  ];

  var quoteToReturn = quotes[Math.floor(Math.random() * quotes.length)];
  console.log('Returning quote ' + quoteToReturn);

  return(quoteToReturn);

}

module.exports = router;
