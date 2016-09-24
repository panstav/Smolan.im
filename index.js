const dotenv = require('dotenv').config({ silent: process.env.NODE_ENV === 'production' });
const debug = require('debug')('node');

const server = require('./server');
const db = require('./db');
require('./cron')();

db.init();

const port = process.env.PORT || 3000;
server.init().listen(port, () => {
	debug(`Server is up, listening on port ${port}`);
});