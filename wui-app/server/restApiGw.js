// License: Creative Commons Attribution-NonCommercial 4.0 International

'use strict';

// Based on https://steveholgado.com/aws-lambda-local-development/#creating-our-lambda-function

const express = require('express');
const bodyParser = require('body-parser');
const {readdirSync, readFileSync} = require('fs');
const path = require('path');

function restApiGw(app, apiPath) {
	let lambdas = {};
	readdirSync(apiPath).forEach(route => {
		const methods = readdirSync(apiPath + '/' + route);
		lambdas[route] = {};
		for(const method of methods){
			lambdas[route][path.parse(method).name] = require(`${apiPath}/${route}/${method}`)['lambdaHandler'];
		}
	});

	app.use((req, res, next) => {
		if (req.originalUrl === '/api/webhook') {
			bodyParser.raw({ type: 'application/json' })(req, res, next);
		} else {
			bodyParser.json()(req, res, next);
		}
	});

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.text());
	app.use(require('cors')());

	//const apiGw = new (require('./ApiGw'))(restApi);

	app.use('/api/*', async (req, res) => {
		let route = req.baseUrl.replace(/^\/[^/]*\//, "");
		//const result = await apiGw.invoke(
		//	route,
		//	req.method,
		const result = await lambdas[route][req.method](
			{headers: req.headers, body: req.body}	//event
		);

		// Respond to HTTP request
		res
			.status(result.statusCode ? result.statusCode : 500)
			.set(result?.headers)
			.end(result.body ? result.body  : result.message);
	});
}

module.exports = restApiGw;
