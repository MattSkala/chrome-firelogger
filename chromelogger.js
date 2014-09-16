var ChromeLogger = function () {};


/**
 * Initializes the listeners.
 */
ChromeLogger.prototype.init = function () {
	this.initRequestInterceptor();
	this.initResponseHandler();
};


/**
 * Appends X-FireLogger header to all requests.
 */
ChromeLogger.prototype.initRequestInterceptor = function () {
	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
		details.requestHeaders.push({
			name: 'X-FireLogger',
			value: '1.3'
		});
		return {
			requestHeaders: details.requestHeaders
		};
	}, { urls: ["<all_urls>"] }, ["blocking", "requestHeaders"]);
};


/**
 * Checks all responses for firelogger headers.
 */
ChromeLogger.prototype.initResponseHandler = function () {
	var that = this;
	chrome.webRequest.onHeadersReceived.addListener(function (details) {
		var logs = that.getLogsFromHeaders(details.responseHeaders);
		that.processLogs(logs, details.tabId);
	}, { urls: ["<all_urls>"] }, ["responseHeaders"]);
};


/**
 * Parses firelogger headers into logs array.
 */
ChromeLogger.prototype.getLogsFromHeaders = function (response_headers) {
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
		for (i = 0; i < packet.logs.length; i++) {
			var log = packet.logs[i];
			logs.push(log);
		}
	}
	return logs;
};


/**
 * Parses firelogger objects and logs them into Chrome console.
 */
ChromeLogger.prototype.processLogs = function (logs, tabId) {
	for (var i in logs) {
		this.processLog(logs[i], tabId);
	}
};


/**
 * Parses a log object and logs it into Chrome console.
 */
ChromeLogger.prototype.processLog = function (log, tabId) {
	console.log(log);

	// Uncomment for logging filename and line number
	// this.log(tabId, ['"%c' + log.pathname + ':' + log.lineno + '"', '"color:#999"']);

	if (log.template) { // primitive data types, Exception
		this.log(tabId, JSON.stringify(log.template));
	} else if (log.args[0] !== undefined) { // objects, arrays
		this.log(tabId, JSON.stringify(log.args[0]));
	} else { // null
		this.log(tabId, null);
	}
};


/**
 * Logs a message into the target tab.
 */
ChromeLogger.prototype.log = function (tabId, args) {
	chrome.tabs.executeScript(tabId, {
		code: 'console.log(' +  args + ')'
	});
};
