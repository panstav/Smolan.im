const debug = require('debug')('cron');
const cron = require('node-cron');

const crawler = require('./crawler');
const db = require('./db');
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

		crawlTask().then(() => {
			debug('Compiling Jade with new headlines');
			compileJade();
		});
	}

}

function crawlTask(){

	return crawler()
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