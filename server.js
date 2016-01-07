'use strict';

var express = require('express');
var limiter = require('express-rate-limit');

var fetch = require('./fetcher/index');

// Start a new server, set it up and return it.
module.exports.init = () => {

	var rateLimiter;

	if (process.env.LOCAL === 'true'){

		// prep rate limiter
		// every 30 minutes, allow only a single request
		// than only send status 429 "Too Many Requests"
		// skip on local instances
		rateLimiter = limiter(
			{
				windowMs: 1000 * 60 * 30,
				max: 1,
				delayAfter: 0,
				delayMs: 0
			}
		);

	} else {
		rateLimiter = (req, res, next) => { next(); };
	}

	// Boing
	let server = express();

	// register main route
	server.get('/', (req, res) => {
		res.sendFile('index.html', { root: 'public', maxAge: 1000*60*30 });
	});

	// register fetcher job initiator
	server.get('/run-fetcher', rateLimiter, (req, res) => {

		fetch()
			.then(() => { res.status(200).end(); })
			.catch(err => {
				console.error(err);

				return res.status(500).end();
			});

	});

	// Serve static files
	server.use(express.static('public', { maxAge: 1000*60*60*24*7 }));

	// set 404 fallback
	server.use(fourOfour);

	return server;

};

function fourOfour(req, res){

	// serve main page if html is accepted
	if (req.accepts('html')) return res.status(404).sendFile('index.html', { root: 'public' });

	// otherwise simply send a 404
	res.status(404).end();
}