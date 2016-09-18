const _ = require('lodash');
const moment = require('moment');

const domain = 'http://www.haaretz.co.il';

module.exports = {
	domain,
	source: 'haaretz',
	headlinesUrl: domain + '/news',
	parseHeadlines,
	description: { transform: parseDescription }
};

function parseHeadlines($){

	const mainHeadlines = $('article.hero')
		.not(premiumArticle)
		.not(videoArticles)
		.map(parseMain)
		.get();

	const restHeadlines = $('article:not(.hero)')
		.not(premiumArticle)
		.not(videoArticles)
		.not(specialArticles)
		.map(parseRest)
		.get();

	return [...mainHeadlines, ...restHeadlines];

	function parseMain(i, container){

		const mainHeadline = {
			title: $('h1', container).text(),
			url: $('h1', container).parent().attr('href'),
			image: $('picture img', container).attr('src'),
			date: $('.t-byline time', container).attr('datetime')
		};

		mainHeadline.url = domain + mainHeadline.url;
		mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YYYY HH:mm').toDate();

		return mainHeadline;
	}

	function parseRest(i, container){

		const mainHeadline = {
			title: $('.media__content h3', container).text().replace(/[\n\t\r]/g, '').trim(),
			url: $('a.media', container).attr('href'),
			image: $('picture img', container).attr('src'),
			date: $('.t-byline time', container).attr('datetime')
		};

		mainHeadline.url = domain + mainHeadline.url;
		mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YYYY HH:mm').toDate();

		return mainHeadline;
	}

	function premiumArticle(i, elem){
		const keyIcons = $('.t-byline .icn--key', elem).get();
		return keyIcons.length > 0;
	}

	function videoArticles(i, elem){
		const videoElem = $('video', elem).get();
		return !!videoElem.length;
	}

	function specialArticles(i, elem){
		return $(elem).attr('data-back') === 'teaser';
	}

}

function parseDescription($){

	const elements = $('article header > p, article .article__entry > p').get();

	var desc = '';
	elements.some(elem => {
		desc = _.get(elem, 'children[0].data');
		return !!desc;
	});

	return desc || '';
}