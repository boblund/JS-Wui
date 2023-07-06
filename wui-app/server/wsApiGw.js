
// License: Creative Commons Attribution-NonCommercial 4.0 International
// THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.

'use strict';

const {readdirSync} = require('fs');
const path = require('path');

function wsApiGw(httpServer, apiPath) {
	let handlers={};

	readdirSync(apiPath).forEach(route => {
		handlers[path.parse(route).name] = require(`${apiPath}/${route}`).handler;
	});

	// Create web socket server on top of a regular http server
	const wsServer = require('ws').Server;
	const wss = new wsServer({ server: httpServer });

	wss.on('connection', (ws, req) => {
		const routeCbs = {};

		Object.keys(handlers).forEach(route => {
			handlers[route]({
				send(msg) { ws.send(JSON.stringify({route, msg})); },
				onmessage(cb) { routeCbs[route] = cb; }
			});
		});

		ws.on('close', () => {
			Object.keys(routeCbs).forEach(route => {delete routeCbs[route];});
			Object.keys(handlers).forEach(route => {delete handlers[route];});
		});

		ws.on('message', message => {
			let msg = null, route = null;

			try {
				({route, msg} = JSON.parse(message));
			} catch(e) {
				console.error('ws.on messgage error:', e.code, e.message);
				ws.send(JSON.stringify({
					msg: { error: 'Invalid JSON:' + message },
					route: null
				}));
				return;
			}

			routeCbs[route](msg);
		});
	});
}

module.exports = wsApiGw;
