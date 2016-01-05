'use strict';

var common = require('./common');

var requireDir = require('require-dir');
var async = require('async');
var got = require('got');

var jsonfile = require('jsonfile');

// turn js files in parsers/ to method of this object
var parsers = requireDir('./parsers');

// map parser to task
let tasks = constructTasks();

// execute parallel tasks and callback
executeTasks(tasks, (err, results) => {
	if (err) return console.error(err);

	jsonfile.writeFile('./db.json', results, {spaces: 2}, err => {
		if (err) return console.error(err);
	});
});

function constructTasks(){

	// set user-agent
	let gotOptions = { headers: { 'user-agent': `SmonalimBot/0.0 (+http://smolan.im)` } };

	// turn parsers into tasks
	let tasks = [];
	for (let key in parsers){
		tasks.push(parserToTask(parsers[key]));
	}

	return tasks;

	function parserToTask(parser){
		return done => {

			got(parser.url, gotOptions).then(res => { parser(res, done); }).catch(err => {
				console.log(err);
			});

		}
	}

}

function executeTasks(tasks, cb){

	// scrap every site in parralel, parsing it with
	async.parallel(tasks, (err, arrays) => {
		if (err) return cb(err);

		// flatten array
		let results = [];
		arrays.forEach(arr => { arr.forEach(item => { results.push(item); }); });

		// output
		cb(null, results)
	});

}