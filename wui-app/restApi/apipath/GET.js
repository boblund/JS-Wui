// Integrated local static web and rest/ws api server.
// Based on https://stackoverflow.com/a/34838031/6996491.

"use strict";

exports.handler = (event, context) => {
	return {
		statusCode: 200,
		body: `Random response: ${Math.random().toString(36).slice(2,11)}`
	};
};
