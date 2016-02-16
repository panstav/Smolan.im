'use strict';

var _ = require('lodash');
var cheerio = require('cheerio');
var moment = require('moment');

var common = require('../../../../common');

module.exports = res => {

	var $ = cheerio.load(res.body);

	return new Promise((resolve, reject) => {

		let mainHeadlines = $('.fox_siteDateBox .fox_all_box').slice(0, common.itemsPerMagazine).map(parseHeadlines).get();

		resolve(mainHeadlines.map(headline => {
			headline.source = 'פרספקטיבה';

			return headline;
		}));

		function parseHeadlines(i, container){

			let mainHeadline = {
				title: $('h3', container).text(),
				description: $('.fox_all_in_excerpt p', container).text(),
				url: $('a', container).attr('href'),
				image: $('.fox_all_img', container).attr('style').match(/https?:\/\/.+\.png/)[0],
				date: $('.fox_all_in_date', container).text()
			};

			mainHeadline.date = moment(mainHeadline.date, 'DD/MM/YY').toDate();

			return mainHeadline;
		}

	});

};

module.exports.headlinesSourceUrl = 'http://presspectiva.org.il/';