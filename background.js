chrome.extension.onRequest.addListener(function(request) {
	if (request.command !== 'toConsole')
		return;
	chrome.tabs.executeScript(request.tabId, {		
		code: "console.log(" + request.args + ");",
		//log,debug,info,warn,error,group,groupCollapsed,groupEnd
	});
});

/*
var buffers = {};
var profiles = {};
var pattern = /^firelogger-([0-9a-f]+)-(\d+)/i;
var parseHeader = function(name, value) {
	var res = pattern.exec(name);
	if (!res) return;
	buffers[res[1]] = buffers[res[1]] || [];
	buffers[res[1]][res[2]] = value;
}
for (var key in localStorage) {
	parseHeader(key, localStorage[key]);
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
	console.info(JSON.stringify(logs[log].args));
}

X-FireLogger	1.1
X-FireLoggerProfiler	1
X-FireLoggerAppstats	1
x-insight	activate
*/

/*
chrome.experimental.devtools.panels.create("FireLogger", "firelogger-64.png", "Panel.html");

chrome.experimental.devtools.panels.elements.createSidebarPane("Font Properties",
    function(sidebar) {
      sidebar.setPage("Sidebar.html");
      sidebar.setHeight("8ex");
    });
*/