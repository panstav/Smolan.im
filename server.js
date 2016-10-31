const debug = require('debug')('server');

const express = require('express');
const limiter = require('express-rate-limit');
const compression = require('compression');

// Start a new initServer, set it up and return it.
module.exports.init = () => {

	debug('Initializing Express');

	// Boing
	const server = express();

	// A fix for dealing with DNS for heroku apps
	if (process.env.HEROKU) server.enable('trust proxy');

	// compress everything
	server.use(compression());

	server.get('/', getRateLimiter('index'), (req, res) => {
		res.sendFile('index.html', { root: 'public' });
	});

	server.use(express.static('public', { maxAge: process.env.NODE_ENV === 'production' ? 1000*60*60*24*7 : 0 }));

	server.use(fourOfour);

	return server;

};

function fourOfour(req, res){

	// serve main page if html is accepted
	if (req.accepts('html')) return res.status(404).sendFile('index.html', { root: 'public' });

	// otherwise simply send a 404
	res.status(404).end();
}

function getRateLimiter(route){

	var limiters = {

		index: {
			windowMs: 1000 * 60,      // cache request ips for a minute
			max: 6,                   // block the seventh request
			delayAfter: 3,            // delay the fourth request
			delayMs: 5000
		}

	};

	// empty middleware for production non-debug instances
	if (process.env.DEBUG || process.env.NODE_ENV !== 'production') return (req, res, next) => { next(); };

	// every 30 minutes, allow only a single request
	// than only send status 429 "Too Many Requests"
	return limiter(limiters[route]);

}