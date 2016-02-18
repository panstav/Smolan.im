const got = require('got');
const cheerio = require('cheerio');

const log = require('../../log');

// turn js files in parsers/ to method of this object
const requireDir = require('require-dir');
const parsers = requireDir('./parsers');

const gotOptions = { headers: { 'user-agent': `SmonalimBot/0.0 (+http://smolan.im)` } };

module.exports = () => {

	// return an array of async request tasks, for every parser file
	return Object.keys(parsers).map(name => asyncRequest(name));

};

function asyncRequest(name){

	const parser = parsers[name];

	return done => {

		got(parser.headlinesSourceUrl, gotOptions)
			.catch(logAndContinue)
			.then(parser)
			.then(parseIntoEach)
			.then(headlines => done(null, headlines))
			.catch(logAndContinue);

		function logAndContinue(err){
			log.error(err, 'Got error');

			done();
		}

	};

	function parseIntoEach(headlines){

		return Promise.all(headlines.map(populateDescription));

		function populateDescription(headline){

			return new Promise((resolve, reject) => {

				if (headline.description) return resolve(headline);

				got(headline.url, gotOptions)
					.then(fixDescription)
					.then(fixedDesc => { headline.description = fixedDesc; return resolve(headline); })
					.catch(reject);

			});
		}

	}

	function fixDescription(res){

		const $ = cheerio.load(res.body);
		var desc;

		if (parser.description.transform){
			desc = parser.description.transform($(parser.description.selector));

		} else {
			desc = $(parser.description.selector).text();
		}

		if (desc){
			desc = desc.trim();

			// ensure a dot at the end of descrpition paragraph
			if (desc.charAt(desc.length-1) !== '.') desc += '.';

		} else {
			desc = '';
		}

		return Promise.resolve(desc);
	}

}