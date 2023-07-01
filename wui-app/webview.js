// License: Creative Commons Attribution-NonCommercial 4.0 International
// THIS SOFTWARE COMES WITHOUT ANY WARRANTY, TO THE EXTENT PERMITTED BY APPLICABLE LAW.

const webview = require('./addon_webview.node'),
	{title, size:[w,h], url, debug} = JSON.parse(process.argv[2]);

webview.start({
	title,
	size: Uint16Array.from([w, h]),
	url,
	debug
});
