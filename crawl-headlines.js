const debug = require('debug')('crawler');

const db = require('./db');
const runCrawler = require('./crawler');

module.exports = crawlHeadlines;

function crawlHeadlines(){

	return runCrawler()
		.then(headlines =>{
			debug(`Crawler got ${headlines.length} headlines.`);
			return Promise.all(headlines.map(updateHeadlines));
		})
		.then(() => debug('Crawler finished saving headlines'))
		.catch(err => {
			console.error(err.message);
			console.error(err.stack);
		});

	function updateHeadlines(headline){
		return db.models.headlines.update({ url: headline.url }, headline, { upsert: true }).exec();
	}

}