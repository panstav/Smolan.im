'use strict';

var async = require('async');

var db = require('../db');

module.exports = headlines => {

	return new Promise((resolve, reject) => {

		async.each(headlines, saveIfNew, err => {
			if (err) return reject(err);

			resolve();
		});

	});

	function saveIfNew(headline, done){

		db.models.headlines.findOne({ 'url': headline.url })
			.exec()
			.then(saveIfNone)
			.then(done, err => done(err));

		function saveIfNone(existingHeadline){

			return new Promise((resolve, reject) => {

				if (existingHeadline) return resolve();

				db.models.headlines.create(headline, err => {
					if (err) return reject(err);

					resolve();
				});

			});
		}

	}
};