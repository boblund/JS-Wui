// Brume onconnect route

"use strict";

exports.handler = (event) => {
	//global.connectionId = event.requestContext.connectionId;
	return { statusCode: 200, body: 'success' };
};
