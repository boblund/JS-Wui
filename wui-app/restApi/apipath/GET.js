"use strict";

exports.lambdaHandler = (event, context) => {
	return {
		statusCode: 200,
		body: `Random response: ${Math.random().toString(36).slice(2,11)}`
	};
};
