const _ = require('lodash');
const moment = require('moment');

const domain = 'http://mekomit.co.il';

module.exports = {
	domain,
	source: 'mekomit',
	headlinesUrl: domain,
	parseHeadlines,
	description: { transform: parseDescription }
};

function parseHeadlines($){

	const mainHeadlines = $('.main_promotions li.mainprom').map(parseMain).get();
	const restHeadlines = $('.last_posts li.last_posts_li').map(parseRest).get();

	return [...mainHeadlines, ...restHeadlines];

	function parseMain(i, container){

		const mainHeadline = {
			title: $('h2', container).text(),
			url: $('h2', container).parent().attr('href'),
			image: $('a img', container).attr('src'),
			date: $('.post_details time', container).text()
		};

		mainHeadline.date = moment(mainHeadline.date, 'D.M.YYYY').toDate();

		return mainHeadline;
	}

	function parseRest(i, container){

		const mainHeadline = {
			title: $('h3', container).text(),
			url: $('h3', container).parent().attr('href'),
			image: $('a img', container).attr('src'),
			date: $('.post_details time', container).text()
		};

		mainHeadline.date = moment(mainHeadline.date, 'D.M.YYYY').toDate();

		return mainHeadline;
	}

}

function parseDescription($){
	const elem = $('article h2, article .post > p:first-of-type');
	return _.get(elem.get(), '[0].children[0].data');
}