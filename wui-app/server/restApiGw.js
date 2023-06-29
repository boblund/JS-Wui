// License: Creative Commons Attribution-NonCommercial 4.0 International

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {readdirSync, readFileSync} = require('fs');
const path = require('path');

function restApiGw(app, apiPath) {
	let handlers = {};
	readdirSync(apiPath).forEach(route => {
		const methods = readdirSync(apiPath + '/' + route);
		handlers[route] = {};
		for(const method of methods){
			handlers[route][path.parse(method).name] = require(`${apiPath}/${route}/${method}`).handler;
		}
	});

	app.use((req, res, next) => {
		if (req.originalUrl === '/api/webhook') { // Needed for Stripe
			bodyParser.raw({ type: 'application/json' })(req, res, next);
		} else {
			bodyParser.json()(req, res, next);
		}
	});

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.text());
	app.use(require('cors')());
	app.use('/api/*', async (req, res) => {
		let route = req.baseUrl.replace(/^\/[^/]*\//, "");
		const result = await handlers[route][req.method](
			{headers: req.headers, body: req.body}	//event
		);

		res
			.status(result.statusCode ? result.statusCode : 500)
			.set(result?.headers)
			.end(result.body ? result.body  : result.message);
	});
}

module.exports = restApiGw;
