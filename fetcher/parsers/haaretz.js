'use strict';

var cheerio = require('cheerio');
var moment = require('moment');

var common = require('./../common');

let domain = 'http://www.haaretz.co.il';

module.exports = (res, cb) => {

	var $ = cheerio.load(res.body);

	let mainHeadlines = $('article.hero').not(premiumArticle).map(parseMain).get();
	let restHeadlines = $('article:not(.hero)').not(premiumArticle).map(parseRest).get();

	cb(null, [].concat(mainHeadlines, restHeadlines).slice(0, 3));

	function parseMain(i, container){

		let mainHeadline = {
			title: $('h1', container).text(),
			url: $('h1', container).parent().attr('href'),
			image: $('picture img', container).attr('srcset'),
			date: $('.t-byline time', container).attr('datetime')
		};

		mainHeadline.url = domain + mainHeadline.url;
		mainHeadline.image = domain + mainHeadline.image;

		mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YYYY HH:mm').format(common.momentInputFormat);

		return mainHeadline;
	}

	function parseRest(i, container){

		let mainHeadline = {
			title: $('.media__content h3', container).text().replace(/[\n\t\r]/g,'').trim(),
			url: $('a.media', container).attr('href'),
			image: $('picture img', container).attr('srcset'),
			date: $('.t-byline time', container).attr('datetime')
		};

		mainHeadline.url = domain + mainHeadline.url;
		mainHeadline.image = domain + mainHeadline.image;

		mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YYYY HH:mm').format(common.momentInputFormat);

		return mainHeadline;
	}

	function premiumArticle(i, elem){
		let keyIcons = $('.t-byline .icn--key', elem).get();

		return keyIcons.length > 0;
	}

};

module.exports.url = domain + '/news';