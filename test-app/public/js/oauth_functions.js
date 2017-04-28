/*************************************************************************
*
* Module Dependencies
*
*************************************************************************/

var request = require('request');
var querystring = require('querystring');
var session = require('./session');

/*************************************************************************
*
* Local Functions
*
*************************************************************************/

function buildRoAuthUrl (clientId, redirectUri, reqScope, grantType) {

	var url_params = {
		client_id: clientId,
		redirect_uri: redirectUri,
		scope: reqScope
	};

	url_params.response_type = ((grantType === "authz_code") ? 'code' : 'token');

	return querystring.stringify(url_params);
}

function formatTokenRequest (tokenUrl, roId, roPwd, clientType, grantType, clientId, clientSecret, scope, redirectUrl, authCode) {
	console.log("formattTokenRequest function called");

	// Format the request params
	var post_data;

	switch (grantType) {
		case 'client_cred':
			post_data = {
				'grant_type' : 'client_credentials',
				'scope' : scope
			};
			break;
		case 'ro_cred':
			post_data = {
				'grant_type' : 'password',
				'username' : roId,
				'password' : roPwd,
				'scope' : scope
			};
			break;
		case 'authz_code':
			post_data = {
				'grant_type' : 'authorization_code',
				'code' : authCode,
        'redirect_url' : redirectUrl,
        'scope' : scope
			};
			break;
	}

	// Set the request options
	var post_options = {
		url: tokenUrl,
		strictSSL: false,
		form: post_data
	};

	if (clientType === "Confidential") {
		post_options.auth = {
    	user: clientId,
    	pass: clientSecret
    };
	}

	return post_options;
}

/*************************************************************************
*
* Exported Functions
*
*************************************************************************/

module.exports.displayIndex = function (req, res) {
	// Reset the session
	session.clear(req);

	// Show the index page
	res.render('index.jade', {header: 'IBM API Management', subHeader: 'OAuth Token Tool'});
};

module.exports.displayForm = function (req, res) {
	// Reset the session
	session.clear(req);

	var page = req.params.page;

	switch (page) {
		case 'authz_code':
			res.render('clientSetupForm.jade', {header: 'Authorization Code', subHeader: 'Grant Type', formType: 'authz_code'});
			break;
		case 'client_cred':
			res.render('clientSetupForm.jade', {header: 'Client Credentials', subHeader: 'Grant Type', formType: 'client_cred'});
			break;
		case 'ro_cred':
			res.render('clientSetupForm.jade', {header: 'Resource Owner Password', subHeader: 'Grant Type', formType: 'ro_cred'});
			break;
		case 'impl':
			res.render('clientSetupForm.jade', {header: 'Implicit', subHeader: 'Grant Type', formType: 'implicit'});
			break;
		default:
			res.render('index.jade', {header: 'IBM API Management', subHeader: 'OAuth Token Tool'});
			break;
	}
};

module.exports.clientSetupFormSubmit = function(req, res) {

	// Update the session variables with the req.body values
	session.set(req);

	console.log("setting up request for grant type: " + req.body.grant_type);

	// Check client type
	if (req.body.grant_type == 'authz_code' || req.body.grant_type == 'implicit') {

		// Call a function which sets up the auth link
		var resourceOwnerAuthLink = req.body.oauth_authz_url + '?' + buildRoAuthUrl(req.body.client_id, req.body.redirect_url, req.body.req_scope, req.body.grant_type);
		console.log("resourceOwnerAuthLink: " + resourceOwnerAuthLink);

		// Redirect the resource owner to the OAuth login page
		res.redirect(301, resourceOwnerAuthLink);

	} else if (req.body.grant_type == 'client_cred' || req.body.grant_type == 'ro_cred') {

		// Format the token request parameters
		var tokenReqOptions = formatTokenRequest(
					req.body.oauth_token_url,
					req.body.ro_id,
					req.body.ro_pwd,
					req.body.client_type,
					req.body.grant_type,
					req.body.client_id,
					req.body.client_secret,
					req.body.req_scope);

		// Set up the api request URL basd on what we know
		var apiReqUrl = req.body.oauth_token_url.replace("oauth/token", "<resource>?client_id=") + req.body.client_id;

		console.log('attempting token request POST with options:\n' + JSON.stringify(tokenReqOptions));

		// Send the Token Request to APIM
		request.post(tokenReqOptions, function(err,httpResponse,body){
			if (!err) {
				console.log('response body: ' + body);
				console.log('the token is: ' + JSON.parse(body).access_token);

				// render it in a new page
				res.render('showToken.jade', {
					header: 'Access Token',
					rspBody: JSON.parse(body),
					apiReqUrl: apiReqUrl
				});
			} else {
				console.log('--- err: \n' + err);
			}
		});
	}
};

module.exports.apiReqSubmit = function(req, res) {

	console.log("setting request options");

	var req_options;

	switch (req.body.req_method) {
		case 'GET':
			// No request body needed
			req_options = {
				method: req.body.req_method,
				url: req.body.req_api_url,
				strictSSL: false,
				auth: {
			    bearer: req.body.oauth_access_token
			  }
			};
			break;
		default:
			switch (req.body.req_content_type) {
				case 'application/json':
					req_options = {
						method: req.body.req_method,
						url: req.body.req_api_url,
						strictSSL: false,
						auth: {
					    bearer: req.body.oauth_access_token
					  },
					  body: JSON.parse(req.body.req_body),
					  json: true
					};
					break;
				default:
					req_options = {
						method: req.body.req_method,
						url: req.body.req_api_url,
						strictSSL: false,
						auth: {
					    bearer: req.body.oauth_access_token
					  },
					  headers: {
					  	'Content-Type': req.body.req_content_type
					  },
					  body: req.body.req_body
					};
					break;
			}
			break;
	}

	console.log("---req_options: " + JSON.stringify(req_options));

	// Send the Token Request to APIM
	request(req_options, function (err, httpResponse, body) {
		if (! err) {
			console.log('response content-type: ' + httpResponse.headers['content-type']);

			var rsp_body_parsed;
			if (httpResponse.headers['content-type'].indexOf('json') > -1) {
				console.log('parsing response as JSON');
				if (typeof body === "string") {
					rsp_body_parsed = JSON.stringify(JSON.parse(body), null, 3);
				} else {
					rsp_body_parsed = JSON.stringify(body, null, 3);
				}
			} else {
				rsp_body_parsed = body;
			}

			console.log('response body: ' + rsp_body_parsed);

			var displayValues = {
				access_token: req.body.oauth_access_token,
				req_method: req.body.req_method,
				req_content_type: req.body.req_content_type,
				req_api_url: req.body.req_api_url,
				req_body: req.body.req_body,
				rsp_body: rsp_body_parsed
			};

			// display the response in the text area
			res.render('showToken.jade', {
				header: 'Access Token',
				rspBody: displayValues
			});
		} else {
			console.log('--- err: \n' + err);
		}
	});
};

module.exports.authCodeCallback = function(req, res) {
	var authCode = req.query.code;
	var error = req.query.error;

	if (authCode) {
		// Got a an Auth Code from the Server
		console.log('authCodeCallback method invoked, code is: ' + authCode);

		console.log('session values: ' + JSON.stringify(global.sess));

		var tokenReqOptions = formatTokenRequest(
					global.sess.oauth_token_url,
					global.sess.ro_id,
					global.sess.ro_pwd,
					global.sess.client_type,
					global.sess.grant_type,
					global.sess.client_id,
					global.sess.client_secret,
					global.sess.req_scope,
					global.sess.redirect_url,
					authCode);

		console.log('tokenReqOptions: ' + JSON.stringify(tokenReqOptions));

		// Send the Token Request to APIM
		request.post(tokenReqOptions, function(err,httpResponse,body){
			if (!err) {
				console.log('response body: ' + body);
				console.log('the token is: ' + JSON.parse(body).access_token);

				// render it in a new page
				var apiReqUrl = global.sess.oauth_token_url.replace("oauth/token", "<resource>?client_id=") + global.sess.client_id;
				var renderOptions = {
					header: 'Access Token',
					rspBody: JSON.parse(body),
					apiReqUrl: apiReqUrl
				};
				res.render('showToken.jade', renderOptions);
			} else {
				console.log('--- err: \n' + err);
			}
		});

	}
	else if (error) {
		// Request was denied by the resource owner

		var errorDetails = {
			error: req.query.error,
			error_description: req.query.error_description
		};

		var renderOptions = {
			header: 'Access Token',
			rspBody: errorDetails
		};
		res.render('showToken.jade', renderOptions);
	}
	else {

		// Since there's no auth code or error, hopefully we got an access token via implicit grant, render it in a new page

		var apiReqUrl = global.sess.oauth_authz_url.replace("oauth/authorize", "<resource>?client_id=") + global.sess.client_id;

		var renderOptions = {
			header: 'Access Token',
			rspBody: {
				access_token: "checkHash"
			},
			apiReqUrl: apiReqUrl
		};
		res.render('showToken.jade', renderOptions);

	}

};
