const debug = require('debug')('cron');
const cron = require('node-cron');

const crawler = require('./crawler');
const db = require('./db');

module.exports = registerCron;

function registerCron(){
	const EVERY_MINUTE = '*/1 * * * *';
	const EVERY_THREE_HOURS = '* */3 * * *';

	const interval = process.env.NODE_ENV === 'production' ? EVERY_THREE_HOURS : EVERY_MINUTE;

	debug('Registering crawling job');
	cron.schedule(interval, crawlTask, true);
}

function crawlTask(){
	debug('Running crawler job');

	crawler()
		.then(headlines =>{
			debug(`Crawler got ${headlines.length} headlines.`);
			return Promise.all(headlines.map(updateHeadlines));
		})
		.then(() => debug('Crawler finished saving headlines'))
		.catch(err =>{
			debug(err.message);
			console.error(err.stack);
		});

	function updateHeadlines(headline){
		return db.models.headlines.update({ url: headline.url }, headline, { upsert: true }).exec();
	}

}