// License: Creative Commons Attribution-NonCommercial 4.0 International
// THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.

function delay( msec ) {
	return new Promise( ( res, rej )=> {
		setTimeout( ()=> { res(); }, Math.round(msec));
	} );
}

exports.handler = async (msg, cb) => {
	await delay((Math.random() * 1000) * .25 ); // 0 to last multiplier seconds;
	msg.type += ' resp';
	msg.value += ' resp';
	await cb(msg);
};
