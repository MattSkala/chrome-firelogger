function toConsole(msg) {
	chrome.extension.sendRequest({
		command: "toConsole",
		tabId: chrome.experimental.devtools.tabId,
		args: msg
		//args: escape(JSON.stringify(Array.prototype.slice.call(arguments, 0)))
	});
}

ChromeLogger = {
	handleFirePhpHeaders: function(har_entry) {
		var pattern = /x-wf/i;
	},
	handleFireLoggerHeaders: function(har_entry) {
		var response_headers = har_entry.response.headers;

		var buffers = {};
		var profiles = {};
		var pattern = /^firelogger-([0-9a-f]+)-(\d+)/i;
		var parseHeader = function(name, value) {
			var res = pattern.exec(name);
			if (!res) return;
			buffers[res[1]] = buffers[res[1]] || [];
			buffers[res[1]][res[2]] = value;
		}
		for (var key in response_headers) {
			parseHeader(response_headers[key].name, response_headers[key].value);
		}
		var packets = [];
		for (var bufferId in buffers) {
			if (!buffers.hasOwnProperty(bufferId)) continue;
			var buffer = buffers[bufferId].join('');
			buffer = Base64.decode(buffer);
			buffer = Utf8.decode(buffer);
			var packet = JSON.parse(buffer);
			packets.push(packet);
		}
		var logs = [];
		for (var packet in packets) {
			var packet = packets[packet];
			for (i=0; i < packet.logs.length; i++) {
				var log = packet.logs[i];
				logs.push(log);
			}
		}
		var final = [];
		for (var log in logs) {
			//final.push(JSON.stringify(logs[log].args));
			//toConsole(JSON.stringify(logs[log]));
			
			if (logs[log].template) { // primitive data types, Exception
				toConsole(JSON.stringify(logs[log].template));
			} else if (logs[log].exc_frames[0][0] != undefined) { // objects, (arrays)
				var data = {};
				data['object'] = logs[log].exc_frames[0][0];				
				toConsole(JSON.stringify(data['object']));
				//data['trace'] = logs[log].exc_info[2];
				//data['level'] = logs[log].level;
				//data['time'] = logs[log].time;
				//toConsole(JSON.stringify(data));				
			} else { // null
				toConsole(null);
			}
			
		}
	},
};

chrome.experimental.devtools.resources.getHAR(function(result) {
	var entries = result.entries;
	chrome.experimental.devtools.resources.onFinished.addListener(
		ChromeLogger.handleFireLoggerHeaders.bind(ChromeLogger)
	);
});

//prepare requestHeaders
var requestHeaders = {"X-FireLogger": "1.1"};
if (localStorage['password']) {
	var password = localStorage.getItem('password');
	var auth = "#FireLoggerPassword#" + password + "#";
	requestHeaders["X-FireLoggerAuth"] = MD5(auth);
	//requestHeaders["X-FireLoggerProfiler"] = 1;
	//requestHeaders["X-FireLoggerAppstats"] = 1;
}
if (localStorage['remote']) {
	requestHeaders["X-FirePHP-Version"] = "0.0.6";
}
//add requestHeaders
chrome.experimental.devtools.resources.addRequestHeaders(requestHeaders);

//add panel into devtools
//chrome.experimental.devtools.panels.create("HeaderHelper", "icon32.png", "panel.html");