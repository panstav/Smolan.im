const debug = require('debug');
const cron = require('node-cron');

const crawler = require('./crawler');

module.exports = registerCron;

function registerCron(){
	const log = debug('cron');

	const EVERY_THREE_MINUTES = '* */3 * * * *';
	const EVERY_THREE_HOURS = '* * */3 * * *';

	const interval = process.env.NODE_ENV === 'production' ? EVERY_THREE_HOURS : EVERY_THREE_MINUTES;

	cron.schedule(interval, () => {
		log('Running crawler');

		crawler()
			.then(headlines => {
				log(`Crawled ${headlines.length} headlines.`);
			})
			.catch(err => {
				log(err.message);
				console.error(err.stack);
			});

	});
}