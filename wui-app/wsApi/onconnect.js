// License: Creative Commons Attribution-NonCommercial 4.0 International
// THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.

"use strict";

exports.handler = (event) => {
	//global.connectionId = event.requestContext.connectionId;
	return { statusCode: 200, body: 'success' };
};
