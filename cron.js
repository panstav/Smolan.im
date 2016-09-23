const debug = require('debug')('cron');
const cron = require('node-cron');

const crawler = require('./crawler');

module.exports = registerCron;

function registerCron(){
	const EVERY_THREE_MINUTES = '*/3 * * * *';
	const EVERY_THREE_HOURS = '* */3 * * *';

	const interval = process.env.NODE_ENV === 'production' ? EVERY_THREE_HOURS : EVERY_THREE_MINUTES;

	debug('Registering crawling job');
	cron.schedule(interval, crawlTask, true);
}

function crawlTask(){
	debug('Running crawler job');

	crawler()
		.then(headlines =>{
			debug(`Crawler got ${headlines.length} headlines.`);
		})
		.catch(err =>{
			debug(err.message);
			console.error(err.stack);
		});

}