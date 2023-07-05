// License: Creative Commons Attribution-NonCommercial 4.0 International
// THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.

'use strict';

const {readdirSync} = require('fs');
const path = require('path');
const url = require('url');

function wsApiGw(httpServer, apiPath) {
	let handlers={};

	readdirSync(apiPath).forEach(route => {
		handlers[path.parse(route).name] = require(`${apiPath}/${route}`).handler;
	});

	// Create web socket server on top of a regular http server
	const wsServer = require('ws').Server;
	const wss = new wsServer({ server: httpServer });
	const clients = {};

	wss.on('connection', async (ws, req) => {
		const connectionId = req.headers['sec-websocket-key'];
		let r = await handlers['onconnect']({ //event
			headers: { ...req.headers, queryStringParameters: url.parse(req.url,true).query }
		});

		if(r.statusCode != 200){
			ws.close(1011, r.body);
			return;
		}

		clients[connectionId] = ws;

		ws.on('close', async () => {
			try {
				delete clients[connectionId];
				await handlers['ondisconnect']();				
			} catch (e) {
				console.error(e);
			}
		});

		ws.on('message', async message => {
			let id = null, msg = null, route = null;

			try {
				({data: {id}, data: {msg}, route} = JSON.parse(message));
			} catch(e) {
				console.error('ws.on messgage error:', e.code, e.message);
				await clients[connectionId].send(JSON.stringify({
					msg: { error: 'Invalid JSON:' + message },
					id: null
				}));
				return;
			}

			try {
				await handlers[route]( msg, (msg) => {
					return new Promise((res, rej) => {
						clients[connectionId].send( JSON.stringify({id, msg}), err => {err ? rej(err) : res();} );
					});
				});       
			} catch (e) {
				console.error('ws server error:', e.statusCode, e.body);
			}
		});
	});
}

module.exports = wsApiGw;
