const got = require('got');
const cheerio = require('cheerio');

const requireObj = require('require-dir')();
const { version, homepage } = require('../package.json');

module.exports = crawler;

function crawler(){
	const promises = Object.keys(requireObj).map(key => crawlAndParse(requireObj[key]));
	return Promise.all(promises).then(magazinesArr => [].concat(...magazinesArr));
}

function crawlAndParse(magazine){

	const gotOptions = { headers: { 'user-agent': `SmolanimBot/${version} (+${homepage})` } };

	return new Promise(resolve => {

		got(magazine.headlinesUrl, gotOptions)
			.then(res => magazine.parseHeadlines(cheerio.load(res.body)))
			.then(headlines => attachSource(headlines, magazine.source))
			.then(headlines => Promise.all(headlines.map(populateDescription)))
			.then(resolve)
			.catch(err => {
				console.log(err.message);
				console.error(err.stack);
				resolve([]);
			});

	});

	function populateDescription(headline){

		if (!'description' in magazine) return headline;

		if ('description' in headline){
			headline.description = normalize(headline.description);
			return headline;
		};

		return got(headline.url, gotOptions).then(attachDescription);

		function attachDescription(res){
			const $ = cheerio.load(res.body);

			const description = 'transform' in magazine.description ?
				magazine.description.transform($) :
				$(magazine.description.selector).text();

			headline.description = normalize(description);
			return headline;
		}
	}

}

function normalize(description){
	if (description.length === 0) return description;

	description = description.trim();

	// ensure a dot at the end of description paragraph
	if (description.charAt(description.length-1) !== '.') description += '.';

	return description;
}

function attachSource(headlines, sourceName){
	return headlines.map(headline => {
		headline.source = sourceName;
		return headline;
	});
}