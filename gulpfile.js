'use strict';

var fs = require('fs');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var optional = require('optional');
var moment = require('moment');
var sitemap = require('sitemap');

var db = require('./server/db');
var compile = require('./server/fetcher/compile-jade');

var common = require('./common');

gulp.task('prep-public-dir', () => {

	let copyPaste = [
		'client/manifest.json',
		'client/font-carmela/*',
		'client/favicons/*',
		'client/google-analytics.js'
	];

	return gulp.src(copyPaste, { base: './client' })
		.pipe(gulp.dest('public'));

});

gulp.task('sass-to-css', () => {

	return gulp.src('client/index.sass')
		.pipe(plugins.sass({ outputStyle: process.env.NODE_ENV !== 'production' ? 'nested' : 'compressed' }))
		.pipe(plugins.rename({ basename: 'styles' }))
		.pipe(gulp.dest('public'));

});

gulp.task('js-to-js', () => {

	return gulp.src('client/index.js')
		.pipe(plugins.babel({ presets: ['es2015'] }))
		.pipe(plugins.uglify({ output: { beautify: process.env.NODE_ENV !== 'production' } }))
		.pipe(plugins.rename({ basename: 'script' }))
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

});

gulp.task('generate-sitemap', done => {

	let urls = [{
		url: '/',
		changefreq: 'hourly',
		priority: 1,
		lastmod: moment().format('YYYY-MM-DD')
	}];

	let smolanimMap = sitemap.createSitemap({ urls, hostname: common.domain });

	fs.writeFile('public/sitemap.xml', smolanimMap.toString(), done);

});

gulp.task('build', plugins.sequence('prep-public-dir', 'sass-to-css', 'js-to-js', 'jade-to-html', 'generate-sitemap'));