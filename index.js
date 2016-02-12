'use strict';

const optional = require('optional');

const log = require('./server/log');

const env = optional('./env');
if (env) for (let i in env) process.env[i] = env[i];
log.info(`ENV has set`);
log.debug({ env });

//-=======================================================---
//------------------ Database
//-=======================================================---

require('./server/db')
	.init(process.env.MONGO_URI)
	.then(connection => { log.info(`DB is connected to ${ connection.host }:${ connection.port }`); })
	.catch(err => log.error('DB didn\'t connect', err));

//-=======================================================---
//------------------ Express Server
//-=======================================================---

let port = process.env.PORT || 3000;

require('./server')
	.init()
	.listen(port, () => log.info(`Server is up! Listening on ${port}.`));