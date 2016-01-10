'use strict';

var cheerio = require('cheerio');
var moment = require('moment');

var common = require('../../../common');

module.exports = (res, cb) => {

	var $ = cheerio.load(res.body);

	let mainHeadlines = $('.main_promotions li.mainprom').map(parseMain).get();
	let restHeadlines = $('.last_posts li.last_posts_li').map(parseRest).get();

	cb(null, [].concat(mainHeadlines, restHeadlines).slice(0, common.itemsPerMagazine));

	function parseMain(i, container){

		let mainHeadline = {
			title: $('h2', container).text(),
			url: $('h2', container).parent().attr('href'),
			image: $('a img', container).attr('src'),
			date: $('.post_details time', container).text()
		};

		mainHeadline.date = moment(mainHeadline.date, 'D.M.YYYY').toDate();

		return mainHeadline;
	}

	function parseRest(i, container){

		let mainHeadline = {
			title: $('h3', container).text(),
			url: $('h3', container).parent().attr('href'),
			image: $('a img', container).attr('src'),
			date: $('.post_details time', container).text()
		};

		mainHeadline.date = moment(mainHeadline.date, 'D.M.YYYY').toDate();

		return mainHeadline;
	}

};

module.exports.url = 'http://mekomit.co.il/';