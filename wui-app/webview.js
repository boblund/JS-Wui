const webview = require('./addon_webview.node'),
	{title, size:[w,h], url, debug} = JSON.parse(process.argv[2]);

webview.start({
	title,
	size: Uint16Array.from([w, h]),
	url,
	debug
});
