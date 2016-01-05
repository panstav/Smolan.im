'use strict';

var cheerio = require('cheerio');
var moment = require('moment');

var common = require('./../common');

let domain = 'http://www.ha-makom.co.il';

module.exports = (res, cb) => {

	var $ = cheerio.load(res.body);

	let mainHeadlines = $('#hamakom-content .view-content .views-row').slice(0, 3).map(parseHeadlines).get();

	cb(null, mainHeadlines);

	function parseHeadlines(i, container){

		let mainHeadline = {
			title: $('h2.post-title', container).text(),
			url: $('h2.post-title a', container).attr('href'),
			image: $('a img', container).attr('src'),
			date: $('span.post-date', container).text()
		};

		mainHeadline.url = domain + mainHeadline.url;
		mainHeadline.authorUrl = domain + mainHeadline.url;

		return mainHeadline;
	}

};

module.exports.url = domain + '/articles';