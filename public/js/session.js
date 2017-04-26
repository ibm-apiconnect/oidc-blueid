/*************************************************************************
*
* Exported Functions
*
*************************************************************************/

module.exports.clear = function (req) {
	global.sess=req.session;
	global.sess.client_type;
	global.sess.oauth_authz_url;
	global.sess.oauth_token_url;
	global.sess.ro_id;
	global.sess.ro_pwd;
	global.sess.grant_type;
	global.sess.client_id;
	global.sess.client_secret;
	global.sess.req_scope;
	global.sess.redirect_uri;
};

module.exports.set = function (req) {

	console.log("REQUEST BODY FOR SESSION:\n" + JSON.stringify(req.body));

	global.sess=req.session;
	global.sess.client_type = req.body.client_type;
	global.sess.oauth_authz_url = req.body.oauth_authz_url;
	global.sess.oauth_token_url = req.body.oauth_token_url;
	global.sess.ro_id = req.body.ro_id;
	global.sess.ro_pwd = req.body.ro_pwd;
	global.sess.grant_type = req.body.grant_type;
	global.sess.client_id = req.body.client_id;
	global.sess.client_secret = req.body.client_secret;
	global.sess.req_scope = req.body.req_scope;
	global.sess.redirect_uri = req.body.redirect_uri;
};
