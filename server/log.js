const bunyan = require('bunyan');

const bunyanOptions = {
	name: 'Smolanim',
	level: process.env.DEBUG ? 'debug' : 'info',
	src: process.env.SHOW_SRC,
	serializers: bunyan.stdSerializers
};

const consoleObj = {
	info: console.log,
	debug: process.env.DEBUG ? console.log : () => {},
	error: console.error
};

module.exports = process.env.LOCAL ? bunyan.createLogger(bunyanOptions) : consoleObj;