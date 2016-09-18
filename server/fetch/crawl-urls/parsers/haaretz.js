'use strict';

var _ = require('lodash');
var cheerio = require('cheerio');
var moment = require('moment');

var common = require('../../../../common');

let domain = 'http://www.haaretz.co.il';

module.exports.parser = parser;
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

function parser(res){

	var $ = cheerio.load(res.body);

	return new Promise((resolve, reject) =>{

		let mainHeadlines = $('article.hero').not(premiumArticle).not(videoArticles).map(parseMain).get();
		let restHeadlines = $('article:not(.hero)').not(premiumArticle).not(videoArticles).not(specialArticles).map(parseRest).get();

		let allHeadlines = [].concat(mainHeadlines, restHeadlines)
			.slice(0, common.itemsPerMagazine)
			.map(headline =>{
				headline.source = 'הארץ';

				return headline;
			});

		resolve(allHeadlines);





	});

}