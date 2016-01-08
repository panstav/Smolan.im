'use strict';

var express = require('express');
var limiter = require('express-rate-limit');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var fetch = require('./fetcher');

var db = require('./db');

// Start a new server, set it up and return it.
module.exports.init = () => {

	// prep rate limiter
	let rateLimiter = getRateLimiter(!!process.env.LOCAL);

	// Boing
	let server = express();

	// register main route
	server.get('/', (req, res) => {
		res.sendFile('index.html', { root: 'public', maxAge: 1000*60*30 });
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
	server.get('/run-fetcher', rateLimiter, (req, res) => {

		fetch()
			.then(db.getSortedHeadlines)
			.then(respondAndCompile)
			.catch(console.log);

		function respondAndCompile(sortedHeadlines){

			res.status(200).end();

			return new Promise((resolve, reject) => {

				let locals = {
					categorizedDB: sortedHeadlines
				};

				gulp.src('client/index.jade')
					.pipe(plugins.jade({ locals }))
					.pipe(gulp.dest('public'))
					.on('error', reject)
					.on('end', () => resolve);

			});
		}

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

function getRateLimiter(isLocal){

	// empty middleware for local instance
	if (isLocal) return (req, res, next) =>
		{ next()
	; };

	// every 30 minutes, allow only a single request
	// than only send status 429 "Too Many Requests"
	return limiter(
		{
			windowMs: 1000 * 60 * 30,
			max: 1,
			delayAfter: 0,
			delayMs: 0
		}
	);

}