const webview = require('./addon_webview.node'),
	{title, size:[w,h], url} = JSON.parse(process.argv[2]);

webview.start();
webview.set_title(title);
webview.set_size(w, h);
webview.navigate(url);
webview.run();
