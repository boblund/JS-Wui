// Brume disconnect route

"use strict";

exports.handler = (event, context) => {
	delete global.connectionId;
	return { statusCode: 200, body: 'success' };
};
