#!/usr/bin/env node

// License: Creative Commons Attribution-NonCommercial 4.0 International
// THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.

'use strict';

const { join } = require('path'),
	{ fork } = require('child_process'),
	server = require('./server/server.js'),
	{apis, window: {title, size}} = require('./appConfig.js');

process.on('SIGINT', ()=> {
	console.log('SIGINT');
	process.exit(2);
});

(async function(){
	try {
		const serverPort = await server(apis);
		const webviewChild = fork(join(__dirname, './webview.js'),
			[JSON.stringify({
				title,
				size,
				url: `http://127.0.0.1:${serverPort}`,  //protocol needs to reflect https if used
				debug: true
			})],
			{ silent: true });

		webviewChild.stderr.on('data', data => {
			process.stderr.write(`webview: ${data.toString()}`);;
		});

		webviewChild.on('exit', ()=>{
			process.exit();
		});
	} catch(e){
		console.error(e);
	}
})();
