'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var categorizedDB = require('./db.json');

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

gulp.task('jade-to-html', () => {

	let locals = {
		categorizedDB
	};

	return gulp.src('client/index.jade')
		.pipe(plugins.jade({ locals }))
		.pipe(gulp.dest('public'));

});

gulp.task('build', plugins.sequence('prep-public-dir', 'sass-to-css', 'jade-to-html'));