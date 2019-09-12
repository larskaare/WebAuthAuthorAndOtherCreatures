var express = require('express');
var router = express.Router();
var request = require('then-request');
var __ = require('underscore');
var logHelper = require('../src/logHelper');
var authUtil = require('../src/authutils');

var logger = logHelper.createLogger();


/* GET root of mail page. */
router.get('/', authUtil.ensureAuthenticated,function(req, res) {

    logger.info('Got request to hit MS Graph for new emails');

    // Prepare header with auth and bearer token
    var headers = {
        'Authorization': 'Bearer ' + req.user.authInfo.access_token
    };

    // Prepare and send request to graph api on messages in inBox
    request('GET', 'https://graph.microsoft.com/v1.0/me/mailFolders(\'Inbox\')/messages?$select=sender,subject', {
        body: '',
        headers: headers
    }).done((mailRes => {

        var newMails = [];

        if (mailRes.statusCode == 200){
            
            var mailBody = JSON.parse(mailRes.getBody());
            

            __.each(mailBody.value, function (item) {
                newMails.push(item.sender.emailAddress.name + ' - ' + item.subject);
            });

            res.render('mail', { title: 'Mail: We may have some (' + newMails.length + ')', newMails: newMails});
            
        } else {

            //Not 200
            logger.warn('Error reading emails - status code' + mailRes.statusCode);
            res.render('mail', { title: 'Mail: Error reading '});
        }
  
    }));

});

module.exports = router;
