'use strict';

const fs = require('fs');

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

const optional = require('optional');
const moment = require('moment');
const sitemap = require('sitemap');

const db = require('./server/db');
const log = require('./server/log');

const compile = require('./server/compile');

const common = require('./common');

gulp.task('prep-public-dir', () => {

	const copyPaste = [
		'client/manifest.json',
		'client/logo.png',
		'client/font-carmela/*',
		'client/favicons/*',
		'client/google-analytics.js',
		'client/robots.txt'
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

	const env = optional('./env');
	if (env) process.env.MONGO_URI = env.MONGO_URI;

	db.init(process.env.MONGO_URI)
		.then(compile)
		.then(db.close)
		.then(done)
		.catch(err => {
			log.error(err);
			done();
		});

});

gulp.task('generate-sitemap', done => {

	const urls = [{
		url: '/',
		changefreq: 'hourly',
		priority: 1,
		lastmod: moment().format('YYYY-MM-DD')
	}];

	const smolanimMap = sitemap.createSitemap({ urls, hostname: common.domain });

	fs.writeFile('public/sitemap.xml', smolanimMap.toString(), done);

});

gulp.task('build', plugins.sequence('prep-public-dir', 'sass-to-css', 'js-to-js', 'jade-to-html', 'generate-sitemap'));