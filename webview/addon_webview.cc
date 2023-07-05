// Integrated local static web and rest/ws api server.
// Based on https://stackoverflow.com/a/34838031/6996491.

#include <napi.h>
#include <string>
#include <iostream>
#include <fstream>
#include <sstream>

#include "webview.h"
#include "portable-file-dialogs.h"

using namespace std;

void Start(const Napi::CallbackInfo& info) {
	//Napi::Env env = info.Env();
	Napi::Object obj = info[0].As<Napi::Object>();
	Napi::Uint16Array sizeArray = obj.Get("size").As<Napi::Uint16Array>();
	webview::webview w(obj.Get("debug").ToBoolean(), nullptr);
	w.set_title(obj.Get("title").ToString().Utf8Value().c_str());
	w.set_size(sizeArray[0], sizeArray[1], WEBVIEW_HINT_NONE);
	w.navigate(obj.Get("url").ToString().Utf8Value().c_str());

	w.bind("writeFileDialog", [](std::string s) -> std::string {
		auto r = pfd::save_file("Choose file to save", webview::json_parse(s, "", 0),
			{ "Text Files (.txt .text)", "*.txt *.text" },
			pfd::opt::force_overwrite
		).result();
		return "{\"path\":\"" + r + "\"}";
	});

	w.bind("readFileDialog", [](std::string s) -> std::string {
		auto f = pfd::open_file("Choose files to read", webview::json_parse(s, "", 0),
			{ "Text Files (.txt .text)", "*.txt *.text", "All Files", "*" },
			pfd::opt::multiselect
		);
		std::string out = "";
		for(auto& it:f.result()) {out += it;}
		return "{\"path\":\"" + out + "\"}";
	});

	w.bind("writeFile", [](std::string s) -> std::string {
		ofstream myfile;
		myfile.open(webview::json_parse(s, "", 0));
		myfile << webview::json_parse(s, "", 1);
		myfile.close();
		return "[\"done\"]";
	});

	w.bind("readFile", [](std::string s) -> std::string {
		std::ifstream myfile(webview::json_parse(s, "", 0)/*, ios::in | ios::binary*/); //("/Users/blund/Downloads/myfile.txt");
		std::stringstream buffer;
		std::string str = "file not read";
		if(myfile.is_open()) {
			buffer << myfile.rdbuf();
			myfile.close();
			str = buffer.str();
			char c=92;
			std::string escape = &c;
			str = buffer.str();
			for(unsigned long int i = 0; i < str.length();) {
				if(str[i] == 10) {
					// the following 2 lines turns '\n' into '\\n', i.e. escaped \n, in the JSON string returned by bind
					// which is required so that there is a \n in the JSON data.
					str.insert(i, " ");
					str.replace(i, 2, "\\\\n");
					i += 1;
				}
				i++;
			}
		}
		return "{\"data\":\"" + str + "\"}";
	});

	w.bind("selectFolderDialog", [](std::string s) -> std::string {
		auto f = pfd::select_folder(s);
		std::string out = "";
		for(auto& it:f.result()) {out += it;}
		return "{\"path\":\"" + out + "\"}";
	});

	w.bind("message", [](std::string s) -> std::string {
		string title = webview::json_parse(s, "", 0);
		string msg = webview::json_parse(s, "", 1);
		string msgType = webview::json_parse(s, "", 2);

		pfd::icon _icon = (msgType == "info")
		? pfd::icon::info : (msgType == "warning")
			? pfd::icon::warning : (msgType == "question")
				? pfd::icon::question : pfd::icon::error;

		auto m = pfd::message(title, msg, pfd::choice::ok, _icon);

		// Do something according to the selected button
		switch (m.result()) {
				case pfd::button::yes: return "[\"yes\"]"; break;
				case pfd::button::no: return "[\"no\"]"; break;
				case pfd::button::cancel: return "[\"cancel\"]"; break;
				case pfd::button::ok: return "[\"ok\"]"; break;
				case pfd::button::abort: return "[\"abort\"]"; break;
				case pfd::button::retry: return "[\"retry\"]"; break;
				case pfd::button::ignore: return "[\"ignore\"]"; break;
				default: return "[\"error\"]"; break; // Should not happen
		}
	});

	w.bind("notify", [](std::string s) -> std::string {
		string title = webview::json_parse(s, "", 0);
		string msg = webview::json_parse(s, "", 1);
		string msgType = webview::json_parse(s, "", 2);

		pfd::icon _icon = (msgType == "info")
		? pfd::icon::info : (msgType == "warning")
			? pfd::icon::warning : (msgType == "question")
				? pfd::icon::question : pfd::icon::error;

		auto m = pfd::notify(title, msg, _icon);
		return "[\"done\"]";
	});

	w.init(R""""(
		Wui={ writeFile, writeFileDialog, readFile, readFileDialog, selectFolderDialog, message, notify };
		delete writeFile;
		delete writeFileDialog;
		delete readFile;
		delete readFileDialog;
		delete selectFolderDialog;
		delete message;
		delete notify;

		let maxQueueLength = 0,
			ipcQueue = {}
			websocket = new WebSocket(`ws://${window.location.host}`);

		Wui.sendIpc = (type, msg, cb=null) => {
			let id = null;
			while(true) {
				id = btoa(Math.random().toString()).slice(3);
				if(ipcQueue[id] == undefined) break;
			}
			let rVal = null;
			if( cb != null ) {
				ipcQueue[id] = cb;
			} else {
				rVal = new Promise((res, rej) => {
					ipcQueue[id] = (error, msg) => {
						(error ? rej : res)(msg);
					};
				});
			}
		
			websocket.send(JSON.stringify({
				route: type,
				data: {id, msg}
			}));
		
			return rVal;
		};

		websocket.onmessage = wsMsg => {
			try {
				const {id, msg} = JSON.parse( wsMsg.data );
				ipcQueue[id](false, msg); // error always false as of now
				delete ipcQueue[ id ];
			} catch( e ) {
				console.error( `websocket.onmessage error: ${ e }` );
			}
		};

		websocket.addEventListener("close", (event) => {
			console.log(`WebSocket close: code ${event.code} reason ${event.reason}`);
		});

	)"""");

	w.run();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
	exports.Set("start", Napi::Function::New(env, Start));
  return exports;
}

NODE_API_MODULE(addon_webview, Init)
