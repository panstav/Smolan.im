'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var common = require('../../common');

module.exports = function(sortedHeadlines){

	return new Promise((resolve, reject) => {

		let locals = {
			domain: common.domain,
			fullTitle: 'שמאלנים - ויש נקודה.',
			description: 'אוסף מאמרים מהאתרים: הארץ, המקום הכי חם בגהינום, העוקץ, הטלויזיה החברתית ו- שיחה מקומית. זכרו - כמו עם כל גוף ידע - השתמשו בביקורתיות ובתבונה כאשר אתם קוראים "אקטואליה".',
			siteName: 'שמאלנים',
			logoUrl: common.domain + '/logo.png',
			categorizedDB: sortedHeadlines,
			bingVerification: '66210C1BD52CB9DFEAF89E92C2D0C35C'
		};

		if (process.env.NODE_ENV === 'production') locals.production = true;

		gulp.src('client/index.jade')
			.pipe(plugins.jade({ locals, pretty : process.env.NODE_ENV !== 'production' }))
			.pipe(gulp.dest('public'))
			.on('error', reject)
			.on('end', resolve);

	});

};