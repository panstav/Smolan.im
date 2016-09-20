const moment = require('moment');

const domain = 'http://www.ha-makom.co.il';

module.exports = {
	domain,
	source: 'hamakom',
	headlinesUrl: domain + '/articles',
	parseHeadlines,
	description: { selector: 'article .field-name-field-sub-title .field-item' }
};

function parseHeadlines($){

	const mainHeadlines = $('#hamakom-content .view-content .views-row')
		.map(parseHeadlines)
		.get();

	return mainHeadlines;

	function parseHeadlines(i, container){

		const mainHeadline = {
			title: $('h2.post-title', container).text(),
			url: $('h2.post-title a', container).attr('href'),
			image: $('a img', container).attr('src'),
			date: $('span.post-date', container).text()
		};

		mainHeadline.url = domain + mainHeadline.url;

		mainHeadline.date = moment(mainHeadline.date.replace('\'', '׳'), 'DD MMM, YYYY').toDate();

		return mainHeadline;
	}

}