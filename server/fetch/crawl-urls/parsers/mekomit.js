'use strict';

var _ = require('lodash');
var cheerio = require('cheerio');
var moment = require('moment');

var common = require('../../../../common');

module.exports = res => {

	var $ = cheerio.load(res.body);

	return new Promise((resolve, reject) => {

		let mainHeadlines = $('.main_promotions li.mainprom').map(parseMain).get();
		let restHeadlines = $('.last_posts li.last_posts_li').map(parseRest).get();

		let allHeadlines = [].concat(mainHeadlines, restHeadlines)
			.slice(0, common.itemsPerMagazine)
			.map(headline => {
				headline.source = 'שיחה מקומית';

				return headline;
			});

		resolve(allHeadlines);

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

	});

};

module.exports.headlinesSourceUrl = 'http://mekomit.co.il/';
module.exports.description = {
	selector: 'article h2, article .post > p:first-of-type',
	transform: elem => {
		return _.get(elem.get(), '[0].children[0].data');
	}
};