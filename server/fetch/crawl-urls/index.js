const constructTasks = require('./construct-tasks');
const executeTasks = require('./execute-tasks');

module.exports = () => {

	// get array of crawl task
	// each directs to a different website
	// with parsing functions and description extra crawl (sometimes)
	const tasks = constructTasks();

	// parallel-execute those tasks and return a promise of resulting headlines
	return executeTasks(tasks);

};