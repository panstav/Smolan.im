const debug = require('debug')('cron');
const cron = require('node-cron');

const crawlHeadlines = require('./crawl-headlines');
const fetchHeadlines = require('./fetch-headlines-from-db');
const compileJade = require('./compile-jade');

module.exports = registerCron;

function registerCron(){

	if (process.env.NODE_ENV === 'production'){
		debug('Registering crawling job');
		cron.schedule('* */3 * * *', runTask, true);
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