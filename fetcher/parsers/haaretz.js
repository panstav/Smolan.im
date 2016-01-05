'use strict';

var cheerio = require('cheerio');
var moment = require('moment');

var common = require('./../common');

module.exports = (res, cb) => {

	var $ = cheerio.load(res.body);

	let mainHeadlines = $('article.hero').not(premiumArticle).map(parseMain).get();
	let restHeadlines = $('article:not(.hero)').not(premiumArticle).map(parseRest).get();

	cb(null, [].concat(mainHeadlines, restHeadlines).slice(0, 3));

	function parseMain(i, container){

		let mainHeadline = {
			title: $('h1', container).text(),
			url: $('h1', container).parent().attr('href'),
			//authorName: $('.post_details a[rel="author"]', container).text(),
			//authorUrl: $('.post_details a[rel="author"]', container).attr('href'),
			date: $('.t-byline time', container).attr('datetime')
		};

		mainHeadline.url = 'http://www.haaretz.co.il' + mainHeadline.url;
		mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YYYY HH:mm').format(common.momentInputFormat);

		return mainHeadline;
	}

	function parseRest(i, container){

		let mainHeadline = {
			title: $('.media__content h3', container).text().replace(/[\n\t\r]/g,'').trim(),
			url: $('a.media', container).attr('href'),
			//authorName: $('.post_details a[rel="author"]', container).text(),
			//authorUrl: $('.post_details a[rel="author"]', container).attr('href'),
			date: $('.t-byline time', container).attr('datetime')
		};

		mainHeadline.url = 'http://www.haaretz.co.il' + mainHeadline.url;
		mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YYYY HH:mm').format(common.momentInputFormat);

		return mainHeadline;
	}

	function premiumArticle(i, elem){
		return !$('.t-byline .icn--key', elem).get();
	}

};

module.exports.url = 'http://www.haaretz.co.il/news';