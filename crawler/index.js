const got = require('got');
const cheerio = require('cheerio');

const requireObj = require('require-dir')();
const { version, homepage } = require('../package.json');

module.exports = crawler;

function crawler(){

	console.log('Crawling.');
	
	// turn files in this directory into promises
	const promises = Object.keys(requireObj)
		// parsing the magazines by key
		.map(key => crawlAndParse(requireObj[key]));

	// finish crawling them
	return Promise.all(promises)
		// then spread all found headlines into a single array
		.then(magazinesArr => [].concat(...magazinesArr));

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

			const description = 'transform' in magazine.description
				? magazine.description.transform($)
				: $(magazine.description.selector).text();

			headline.description = normalize(description);
			return headline;
		}
	}

	function normalize(description){

		if (!description){
			console.log('Description is undefined', description);
			console.log(magazine);
		}

		if (!description.length) return description;

		description = description.trim();

		// ensure a dot at the end of description paragraph
		if (description.charAt(description.length-1) !== '.') description += '.';

		return description;
	}

}

function attachSource(headlines, sourceName){
	return headlines.map(headline => {
		headline.source = sourceName;
		return headline;
	});
}