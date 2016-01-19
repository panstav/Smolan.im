'use strict';

var cheerio = require('cheerio');
var moment = require('moment');

var common = require('../../../common');

module.exports = res => {

	var $ = cheerio.load(res.body);

	return new Promise((resolve, reject) => {

		let mainHeadlines = $('.page_wrap section.post_main:first-of-type').map(parseMain).get();
		let restHeadlines = $('.page_wrap section.post_main .discover_4_li').map(parseRest).get();

		resolve([].concat(mainHeadlines, restHeadlines).slice(0, common.itemsPerMagazine));

		function parseMain(i, container){

			let mainHeadline = {
				title: $('h2', container).text(),
				image: $('a img', container).attr('src'),
				url: $('h2', container).parent().attr('href'),
				date: $('.post_details time', container).text()
			};

			mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YY').toDate();

			return mainHeadline;
		}

		function parseRest(i, container){

			let mainHeadline = {
				title: $('h3', container).text(),
				image: $('a img', container).attr('src'),
				url: $('h3', container).parent().attr('href'),
				date: $('.post_details time', container).text()
			};

			mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YY').toDate();

			return mainHeadline;
		}

	});
};

module.exports.headlinesSourceUrl = 'http://www.haokets.org/';
module.exports.description = { selector: 'article .expert' };