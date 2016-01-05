'use strict';

var cheerio = require('cheerio');
var moment = require('moment');

var common = require('./../common');

module.exports = (res, cb) => {

	var $ = cheerio.load(res.body);

	let mainHeadlines = $('#hamakom-content .view-content .views-row').slice(0, 3).map(parseHeadlines).get();

	cb(null, mainHeadlines);

	function parseHeadlines(i, container){

		let mainHeadline = {
			title: $('h2.post-title', container).text(),
			url: $('h2.post-title a', container).attr('href'),
			//authorName: $('span.post-author a', container).text(),
			//authorUrl: $('span.post-author a', container).attr('href'),
			date: $('span.post-date', container).text()
		};

		mainHeadline.url = 'http://www.ha-makom.co.il' + mainHeadline.url;
		mainHeadline.authorUrl = 'http://www.ha-makom.co.il' + mainHeadline.url;

		return mainHeadline;
	}

};

module.exports.url = 'http://www.ha-makom.co.il/articles';