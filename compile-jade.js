const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

const _ = require('lodash');
const moment = require('moment');

const db = require('./db');
const common = require('./common');

module.exports = compileJade;

function compileJade(){

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
		locals,
		pretty: process.env.NODE_ENV !== 'production'
	};

	return gulp.src('client/index.jade')
		.pipe(plugins.data(getHeadlines))
		.pipe(plugins.jade(jadeOptions))
		.pipe(gulp.dest('public'));

	function getHeadlines(file, done){

		return db.init()
			.then(fetchAndParseHeadlines)
			.then(headlines =>{
				db.close();

				// append headlines, grouped by date
				jadeOptions.locals.headlines = _.groupBy(headlines, headline => headline.date);

				done();
			}).catch(err =>{
				console.log(err.message);
				console.error(err.stack);
			});

		function fetchAndParseHeadlines(){

			const sources = {
				haaretz: 'הארץ',
				hamakom: 'המקום הכי חם בגהינום',
				hevratit: 'הטלויזיה החברתית',
				mekomit: 'שיחה מקומית',
				presspectiva: 'פרספקטיבה'
			};

			return db.models.headlines.find({ date: { $gte: moment().subtract(10, 'days').toDate() } }).exec()
				.then(headlines => headlines.map(headline => headline.toObject()))
				.then(headlines => headlines.sort((a, b) => a.date >= b.date ? -1 : 1))
				.then(headlines => headlines.map(headline =>{
					headline.date = moment(headline.date).format('DD/MM');
					headline.sourceHeb = sources[headline.source];
					return headline;
				}));
		}

	}

}