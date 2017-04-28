/*************************************************************************
*
* This application will serve as a collection of services to assist in
* IBM APIM customer-facing demonstrations
*
* Created by: Tim Baker (bakert@us.ibm.com)
*
*************************************************************************/

/*************************************************************************
*
* Module Dependencies
*
*************************************************************************/

var express = require('express'),
    path = require('path'),
    cfenv = require('cfenv'),
    jade = require('jade'),
    bodyParser = require('body-parser'),
    favicon = require('serve-favicon'),
    errorhandler = require('errorhandler'),
    session = require('express-session'),
    proxy = require('express-http-proxy'),
    app = express();

/*************************************************************************
 *
 * App Settings
 *
 *************************************************************************/

app.enable('trust proxy');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
if (process.env.NODE_ENV === "bluemix") {
  app.use(function (req, res, next){
    if (req.secure) {
      next();
    }
    else {
      res.redirect('https://' + req.headers.host + req.url)
    }
  });
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text({ type: '*/xml' }));
app.use(express. static (path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, '/public/imgs/favicon.ico')));
app.use(session({
  secret: 'ibmApim4me2',
  resave: false,
  saveUninitialized: true
}));

app.use(errorhandler());

/*************************************************************************
*
* App Globals
*
*************************************************************************/

global.sess;	// Session

/*************************************************************************
*
* Application Routes
*
*************************************************************************/

var appRoutes = require('./public/js/routes.js');
app.use('/', appRoutes);

/*************************************************************************
*
* Start the Nodejs Application
*
*************************************************************************/

// Get the app environment variables from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Start app
app.listen(appEnv.port, appEnv.bind, function () {
	console.log("server starting on " + appEnv.url);
});
