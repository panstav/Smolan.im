'use strict';

var cheerio = require('cheerio');
var moment = require('moment');

module.exports = (res, cb) => {

	var $ = cheerio.load(res.body);

	let mainHeadlines = $('#content article').slice(0, 3).map(parseHeadlines).get();

	cb(null, mainHeadlines);

	function parseHeadlines(i, container){

		let mainHeadline = {
			title: $('h2 a', container).text().replace(/[\n\t\r]/g,''),
			url: $('h2 a', container).attr('href'),
			image: $('img.wp-post-image', container).attr('src'),
			date: $('span.tax_date', container).text().substr(12)
		};

		mainHeadline.date = moment(mainHeadline.date, 'DD/MM/YYYY').toDate();

		return mainHeadline;
	}

};

module.exports.url = 'http://tv.social.org.il/produced_by/stv';