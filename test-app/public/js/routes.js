/*************************************************************************
 *
 * Module Requirements
 *
 ************************************************************************/

var express = require('express');
var router = express.Router();

/*************************************************************************
 *
 * Index Routes
 *
 ************************************************************************/

router.get('/', function displayIndex(req, res) {
  res.render('index.jade', {
    header: 'API Connect OIDC with IBM blueID IDaaS',
    subHeader: 'Token Tester'
  });
});

/*************************************************************************
 *
 * OAuth Routes
 *
 *************************************************************************/

var oauth = require('./oauth_functions');

router.post('/clientSetupFormSubmit', oauth.clientSetupFormSubmit);
router.post('/apiReqSubmit', oauth.apiReqSubmit);
router.get('/callback', oauth.authCodeCallback);
router.get('/:page', oauth.displayForm);

/*************************************************************************
 *
 * Module Exports
 *
 *************************************************************************/

module.exports = router;
