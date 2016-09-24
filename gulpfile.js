const fs = require('fs');

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const dotenv = require('dotenv').config();

const optional = require('optional');
const moment = require('moment');
const sitemap = require('sitemap');
const extend = require('extend');

const db = require('./db');
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

gulp.task('jade-to-html', () => {

	const locals = {
		domain: common.domain,
		bingVerification: '66210C1BD52CB9DFEAF89E92C2D0C35C',
		siteName: 'שמאלנים',
		fullTitle: 'שמאלנים - ויש נקודה.',
		description: 'אוסף מאמרים מהאתרים: הארץ, המקום הכי חם בגהינום, העוקץ, הטלויזיה החברתית, שיחה מקומית מאבק סוציאליסטי ו- פרספקטיבה. זכרו - כמו עם כל גוף ידע - השתמשו בביקורתיות ובתבונה כאשר אתם קוראים "אקטואליה".',
		logoUrl: common.domain + '/logo.png',
		categorizedDB: [] // sortedHeadlines
	};

	if (process.env.NODE_ENV === 'production') locals.production = true;

	const jadeOptions = {
		locals: extend({}, locals),
		pretty: process.env.NODE_ENV !== 'production'
	};

	return gulp.src('client/index.jade')
		.pipe(plugins.data(getHeadlines))
		.pipe(plugins.jade(jadeOptions))
		.pipe(gulp.dest('public'));

	function getHeadlines(file, done){

		return db.init()
			.then(() => {
				return db.models.headlines.find({ date: { $gte: moment().subtract(3, 'days').toDate() } }).exec()
			})
			.then(headlines => {
				db.close();
				jadeOptions.locals.headlines = headlines.map(headline => headline.toObject());
				done();
			});

	}

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