/*server.js:54 restApiGw(app, restApi);

restApi = {
	"/apipath": [
		{
			"method": "GET",
			"route": {
				"type": "AWS::Serverless::Function",
				"lambdaPath": "/Users/blund/Documents/swdev/JS-Wui/wui-app/restApi/apidir/app",
				"lambdaHandler": "lambdaHandler",
				"environment": {}
			}
		}
	]
}'

/*server.js:65 wsApiGw(httpServer, wsApi);

wsApi = {
	"mappingKey": "action",
	"routes": {
		"$connect": [
			{
				"method": "WEBSOCKET",
				"route": {
					"type": "WUI::Route",
					"lambdaPath": "/Users/blund/Documents/swdev/JS-Wui/wui-app/wsApi/onconnect/app",
					"lambdaHandler": "handler",
					"environment": {}
				}
			}
		],
		"$disconnect": [
			{
				"method": "WEBSOCKET",
				"route": {
					"type": "WUI::Route",
					"lambdaPath": "/Users/blund/Documents/swdev/JS-Wui/wui-app/wsApi/ondisconnect/app",
					"lambdaHandler": "handler",
					"environment": {}
				}
			}
		],
		"wuiipc": [
			{
				"method": "WEBSOCKET",
				"route": {
					"type": "WUI::Route",
					"lambdaPath": "/Users/blund/Documents/swdev/JS-Wui/wui-app/wsApi/wuiipc/app",
					"lambdaHandler": "handler",
					"environment": {}
				}
			}
		]
	}
}'*/

const {readFileSync, readdirSync} = require('fs'),
	path = require('path');

function apiGwLambdas(type, apiPath){
	const apis={type, lambdas: {}};

	switch(type){
		case 'ws':
			apis.mappingKey = "action";
			readdirSync(apiPath).forEach(route => {
				//apis.lambdas[route] = readdirSync(apiPath + '/' + route)[0];
				apis.lambdas[path.parse(route).name] = require(`${apiPath}/${route}`).handler;
			});
			return apis;

		case 'rest':
			readdirSync(apiPath).forEach(route => {
				const methods = readdirSync(apiPath + '/' + route);
				apis.lambdas[route] = {};
				for(const method of methods){
					//apis.lambdas[route][method] = readdirSync(apiPath + '/' + route + '/' + method)[0];
					apis.lambdas[route][path.parse(method).name] = require(`${apiPath}/${route}/${method}`)['lambdaHandler'];
				}
			});
			return apis;

		default:
			throw(`error: inknown api type - ${type}`);
	}
}

const rest = apiGwLambdas('rest', '../restApi');
const ws = apiGwLambdas('ws', '../wsApi');

rest.lambdas.apipath.GET('event', 'context');
ws.lambdas.onconnect('event', 'context');

