const fs = require('fs');

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const dotenv = require('dotenv').config();

const optional = require('optional');
const moment = require('moment');
const sitemap = require('sitemap');
const extend = require('extend');

const common = require('./common');

gulp.task('clean', () => {

	const publicFiles = [
		'!public/.gitignore', 'public/*'
	];

	return gulp.src(publicFiles, { read: false })
		.pipe(plugins.clean({ force: true }));

});

gulp.task('prep-public-dir', () => {

	const copyPaste = [
		'client/manifest.json',
		'client/logo.png',
		'client/font-carmela/*',
		'client/favicons/*',
		'client/robots.txt'
	];

	return gulp.src(copyPaste, { base: './client' })
		.pipe(gulp.dest('public'));

});

gulp.task('sass-to-css', () => {

	return gulp.src('client/index.sass')
		.pipe(plugins.sass({ outputStyle: process.env.NODE_ENV !== 'production' ? 'nested' : 'compressed' }))
		.pipe(plugins.rename({ basename: 'styles' }))
		.pipe(gulp.dest('client/dest'));

});

gulp.task('js-to-js', () => {

	return gulp.src('client/index.js')
		.pipe(plugins.babel({ presets: ['es2015'] }))
		.pipe(plugins.if(process.env.NODE_ENV === 'production', plugins.uglify()))
		.pipe(plugins.rename({ basename: 'script' }))
		.pipe(gulp.dest('client/dest'));

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

gulp.task('build', plugins.sequence('clean', 'prep-public-dir', 'sass-to-css', 'js-to-js', 'generate-sitemap'));