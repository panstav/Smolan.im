'use strict';

var cheerio = require('cheerio');
var moment = require('moment');

var common = require('../../../../common');

var domain = 'http://socialism.org.il';
var mainPath = 'http://socialism.org.il/maavak';

module.exports = res => {

	var $ = cheerio.load(res.body);

	return new Promise((resolve, reject) => {

		let mainHeadlines = $('#tdOverallLeft > div:nth-of-type(2) > div > div:first-of-type > div > div').map(parseMain).get();
		let restHeadlines = $('#tdOverallLeft > div:nth-of-type(2) > div > div:nth-of-type(n+2):not(:last-of-type)').map(parseRest).get();

		let allHeadlines = [].concat(mainHeadlines, restHeadlines)
			.slice(0, common.itemsPerMagazine)
			.map(headline => {
				headline.source = 'מאבק סוציאליסטי';

				return headline;
			});

		resolve(allHeadlines);

		function parseMain(i, container){

			let mainHeadline = {
				title: $('a div div:first-of-type', container).text(),
				url: $('a', container).attr('href'),
				image: $('a img', container).attr('src'),
				date: $('a > div > div:last-of-type', container).text()
			};

			mainHeadline.url = mainPath + '/' + mainHeadline.url;
			mainHeadline.image = domain + mainHeadline.image;

			mainHeadline.date = moment(mainHeadline.date.substr(mainHeadline.date.indexOf('|') + 2), 'DD.MM.YYYY').toDate();

			return mainHeadline;
		}

		function parseRest(i, container){

			let mainHeadline = {
				title: $('a span:nth-of-type(2)', container).text(),
				url: $('a', container).attr('href'),
				image: $('a img', container).attr('src'),
				date: $('a > div > div:last-of-type', container).text()
			};

			mainHeadline.url = mainPath + '/' + mainHeadline.url;
			mainHeadline.image = domain + mainHeadline.image;

			mainHeadline.date = moment(mainHeadline.date.substr(mainHeadline.date.indexOf('|') + 2), 'DD.MM.YYYY').toDate();

			return mainHeadline;
		}

	});

};

module.exports.headlinesSourceUrl = mainPath;
module.exports.description = { selector: '#tdArticleColumn .article_header' };