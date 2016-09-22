const { version, homepage } = require('../package.json');

const got = require('got');
const cheerio = require('cheerio');

const requireObj = require('require-dir')();

const gotOptions = { headers: { 'user-agent': `SmolanimBot/${version} (+${homepage})` } };

module.exports = crawler;

function crawler(){

	const magazines = Object.keys(requireObj).map(key => requireObj[key]);

	return Promise.all(magazines.map(magazine => crawlAndParse(magazine)))
		.then(toArrayOfHeadlines)
}

function crawlAndParse(magazine){

	return got(magazine.headlinesUrl, gotOptions)
		.then(res => magazine.parseHeadlines(cheerio.load(res.body)))
		.then(headlines => attachSource(headlines, magazine.source))
		.then(headlines => Promise.all(headlines.map(populateDescription)));

	function populateDescription(headline){
		if (headline.description){
			headline.description = normalize(headline.description);
			return headline;
		};

		return got(headline.url, gotOptions)
			.then(res => {
				const $ = cheerio.load(res.body);
				if ('transform' in magazine.description) return magazine.description.transform($);
				return $(magazine.description.selector).text();
			})
			.then(description => {
				headline.description = normalize(description);
				return headline;
			});
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
}

function toArrayOfHeadlines(magazines){
	const crawledHeadlines = [];
	magazines.forEach(headlinesArr => crawledHeadlines.push(...headlinesArr));
	return crawledHeadlines;
}