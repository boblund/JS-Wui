function delay( msec ) {
	return new Promise( ( res, rej )=> {
		setTimeout( ()=> { res(); }, Math.round(msec));
	} );
}

exports.handler = async (event, context) => {
	const {data} = JSON.parse(event.body);

	await delay((Math.random() * 1000) * .25 ); // 0 to last multiplier seconds;
	await context.clientContext.getConnection({ConnectionId: global.connectionId});
	await context.clientContext.postToConnection({
		ConnectionId: global.connectionId,
		Data: JSON.stringify({
			id: data.id,
			msg: {
				type: 'someNodeFunctionResp',
				value: 'response'
			}
		})
	});

	return { statusCode: 200, body: 'success' };
};
