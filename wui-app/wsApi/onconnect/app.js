// Brume onconnect route

"use strict";

exports.handler = (event, context) => {
	global.connectionId = event.requestContext.connectionId;
	return { statusCode: 200, body: 'success' };
};
