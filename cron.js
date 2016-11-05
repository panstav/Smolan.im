const debug = require('debug')('cron');
const cron = require('node-cron');

const crawlHeadlines = require('./lib/crawl-headlines');
const fetchHeadlines = require('./lib/fetch-headlines-from-db');
const compileJade = require('./lib/compile-jade');

module.exports = registerCron;

function registerCron(){

	if (process.env.NODE_ENV === 'production'){
		debug('Registering crawling job');
		cron.schedule('0 0 */3 * * *', runTask, true);
	} else {
		debug('Skipping crawling job for non-production environment');
	}

	function runTask(){
		debug('Running crawler job');

		crawlHeadlines()
			.then(() => {
				debug('Fetching headlines from db');
				return fetchHeadlines();
			})
			.then(headlines => {
				debug('Compiling Jade with new headlines');
				return compileJade(headlines);
			})
			.then(() => {
				debug('Done');
			})
			.catch(err => {
				console.error(err.message);
				console.error(err.stack);
			});
	}

}