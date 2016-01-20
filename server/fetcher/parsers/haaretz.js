'use strict';

var _ = require('lodash');
var cheerio = require('cheerio');
var moment = require('moment');

var common = require('../../../common');

let domain = 'http://www.haaretz.co.il';

module.exports = res => {

	var $ = cheerio.load(res.body);

	return new Promise((resolve, reject) => {

		let mainHeadlines = $('article.hero').not(premiumArticle).map(parseMain).get();
		let restHeadlines = $('article:not(.hero)').not(premiumArticle).not(specialArticles).map(parseRest).get();

		let allHeadlines = [].concat(mainHeadlines, restHeadlines)
			.slice(0, common.itemsPerMagazine)
			.map(headline => {
				headline.source = 'הארץ';

				return headline;
			});

		resolve(allHeadlines);

		function parseMain(i, container){

			let mainHeadline = {
				title: $('h1', container).text(),
				url: $('h1', container).parent().attr('href'),
				image: $('picture img', container).attr('srcset'),
				date: $('.t-byline time', container).attr('datetime')
			};

			mainHeadline.url = domain + mainHeadline.url;
			mainHeadline.image = domain + mainHeadline.image;

			mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YYYY HH:mm').toDate();

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

			mainHeadline.date = moment(mainHeadline.date, 'DD.MM.YYYY HH:mm').toDate();

			return mainHeadline;
		}

		function premiumArticle(i, elem){
			let keyIcons = $('.t-byline .icn--key', elem).get();

			return keyIcons.length > 0;
		}

		function specialArticles(i, elem){
			return $(elem).attr('data-back') === 'teaser';
		}

	});

};

module.exports.headlinesSourceUrl = domain + '/news';
module.exports.description = {
	selector: 'article header > p, article .article__entry > p',
	transform: query => {

		var elements = query.get();

		let found;
		for (var i = 0, len = elements.length; i < len; i++){
			let data = _.get(elements[i], 'children[0].data');

			if (data){
				found = data;

				break;
			}
		}

		return found;
	}
};