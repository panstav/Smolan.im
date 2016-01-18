'use strict';

var express = require('express');
var limiter = require('express-rate-limit');
var compression = require('compression');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var fetch = require('./fetcher');
var compile = require('./fetcher/compile-jade');

var db = require('./db');

// Start a new server, set it up and return it.
module.exports.init = () => {

	// Boing
	let server = express();

	// A fix for dealing with DNS for heroku apps
	if (process.env.HEROKU) server.enable('trust proxy');

	// compress everything
	server.use(compression());

	// register main route
	server.get('/', getRateLimiter('index'), (req, res) => {
		res.sendFile('index.html', { root: 'public', maxAge: process.env.NODE_ENV === 'production' ? 1000*60*30 : 0 });
	});

	// register redirection route
	server.get('/redirect', (req, res, next) => {

		let redirectRequest = req.query.url;

		// continue by stack if there's no 'url' query
		if (!redirectRequest) return next();

		// redirect the user to the article
		res.redirect(301, redirectRequest);

		// increment view count as this ip address
		db.views.incr(redirectRequest, req.ip).catch(err => {
			if (err) console.error(err);
		});

	});

	// register fetcher job initiator
	server.get('/run-fetcher', getRateLimiter('fetcher'), (req, res) => {

		fetch()
			.then(db.getSortedHeadlines)
			.then(compile)
			.then(
				() => { res.status(200).end(); },
				err => { if (err) console.log(err); }
			);

	});

	// Serve static files
	server.use(express.static('public', { maxAge: process.env.NODE_ENV === 'production' ? 1000*60*60*24*7 : 0 }));

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

function getRateLimiter(route){

	var limiters = {

		index: {
			windowMs: 1000 * 60,      // cache request ips for a minute
			max: 6,                   // block the seventh request
			delayAfter: 3,            // delay the fourth request
			delayMs: 5000
		},

		fetcher: {
			windowMs: 1000 * 60 * 30, // cache request ips for half an hour
			max: 1,                   // block the second request
			delayAfter: 0,
			delayMs: 0
		}

	};

	// empty middleware for production non-debug instances
	if (process.env.DEBUG || process.env.NODE_ENV !== 'production') return (req, res, next) => { next(); };

	// every 30 minutes, allow only a single request
	// than only send status 429 "Too Many Requests"
	return limiter(limiters[route]);

}