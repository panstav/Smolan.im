const db = require('../../db');
const log = require('../../log');

module.exports = newHeadlines => {

	return new Promise((resolve, reject) => {

		log.debug('Saving new headlines');

		db.models.headlines.create(newHeadlines, err => {
			if (err) return reject(err);

			log.info(`Saved ${newHeadlines.length} new articles`);

			resolve();
		});

	});
};