const _ = require('lodash');
const moment = require('moment');

const domain = 'http://tv.social.org.il';

module.exports = {
	domain,
	source: 'hevratit',
	headlinesUrl: domain + '/produced_by/stv',
	parseHeadlines,
	description: { transform: parseDescription }
};

function parseHeadlines($){

	const mainHeadlines = $('#content article').map(parseHeadlines).get();

	return mainHeadlines;

	function parseHeadlines(i, container){

		const mainHeadline = {
			title: $('h2 a', container).text().replace(/[\n\t\r]/g,''),
			url: $('h2 a', container).attr('href'),
			image: $('img.wp-post-image', container).attr('src'),
			date: $('span.tax_date', container).text().substr(12)
		};

		mainHeadline.date = moment(mainHeadline.date, 'DD/MM/YYYY').toDate();

		return mainHeadline;
	}

}

function parseDescription($){

	const elem = $('#content .post .entry.dotted-bottom');

	const children = _.get(elem, '[0].children');

	// get text nodes
	const textChildren = children.filter(node => node.type === 'text');

	// try each
	var desc = textChildren.filter(child => {
		let text = child.data;
		return (text && !!text.trim());
	}).map(text => text.data);

	// pick the first, or move to the next strategy
	if (desc.length) return desc[0];

	// get text of first paragraph
	const paragraphs = children.filter(node => node.name === 'p');
	desc = _.get(paragraphs, '[0].children[0].data');

	if (desc) return desc;

	desc = $('.hasCaption [dir="rtl"]', children).text();

	if (desc) return desc;

	return '';
}