const assert = require('power-assert');
const is = require('is_js');

const requireDir = require('require-dir');

const crawl = require('../crawler');

describe('Crawler', () => {

	const sources = [];
	var headlines;

	it('Should be a Promise', () => {

		assert(is.function(crawl));

		const promise = crawl();
		assert('then' in promise);

		return promise
			.then(result => {
				assert(is.array(result));
				assert(is.not.empty(result));
				headlines = result;
			})
			.catch(err => {
				console.error(err.message);
				console.error(err.stack);
			});

	});

	it('Should expose crawler source names', () => {

		const crawlers = requireDir('../crawler');
		for (let crawlerName in crawlers){ if (crawlerName !== 'index'){
			sources.push(crawlers[crawlerName].source);
		}}

		assert(sources.length > 0);

	});

	it('Should result in Headlines from each of those sources', () => {

		sources.forEach(source => {
			assert(headlines.some(headline => source === headline.source));
		});

	});

	it('Should result in an array of Headlines', () => {

		headlines.forEach(headline => {

			assert(is.string(headline.title));
			assert(is.not.empty(headline.title));

			assert(is.string(headline.url));
			assert(is.not.empty(headline.url));
			assert(is.url(headline.url));

			assert(is.string(headline.image));
			assert(is.not.empty(headline.image));

			assert(is.date(headline.date));

			if ('authorUrl' in headline){
				assert(is.string(headline.authorUrl));
				assert(is.not.empty(headline.authorUrl));
				assert(is.url(headline.authorUrl));
			}

			assert(is.string(headline.source));
			assert(is.not.empty(headline.source));

			assert(is.string(headline.description));
			assert(headline.description === '' || is.not.empty(headline.description));

		});

	});
	
});