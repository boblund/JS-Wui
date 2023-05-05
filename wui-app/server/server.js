#!/usr/bin/env node

'use strict';

// License: Creative Commons Attribution-NonCommercial 4.0 International

// Integrated local AWS s3 static web and rest/ws api server.
// Based on https://stackoverflow.com/a/34838031/6996491.

const { readFileSync, existsSync } = require('fs'),
	{ hostname } = require('os'),
	express = require('express'),
	restApiGw = require('./restApiGw.js'),
	wsApiGw = require('./wsApiGw.js'),
	apiGwLambdas = require('./apiGwLambdas.js');

const portRange = [ 10000, 60000 ];
function generatePort() {return (Math.floor(Math.random() * (portRange[1] - portRange[0] + 1)) + portRange[0]);}

function listen(server) {
	return new Promise((res, rej) => {
		const port = process.env.PORT ? process.env.PORT : generatePort();
		server.listen(port, function() { res(port); })
			.on('error', e => { rej(e); });
	});
}

let app = null;

async function server(apis, https=false) {
	const httpServer = (https
		? require('https').createServer({
			key: readFileSync(`${hostname()}.key`),
			cert: readFileSync(`${hostname()}.cert`)
		})
		: require('http')).createServer();

	for(let api in apis) {
		switch(api) {
			case 'web':
				if(existsSync(apis.web.filesPath)) {
					app = app ? app : express(); //app if necessary
					app.use(express.static(apis.web.filesPath));
				} else {
					console.error(`${process.argv[1].split('/').pop()}: ${apis.web.filesPath} does not exist`);
					process.exit(1);
				}
				break;

			case 'rest':
				app = app ? app : express(); //app if necessary
				const {restApi} = await apiGwLambdas(apis.rest);
				if(restApi && Object.keys(restApi).length > 0) {
					restApiGw(app, restApi);
				} else {
					console.error(`${process.argv[1].split('/').pop()}: no restApi`);
					process.exit(1);
				}
				break;

			case 'ws':
				if(!apis?.ws) break;
				const {wsApi} = await apiGwLambdas(apis.ws);
				if(wsApi && Object.keys(wsApi.routes).length > 0) {
					wsApiGw(httpServer, wsApi);
				} else {
					console.error(`${process.argv[1].split('/').pop()}: no wsApi`);
					process.exit(1);
				}
				break;
		}
	}

	// Let whoever set this know that this browser window was closed
	app.use('/ctrl/pageclose', (req, res) => {
		if(global?.wuiBrowser && global?.wuiBrowser instanceof Function) global.wuiBrowser();
	});

	if(app) httpServer.on('request', app); // Mount the app if it exists

	let port = null;
	while(true) {
		try {
			port = await listen(httpServer);
			break;
		} catch(e){
			if(e.code == 'EADDRINUSE') continue;
			console.error(`server error: ${e.code}`);
			process.exit(1);
		}
	}
	return(port);
};

module.exports = server;
