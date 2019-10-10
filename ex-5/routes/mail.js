var express = require('express');
var router = express.Router();
var request = require('then-request');
var __ = require('underscore');

/* GET root of mail page. */
router.get('/', function(req, res) {

    // Prepare header with auth and bearer token
    var headers = {
        'Authorization': 'Bearer ' + req.session.access_token
    };

    // Prepare and send request to graph api on messages in inBox
    request('GET', "https://graph.microsoft.com/v1.0/me/mailFolders('Inbox')/messages?$select=sender,subject", {
        body: '',
        headers: headers
    }).done((mailRes => {

        if (mailRes.statusCode = 200){
            
            var mailBody = JSON.parse(mailRes.getBody());
            var newMails = [];

            __.each(mailBody.value, function (item, index) {
                newMails.push(item.sender.emailAddress.name + ' - ' + item.subject);
            });

            res.render('mail', { title: 'Mail: We may have some (' + newMails.length + ')', newMails: newMails});
            
        } else {

            //Not 200
            res.render('mail', { title: 'Mail: Failed to read mail' });
        }
  
    }));

});

module.exports = router;
