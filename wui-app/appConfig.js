// License: Creative Commons Attribution-NonCommercial 4.0 International
// THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.

'use strict';

const { join } = require('path');

exports.apis = {
	web: { filesPath: join(__dirname, './web')},
	rest: {
		filesPath: join(__dirname, './restApi')
	},
	ws: {
		filesPath: join(__dirname, './wsApi')
	}
};

exports.window = {
	title: process.argv[1].split('/').pop().replace('.js', ''),
	size: [700, 400],
};

