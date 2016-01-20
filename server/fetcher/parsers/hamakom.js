'use strict';

var cheerio = require('cheerio');

var moment = require('moment');
moment.locale('he');

var common = require('../../../common');

let domain = 'http://www.ha-makom.co.il';

module.exports = res => {

	var $ = cheerio.load(res.body);

	return new Promise((resolve, reject) => {

		let mainHeadlines = $('#hamakom-content .view-content .views-row').slice(0, common.itemsPerMagazine).map(parseHeadlines).get();

		resolve(mainHeadlines.map(headline => {
			headline.source = 'המקום הכי חם בגיהנום';

			return headline;
		}));

		function parseHeadlines(i, container){

			let mainHeadline = {
				title: $('h2.post-title', container).text(),
				url: $('h2.post-title a', container).attr('href'),
				image: $('a img', container).attr('src'),
				date: $('span.post-date', container).text()
			};

			mainHeadline.url = domain + mainHeadline.url;
			mainHeadline.authorUrl = domain + mainHeadline.url;

			mainHeadline.date = moment(mainHeadline.date.replace('\'', '׳'), 'DD MMM, YYYY').toDate();

			return mainHeadline;
		}

	});

};

module.exports.headlinesSourceUrl = domain + '/articles';
module.exports.description = { selector: 'article .field-name-field-sub-title .field-item' };