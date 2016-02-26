'use strict';

const express = require('express');
const limiter = require('express-rate-limit');
const compression = require('compression');

const comment = require('./comment');

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

const log = require('./log');
const fetch = require('./fetch');
const compile = require('./compile');

const db = require('./db');

// Start a new server, set it up and return it.
module.exports.init = () => {

	log.debug('Initializing Express');

	// Boing
	const server = express();

	// A fix for dealing with DNS for heroku apps
	if (process.env.HEROKU) server.enable('trust proxy');

	// compress everything
	if (process.env.NODE_ENV === 'production') server.use(compression());

	// register main route
	server.get('/', getRateLimiter('index'), (req, res) => {
		res.sendFile('index.html', { root: 'public', maxAge: process.env.NODE_ENV === 'production' ? 1000*60*30 : 0 });
	});

	const auth = () => (req, res, next) => {
		req.user = { name: 'stav', image: 'http://example.com/image.jpg', link: 'http://example.com' };
		next();
	};

	server.post('/comment', auth(), comment);

	// register redirection route
	server.get('/redirect', (req, res, next) => {

		const redirectRequest = req.query.url;

		// continue by stack if there's no 'url' query
		if (!redirectRequest) return next();

		// redirect the user to the article
		res.redirect(301, redirectRequest);

		// increment view count as this ip address
		incr(redirectRequest, req.ip).catch(err => {
			if (err) log.error('DB: Increment error', err);
		});

		function incr(headlineUrl, ip){

			// get this headlines document (but only if it doesn't already have the current ip)
			const query = { 'url': headlineUrl, 'views.ips': { $nin: [ip] } };

			// append ip and increase count
			const operation = { $push: { 'views.ips': ip }, $inc: { 'views.count': 1 } };

			return db.models.headlines.update(query, operation).exec();
		}

	});

	// register fetcher job initiator
	server.get('/fetch', (req, res) => {

		if (!process.env.LOCAL && req.query.apikey !== process.env.API_KEY) return res.status(400).end();

		res.status(200).end();

		log.info('Fetching initiated');

		fetch().then(compile)
			.then(() => {
				log.info('Fetching successful');
			})
			.catch(err => {
				if (err) log.error(err, 'Fetching error');
			});

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