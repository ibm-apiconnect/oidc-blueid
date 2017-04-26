/*************************************************************************
*
* Module Dependencies
*
*************************************************************************/

var xml2js = require('xml2js');

/*************************************************************************
*
* Exported Functions
*
*************************************************************************/

/*
 * Common Error Return Function
 */
module.exports.returnError = function (res, errorCode, errorDesc, returnXml) {

	if (returnXml) {
		res.set('Content-Type', 'application/xml');
		res.status(errorCode).send("<resp><errorDescription>"+errorDesc+"</errorDescription></resp>");
	} else {
		res.status(errorCode).json({
			"errorDescription": errorDesc
		});
	}

};

/*
* Common Update Result Return Function
*/
module.exports.returnUpdateResult = function (res, updateDesc, returnXml) {

	if (returnXml) {
		res.set('Content-Type', 'application/xml');
		res.send("<resp><updateResult>"+updateDesc+"</updateResult></resp>");
	} else {
		res.json({
			"updateResult": updateDesc
		});
	}

};

/*
* Return XML instead of JSON
*/
module.exports.returnXmlFromJson = function (json, rootName, res) {
	
	var toXmlBody = {};
	var xmlBuilder;
	
	// Set content-type for response
	res.set('Content-Type', 'application/xml');
	
	// Determine if returning single result or an array
	var returnArray = ((json.length === 1) ? false: true);
	
	if (returnArray) {
		xmlBuilder = new xml2js.Builder();
		toXmlBody[rootName + "List"] = {
		};
		toXmlBody[rootName + "List"][rootName] = [];
		toXmlBody[rootName + "List"][rootName] = json;
		res.send(xmlBuilder.buildObject(toXmlBody));
	} else {
		xmlBuilder = new xml2js.Builder({
			"rootName": rootName
		});
		res.send(xmlBuilder.buildObject(json[0]));
	}
};

/*
* Convert XML Requst Body to JSON Object
*/
module.exports.setReqBody = function (contType, body, callback) {
	
	// Determine if the request is sent as XML instead of JSON
	var reqIsXml = ((contType.indexOf("xml") > 0) ? true : false);
	
	if (reqIsXml) {
		
		// Convert XML to JSON and return the result
		
		var parseString = require('xml2js').parseString;
		var parseOptions = {
			trim: true,
			explicitArray: false,
			ignoreAttrs: true,
			explicitRoot: false
		};
		
		parseString(body, parseOptions, function (err, result) {
			console.log("XML as JSON:\n" + JSON.stringify(result));
			callback(result);
		});
		
	} else {
		
		// Return the JSON
		callback(body);
		
	}
};