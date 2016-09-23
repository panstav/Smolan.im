const _ = require('lodash');
const moment = require('moment');

const domain = 'http://presspectiva.org.il/';

module.exports = {
	domain,
	source: 'presspectiva',
	headlinesUrl: domain,
	parseHeadlines
};

function parseHeadlines($){

	const mainHeadlines = $('.fox_siteDateBox .fox_all_box')
		.map(parseHeadlines)
		.get();

	return mainHeadlines;

	function parseHeadlines(i, container){

		const mainHeadline = {
			title: $('h3', container).text(),
			description: $('.fox_all_in_excerpt p', container).text(),
			url: $('a', container).attr('href'),
			image: $('.fox_all_img', container).attr('style').match(/https?:\/\/.+\.png/),
			date: $('.fox_all_in_date', container).text()
		};

		mainHeadline.date = moment(mainHeadline.date, 'DD/MM/YY').toDate();
		mainHeadline.image = _.get(mainHeadline.image, '[0]') || '';

		return mainHeadline;
	}

}