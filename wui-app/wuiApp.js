#!/usr/bin/env node

// License: Creative Commons Attribution-NonCommercial 4.0 International

'use strict';

const { join } = require('path'),
	{ fork } = require('child_process'),
	server = require('./server/server.js');

let apis = {
	web: { filesPath: join(__dirname, './web')},
	rest: {
		filesPath: join(__dirname, './restApi'),
		templateName: 'template.yaml'
	},
	ws: {
		filesPath: join(__dirname, './wsApi'),
		templateName: 'template.yaml'
	}
};

process.on('SIGINT', ()=> {
	console.log('SIGINT');
	process.exit(2);
});

(async function(){
	try {
		const serverPort = await server(apis);
		const webviewChild = fork(join(__dirname, './webview.js'),
			[JSON.stringify({
				title: process.argv[1].split('/').pop().replace('.js', ''),
				size: [700, 400],
				url: `http://127.0.0.1:${serverPort}`
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
