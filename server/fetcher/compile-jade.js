'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

module.exports = function(sortedHeadlines){

	return new Promise((resolve, reject) => {

		let locals = {
			categorizedDB: sortedHeadlines
		};

		gulp.src('client/index.jade')
			.pipe(plugins.jade({ locals }))
			.pipe(gulp.dest('public'))
			.on('error', reject)
			.on('end', resolve);

	});

};