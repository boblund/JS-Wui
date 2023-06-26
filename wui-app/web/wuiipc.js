'use strict';

const startbtn = document.querySelector( "#startbtn" ),
	stopbtn = document.querySelector( "#stopbtn" ),
	wsresp = document.querySelector("#wsresp");

startbtn.addEventListener( 'click', () =>{ start(); });
stopbtn.addEventListener( 'click', () =>{ stop(); });

function delay( msec ) {
	return new Promise( ( res, rej )=> {
		setTimeout( ()=> { res(); }, Math.round(msec));
	} );
}

let keepRunning = false;

async function start(){
	startbtn.hidden = true;
	stopbtn.hidden = false;
	keepRunning = true;

	const msg = {type: 'someNodeFunction', value: 'args' } ;

	while( keepRunning ){
		if( Math.round(Math.random()) == 1 ? 'await' : 'cb' === 'await' ) { // random send modes
			let resp;
			try {
				resp = await Wui.sendIpc('wuiipc', msg); //JSON.stringify(msg) );
				// do something with resp
				wsresp.innerHTML = `await: ${JSON.stringify(resp)}`;
			} catch(e) {
				// handle error
				wsresp.innerHTML = `await error: ${JSON.stringify(resp)}`;
			}
		} else {
			Wui.sendIpc('wuiipc', msg, (err, resp) => {
				if(err) {
					// handle error
					wsresp.innerHTML = `callback error: ${JSON.stringify(resp)}`;
				} else {
					// do something with resp
					wsresp.innerHTML = `callback: ${JSON.stringify(resp)}`;
				}
			});
		}

		await delay((Math.random() * 1000) * .3 ); // 0 to last multiplier seconds
	};
};

function stop() {
	startbtn.hidden = false;
	stopbtn.hidden = true;
	keepRunning = false;
}
