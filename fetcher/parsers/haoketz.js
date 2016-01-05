'use strict';

var cheerio = require('cheerio');
var moment = require('moment');

var common = require('./../common');

module.exports = (res, cb) => {

	var $ = cheerio.load(res.body);

	let mainHeadlines = $('.page_wrap section.post_main:first-of-type').map(parseMain).get();
	let restHeadlines = $('.page_wrap section.post_main .discover_4_li').map(parseRest).slice(0, 2).get();

	cb(null, [].concat(mainHeadlines, restHeadlines).slice(0, 3));

	function parseMain(i, container){

		let mainHeadline = {
			title: $('h2', container).text(),
			url: $('h2', container).parent().attr('href'),
			//authorName: $('.post_details a[rel="author"]', container).text(),
			//authorUrl: $('.post_details a[rel="author"]', container).attr('href'),
			date: $('.post_details time', container).text()
		};

		mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YY').format(common.momentInputFormat);

		return mainHeadline;
	}

	function parseRest(i, container){

		let mainHeadline = {
			title: $('h3', container).text(),
			url: $('h3', container).parent().attr('href'),
			//authorName: $('.post_details a[rel="author"]', container).text(),
			//authorUrl: $('.post_details a[rel="author"]', container).attr('href'),
			date: $('.post_details time', container).text()
		};

		mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YY').format(common.momentInputFormat);

		return mainHeadline;
	}

};

module.exports.url = 'http://www.haokets.org/';