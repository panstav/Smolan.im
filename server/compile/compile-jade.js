const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

const common = require('../../common');
const log = require('../log');

module.exports = function(sortedHeadlines){

	if (process.env.DEBUG) outputDebugInfo();

	const locals = {
		domain: common.domain,
		fullTitle: 'שמאלנים - ויש נקודה.',
		description: 'אוסף מאמרים מהאתרים: הארץ, המקום הכי חם בגהינום, העוקץ, הטלויזיה החברתית, שיחה מקומית מאבק סוציאליסטי ו- פרספקטיבה. זכרו - כמו עם כל גוף ידע - השתמשו בביקורתיות ובתבונה כאשר אתם קוראים "אקטואליה".',
		siteName: 'שמאלנים',
		logoUrl: common.domain + '/logo.png',
		categorizedDB: sortedHeadlines,
		bingVerification: '66210C1BD52CB9DFEAF89E92C2D0C35C'
	};

	if (process.env.NODE_ENV === 'production') locals.production = true;

	return new Promise((resolve, reject) => {

		log.debug('Start gulp compilation task');

		gulp.src('client/index.jade')
			.pipe(plugins.jade({ locals, pretty: process.env.NODE_ENV !== 'production' }))
			.pipe(gulp.dest('public'))
			.on('error', reject)
			.on('end', resolve.bind(null, locals));

	});

	function outputDebugInfo(){

		const all = [].concat(sortedHeadlines.today, sortedHeadlines.yesterday, sortedHeadlines.lastSevenDays, sortedHeadlines.lastThirtyDays);

		console.log(
`Totals per section:
	Today: ${sortedHeadlines.today.length}
	Yesterday: ${sortedHeadlines.yesterday.length}
	Last Seven Days: ${sortedHeadlines.lastSevenDays.length}
	Last Thirty Days: ${sortedHeadlines.lastThirtyDays.length}

Totals per magazine:
	Haaretz: ${all.filter(isAt('haaretz.co.il')).length}
	Ha-Makom: ${all.filter(isAt('ha-makom.co.il')).length}
	Ha-Oketz: ${all.filter(isAt('haokets.org')).length}
	Hevratit TV: ${all.filter(isAt('social.org.il')).length}
	Mekomit: ${all.filter(isAt('mekomit.co.il')).length}
	Social Struggle: ${all.filter(isAt('socialism.org.il')).length}
	Presspectiva: ${all.filter(isAt('presspectiva.org.il')).length}
`);

	}

	function isAt(domain){
		return headline => headline.url.indexOf(domain) > -1;
	}

};