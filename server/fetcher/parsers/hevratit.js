'use strict';

var _ = require('lodash');
var cheerio = require('cheerio');
var moment = require('moment');

var common = require('../../../common');

module.exports = res => {

	var $ = cheerio.load(res.body);

	return new Promise((resolve, reject) => {

		let mainHeadlines = $('#content article').slice(0, common.itemsPerMagazine).map(parseHeadlines).get();

		resolve(mainHeadlines.map(headline => {
			headline.source = 'הטלויזיה החברתית';

			return headline;
		}));

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

	});

};

module.exports.headlinesSourceUrl = 'http://tv.social.org.il/produced_by/stv';
module.exports.description = {
	selector: '#content .post .entry.dotted-bottom',
	transform: elem => {

		let children = _.get(elem.get(), '[0].children');
		let textChildren = children.filter(node => node.type === 'text');

		let desc = _.get(textChildren, '[1].data');

		if (desc.trim()) return desc.trim();

		let paragraphs = children.filter(node => node.name === 'p');
		return _.get(paragraphs, '[0].children[0].data').trim();
	}
};