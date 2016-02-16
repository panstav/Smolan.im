'use strict';

const async = require('async');
const got = require('got');
const cheerio = require('cheerio');

const common = require('../../common');
const log = require('../log');



module.exports = () => {

	const gotOptions = { headers: { 'user-agent': `SmonalimBot/0.0 (+http://smolan.im)` } };

	return new Promise((resolve, reject) => {
		getTasks().then(executeTasks).then(resolve, reject);
	});
	
	function getTasks(){

		// turn parsers into tasks
		const tasks = [];
		for (let key in parsers){
			tasks.push(taskedParser(key));
		}

		log.debug('Got tasks array', tasks);

		return Promise.resolve(tasks);
	}

	function taskedParser(name){

		return done => {

			const parser = parsers[name];

			log.debug({ url: parser.headlinesSourceUrl, options: gotOptions }, `Getting ${name}`);

			got(parser.headlinesSourceUrl, gotOptions)
				.then(parser)
				.then(parseIntoEach)
				.then(
					headlines => done(null, headlines),
					err => done(err)
			);

			function parseIntoEach(headlines){

				return Promise.all(headlines.map(populateDescription));

				function populateDescription(headline){
					return new Promise((resolve, reject) => {

						if (headline.description) return resolve(headline);

						got(headline.url, gotOptions, (err, resBody) => {
							if (err) return reject(err);

							var desc, $ = cheerio.load(resBody);

							if (parser.description.transform){
								desc = parser.description.transform($(parser.description.selector));

							} else {
								desc = $(parser.description.selector).text();
							}

							if (desc){
								desc = desc.trim();

								// ensure a dot at the end of descrpition paragraph
								if (desc.charAt(desc.length-1) !== '.') desc += '.';

							} else {
								desc = '';
							}

							// attach to headline object
							headline.description = desc;

							resolve(headline);
						});

					});
				}
			}

		};
	}

	function executeTasks(tasks){

		// scrap every site in parallel, parsing it with
		async.parallel(tasks, (err, arrays) => {
			if (err) return Promise.reject(err);

			//-=======================================================---
			//------------------ Flatten Arrays
			//-=======================================================---

			const results = [];

			// go through every magazine
			arrays.forEach(arr => {

				// go through every headline
				arr.forEach(item => {

					for (let key in item){
						if (!item[key]) return log.error(`Bad property ${key}`, item);
					}

					results.push(item);
				});
			});

			// output
			Promise.resolve(unique(results));
		});

		function unique(arr){

			const urls = [];
			return arr.filter(headline => {
				if (urls.indexOf(headline.url) > -1) return false;

				urls.push(headline.url);
				return true;
			});
		}

	}
	
};