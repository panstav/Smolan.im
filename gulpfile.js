'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var optional = require('optional');
var moment = require('moment');

var db = require('./server/db');

gulp.task('prep-public-dir', () => {

	return gulp.src('client/font-carmela/*', { base: './client' })
		.pipe(gulp.dest('public'));

});

gulp.task('sass-to-css', () => {

	return gulp.src('client/index.sass')
		.pipe(plugins.sass({ outputStyle: 'expanded' }))
		.pipe(plugins.rename({ basename: 'styles' }))
		.pipe(gulp.dest('public'));

});

gulp.task('jade-to-html', done => {

	let env = optional('./env');
	if (env) process.env.MONGO_URI = env.MONGO_URI;

	db.init(process.env.MONGO_URI)
		.then(db.getSortedHeadlines)
		.then(compile)
		.then(db.close)
		.then(done)
		.catch(done);

	function compile(sortedHeadlines){

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

	}

});

gulp.task('build', plugins.sequence('prep-public-dir', 'sass-to-css', 'jade-to-html'));