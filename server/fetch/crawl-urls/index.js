const log = require('../../log');

const constructTasks = require('./construct-tasks');
const executeTasks = require('./execute-tasks');

module.exports = crawlHeadlineSources;

function crawlHeadlineSources(){

	Promise.all(getUrls.map(crawl))
		.then(parse)
		.then(complement);

}



function old() {

	// get array of crawl task
	// each directs to a different website
	// with parsing functions and description extra crawl (sometimes)
	const tasks = constructTasks();

	log.debug('Finished construction, Executing tasks');

	// parallel-execute those tasks and return a promise of resulting headlines
	return executeTasks(tasks);

}