const async = require('async');

const log = require('../../log');
const db = require('../../db');

module.exports = headlines => {
	return new Promise((resolve, reject) => {

		async.filter(headlines, iterator, resolve);

		function iterator(headline, done){

			log.debug('Filtering headlines');

			db.models.headlines.count({ 'url': headline.url }, (err, count) => {
				if (err) return reject(err);

				// returns false for existing headlines
				// true for empty results
				done(!count);
			});

		}

	});
};