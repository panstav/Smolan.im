'use strict';

var async = require('async');
var got = require('got');
var cheerio = require('cheerio');

var common = require('../../common');

// turn js files in parsers/ to method of this object
var requireDir = require('require-dir');
var parsers = requireDir('./parsers');

module.exports = () => {

	var gotOptions = { headers: { 'user-agent': `SmonalimBot/0.0 (+http://smolan.im)` } };

	return new Promise((resolve, reject) => {
		getTasks().then(executeTasks).then(resolve, reject);
	});
	
	function getTasks(){
		return new Promise((resolve, reject) => {

			// turn parsers into tasks
			let tasks = [];
			for (let key in parsers){
				tasks.push(taskedParser(key));
			}

			resolve(tasks);

		});
	}

	function taskedParser(name){

		var parser = parsers[name];

		return done => {

			got(parser.headlinesSourceUrl, gotOptions)
				.then(parser)
				.then(parseIntoEach)
				.then(
					headlines => done(null, headlines),
					err => done(err)
			);

			function parseIntoEach(headlines){
				return Promise.all(headlines.map(populateDescription));
			}

			function populateDescription(headline){
				return new Promise((resolve, reject) => {

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

		};
	}

	function executeTasks(tasks){
		return new Promise((resolve, reject) => {

			// scrap every site in parallel, parsing it with
			async.parallel(tasks, (err, arrays) => {
				if (err) return reject(err);

				//-=======================================================---
				//------------------ Flatten Arrays
				//-=======================================================---

				let results = [];

				// go through every magazine
				arrays.forEach(arr => {

					// go through every headline
					arr.forEach(item => {

						for (let key in item){
							if (!item[key]) return console.error(`Bad property ${key}`, item);
						}

						results.push(item);
					});
				});

				// output
				resolve(unique(results));
			});

			function unique(arr){

				var urls = [];
				return arr.filter(headline => {
					if (urls.indexOf(headline.url) > -1) return false;

					urls.push(headline.url);
					return true;
				});
			}

		});

	}
	
};