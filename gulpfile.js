'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var db = require('./db.json');

gulp.task('sass-to-css', () => {

	return gulp.src('client/index.sass')
		.pipe(plugins.sass({ outputStyle: 'expanded' }))
		.pipe(plugins.rename({ basename: 'styles' }))
		.pipe(gulp.dest('public'));

});

gulp.task('jade-to-html', () => {

	let locals = {
		db
	};

	return gulp.src('client/index.jade')
		.pipe(plugins.jade({ locals }))
		.pipe(gulp.dest('public'));

});

gulp.task('local-build', ['sass-to-css', 'jade-to-html']);