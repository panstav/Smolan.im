const _ = require('lodash');
const moment = require('moment');

const db = require('./db');

module.exports = fetchHeadlines;

function fetchHeadlines(){

	return db.models.headlines.find({ date: { $gte: moment().subtract(10, 'days').toDate() } }).exec()
		.then(organizeHeadlines)
		.catch(err => {
			console.log(err.message);
			console.error(err.stack);
		});

}

function organizeHeadlines(data){

	const sources = {
		haaretz: 'הארץ',
		hamakom: 'המקום הכי חם בגהינום',
		hevratit: 'הטלויזיה החברתית',
		mekomit: 'שיחה מקומית',
		presspectiva: 'פרספקטיבה'
	};

	const headlines = data
		.map(headline => headline.toObject())
		.sort((a, b) => a.date >= b.date ? -1 : 1)
		.map(headline =>{
			headline.date = moment(headline.date).format('DD/MM');
			headline.sourceHeb = sources[headline.source];
			return headline;
		});

	return _.groupBy(headlines, headline => headline.date);
}