'use strict';

var cheerio = require('cheerio');
var moment = require('moment');

var common = require('./../common');

module.exports = (res, cb) => {

	var $ = cheerio.load(res.body);

	let mainHeadlines = $('.main_promotions li.mainprom').map(parseMain).get();

	cb(null, mainHeadlines);

	function parseMain(i, container){

		let mainHeadline = {
			title: $('h2', container).text(),
			url: $('h2', container).parent().attr('href'),
			//authorName: $('.post_details a[rel="author"]', container).text(),
			//authorUrl: $('.post_details a[rel="author"]', container).attr('href'),
			date: $('.post_details time', container).text()
		};

		mainHeadline.date = moment(mainHeadline.date, 'D.M.YYYY').format(common.momentFormat);

		return mainHeadline;
	}

};

module.exports.url = 'http://mekomit.co.il/';