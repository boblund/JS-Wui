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
Wui.on('wuiipc', (resp) => {
	wsresp.innerHTML = `await: ${JSON.stringify(resp)}`;
});

function start(){
	startbtn.hidden = true;
	stopbtn.hidden = false;
	keepRunning = true;

	const msg = {type: 'someNodeFunction', value: 'args' } ;
	Wui.send('wuiipc', msg);
	Wui.on('wuiipc', async (resp) => {
		wsresp.innerHTML = `await: ${JSON.stringify(resp)}`;
		if(keepRunning) {
			await delay((Math.random() * 1000) * .3 ); // 0 to last multiplier seconds
			Wui.send('wuiipc', msg);
		}
	});
};

function stop() {
	startbtn.hidden = false;
	stopbtn.hidden = true;
	keepRunning = false;
}
