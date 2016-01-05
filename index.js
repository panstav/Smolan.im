'use strict';

var optional = require('optional');

// apply local environment variables
const env = optional('./env');
if (env) for (let i in env) process.env[i] = env[i];

let port = process.env.PORT || 3000;
require('./server')
	.init()
	.listen(port, () => console.log(`Server is up! Listening on ${port}.`));