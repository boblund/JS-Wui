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

const {readFileSync, readdirSync} = require('fs');

function apiGwLambdas(type, path){
	const apis={type, lambdas: {}};

	switch(type){
		case 'ws':
			apis.mappingKey = "action";
			readdirSync(path).forEach(route => {
				//apis.lambdas[route] = readdirSync(path + '/' + route)[0];
				apis.lambdas[route] = require(`${path}/${route}`)['handler'];
			});
			return apis;

		case 'rest':
			readdirSync(path).forEach(route => {
				const methods = readdirSync(path + '/' + route);
				apis.lambdas[route] = {};
				for(const method of methods){
					//apis.lambdas[route][method] = readdirSync(path + '/' + route + '/' + method)[0];
					apis.lambdas[route][method] = require(`${path}/${route}/${method}`)['lambdaHandler'];
				}
			});
			return apis;

		default:
			throw(`error: inknown api type - ${type}`);
	}
}

console.log(JSON.stringify(apiGwLambdas('rest', '../new-restApi'), null, 2));
console.log(JSON.stringify(apiGwLambdas('ws', '../new-wsApi'), null, 2));
