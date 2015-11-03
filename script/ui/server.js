/*global require, global, module*/

var ajax = require('../util/ajax.js');
var ui = global.ui;

// stealed from https://github.com/iambumblehead/form-urlencoded/
function formEncodeString(str) {
	return str.replace(/[^ !'()~\*]*/g, encodeURIComponent)
	.replace(/ /g, '+')
	.replace(/[!'()~\*]/g, function (ch) {
		return '%' + ('0' + ch.charCodeAt(0).toString(16))
		.slice(-2).toUpperCase();
	});
}

function formEncode(obj) {
	var str = [];
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {// don't handle nested objects
			str.push(encodeURIComponent(prop) + '=' +
			formEncodeString(obj[prop]));
		}
	}
	return str.join('&');
}

function apiHandle(xhr) {
	var data = xhr.responseText;
	var value = data.substring(data.indexOf('\n') + 1);

	if (data.startsWith('Ok.')) {
		return value;
	}
	throw Error('Unknown server error: ' + data);
}

function apiRequest(method, url) {
	function options(data, params, sync) {
		return {
			method: method,
			url: ui.api_path + url,
			sync: sync,
			params: params,
			data: data && formEncode(data),
			headers: data && {
				'Content-Type': 'application/x-www-form-urlencoded'
				}
		};
	}

	var res = function (data, params) {
		return ajax(options(data, params)).then(apiHandle);
	};
	res.sync = function (data, params) {
		// TODO: handle errors
		return apiHandle(ajax(options(data, params, true)));
	};
	// TODO: provide res.url
	// res.url = url;
	return res;
}

module.exports = {
	inchi: apiRequest('POST', 'getinchi'),
	molfile: apiRequest('POST', 'getmolfile'),
	aromatize: apiRequest('POST', 'aromatize'),
	dearomatize: apiRequest('POST', 'dearomatize'),
	calculateCip: apiRequest('POST', 'calculate_cip'),
	automap: apiRequest('POST', 'automap'),
	layout_smiles: apiRequest('GET', 'layout'),
	layout: apiRequest('POST', 'layout'),
	smiles: apiRequest('POST', 'smiles'),
	save: apiRequest('POST', 'save'),
	knocknock: function () {
		return ajax(ui.api_path + 'knocknock').then(function (xhr) {
			if (xhr.responseText !== 'You are welcome!') {
				throw Error('Server is not compatible');
			}
		});
	}
};
