// License: Creative Commons Attribution-NonCommercial 4.0 International
// THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.

function delay( msec ) {
	return new Promise( ( res, rej )=> {
		setTimeout( ()=> { res(); }, Math.round(msec));
	} );
}

exports.handler = async (ipc) => {
	let cnt = 0;
	await delay(5); // wait for Webview to start
	ipc.send({type: 'handler', value: 'start'});
	ipc.onmessage(async msg => {
		msg.type += ' resp';
		msg.value += ` resp ${cnt++}`;
		await delay((Math.random() * 1000) * .25 ); // 0 to last multiplier seconds;
		ipc.send(msg);
	});
};
