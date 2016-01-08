'use strict';

var optional = require('optional');

var env = optional('./env');
if (env) for (let i in env) process.env[i] = env[i];

//-=======================================================---
//------------------ Database
//-=======================================================---

require('./server/db')
	.init(process.env.MONGO_URI)
	.then(connection => { console.log(`DB is connected to ${ connection.host }:${ connection.port }`); })
	.catch(console.error);

//-=======================================================---
//------------------ Express Server
//-=======================================================---

let port = process.env.PORT || 3000;

require('./server')
	.init()
	.listen(port, () => console.log(`Server is up! Listening on ${port}.`));