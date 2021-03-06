const debug = require('debug')('server');

const express = require('express');
const compression = require('compression');

// Start a new initServer, set it up and return it.
module.exports.init = () => {

	debug('Initializing Express');

	const maxAge = process.env.NODE_ENV === 'production' ? 1000*60*60*3 : 0 ;

	// Boing
	const server = express();

	// A fix for dealing with DNS for heroku apps
	if (process.env.HEROKU) server.enable('trust proxy');

	// compress everything
	server.use(compression());

	server.get('/', (req, res) => {
		res.sendFile('index.html', { root: 'public', maxAge });
	});

	server.use(express.static('public', { maxAge }));

	server.use(fourOfour);

	return server;
};

function fourOfour(req, res){

	// serve main page if html is accepted
	if (req.accepts('html')) return res.status(404).sendFile('index.html', { root: 'public' });

	// otherwise simply send a 404
	res.status(404).end();
}