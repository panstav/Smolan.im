const async = require('async');

const log = require('../../log');

module.exports = tasks => {

	return new Promise((resolve, reject) => {

		async.parallel(tasks, (err, arrays) => {
			if (err) return reject(err);

			log.debug('Finished all tasks');

			const results = [];

			// go through every magazine and through every headline - flatten into
			arrays.forEach(arr => {
				if (arr) arr.forEach(item => {
					results.push(item);
				});
			});

			resolve(unique(results));
		});

	});

	function unique(arr){

		const urls = [];

		return arr.filter(headline => {
			if (urls.indexOf(headline.url) > -1) return false;

			urls.push(headline.url);
			return true;
		});
	}

};