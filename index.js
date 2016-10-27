const dotenv = require('dotenv').config({ silent: process.env.NODE_ENV === 'production' });
const debug = require('debug')('node');

const server = require('./server');
const db = require('./db');

const crawlHeadlines = require('./crawl-headlines');
const fetchHeadlines = require('./fetch-headlines-from-db');
const compileJade = require('./compile-jade');

// register cron tasks
require('./cron')();

// initialize database connection
db.init();

const port = process.env.PORT || 3000;
server.init().listen(port, () => {

	Promise.resolve()
		.then(crawlHeadlines)
		.then(fetchHeadlines)
		.then(compileJade)
		.then(() => debug(`Server is up, listening on port ${port}`))
		.catch(err => {
			console.error(err.message);
			console.error(err.stack);
		});

});