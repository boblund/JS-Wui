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

document.querySelector('#restapi').addEventListener('click', async function() {
	document.querySelector('#restresp').innerHTML = await curl(`${window.location.href}api/apipath`);
});
