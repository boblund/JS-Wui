const savebtn = document.querySelector("#savebtn"),
	savedata = document.querySelector("#savedata"),
	readbtn = document.querySelector("#readbtn"),
	readdata = document.querySelector("#readdata"),
	messagebtn = document.querySelector("#messagebtn"),
	messageresp = document.querySelector("#messageresp"),
	notifybtn = document.querySelector("#notifybtn"),
	ipcbtn = document.querySelector("#ipcbtn"),
	ipcresp = document.querySelector("#ipcresp");

savebtn.addEventListener("click", async() => {
	let res = await Wui.writeFileDialog('myfile.txt');
	if(res != '') res = await Wui.writeFile(res.path, savedata.innerText + '\n');
});

readbtn.addEventListener("click", async() => {
	let res = await Wui.readFileDialog();
	if(res != '') {
		res = await Wui.readFile(res.path);
		//readdata.innerHTML = res[0].replaceAll('\\n', '\n');
		readdata.innerHTML = res.data.replaceAll('\\n', '\n');
	}
});

messagebtn.addEventListener("click", async() => {
	let res = await Wui.message("Message", "This is an info message", "info");
	messageresp.innerText = `Message resp: ${res}`;
});

ipcbtn.addEventListener("click", async() => {
	let res = await Wui.sendIpc(JSON.stringify({type: 'doNodeFunction', value: 'argument string'}));
	ipcresp.innerHTML = JSON.stringify(res); //res.value;
});

notifybtn.addEventListener("click", async() => {
	await Wui.notify("Notification", "This is a warning notification", "warning");
	let r = 1;
});

function curl(cmd, method='GET', headers={}, body='') {
	return new Promise((resolve, reject) => {
		const http = new XMLHttpRequest();
		http.open(method, cmd);
		http.send();
		http.onreadystatechange = function() {
			if(this.readyState === 4) {
				if(this.status === 200) {
					resolve(http.responseText);
				} else {
					reject(new Error('Failed to load page, status code: ' + this.status));
				}
			}
		};
	});
};

window.resizeTo(
	window.screen.availWidth * .75,
	window.screen.availHeight * .75);

window.addEventListener("beforeunload", function(e){
	navigator.sendBeacon(`${window.location.href}ctrl/pageclose`);
}, false);

document.querySelector('#restapi').addEventListener('click', async function() {
	document.querySelector('#restresp').innerHTML = await curl(`${window.location.href}api/apipath`);
});

var websocket = new WebSocket(`ws://${window.location.host}`);

document.querySelector('#openws').addEventListener('click', function() {
	//websocket = new WebSocket(`ws://${window.location.host}`);
	document.querySelector('#openws').hidden = true;
	document.querySelector('#sendws').hidden = false;
	document.querySelector('#closews').hidden = false;
	document.querySelector('#wsdata').hidden = false;

	websocket.onmessage = msg => {
		document.querySelector('#wsresp').innerHTML = msg.data;
	};
});

document.querySelector('#sendws').addEventListener('click', function() {
	websocket.send(JSON.stringify({
		action: 'send',
		to: 'server',
		data: 'message from client'
	}));
	document.querySelector('#sendws').hidden = true;
});

document.querySelector('#closews').addEventListener('click', function() {
	websocket.close();
	document.querySelector('#openws').hidden = false;
	document.querySelector('#sendws').hidden = true;
	document.querySelector('#closews').hidden = true;
	document.querySelector('#wsdata').hidden = true;
	document.querySelector('#wsresp').innerHTML = '';

});
