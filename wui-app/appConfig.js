'use strict';

const { join } = require('path');

exports.apis = {
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

exports.window = {
	title: process.argv[1].split('/').pop().replace('.js', ''),
	size: [700, 400],
};

