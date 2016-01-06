'use strict';

var express = require('express');

var fetcher = require('../fetcher');

// Start a new server, set it up and return it.
module.exports.init = () => {

	// Boing
	let server = express();

	// register main route
	server.get('/', (req, res) => {
		res.sendFile('index.html', { root: 'public', maxAge: 1000*60*30 });
	});

	// register fetcher jon initiator
	server.get('/run-fetcher', (req, res) => {
		fetcher(err => {
			if (err){
				console.error(err);

				return res.status(500).end();
			}
			
			res.status(200).end();
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
