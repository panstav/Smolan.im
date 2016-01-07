'use strict';

var jsonfile = require('jsonfile');
var moment = require('moment');

var common = require('./common');

var getHeadlines = require('./get-headlines');

module.exports = () => {

	console.time('Scraping for headlines.');

	return getHeadlines().then(sortAndSaveHeadlines);

};

function sortAndSaveHeadlines(headlines){

	return new Promise((resolve, reject) => {

		console.timeEnd('Scraping for headlines.');

		var sortedHeadlines = headlines

			// sort by descending date
			.sort(byDate)

			// categorize by today, yesterday and this week
			.reduce(todayYesterdayAndThisWeek, { today: [], yesterday: [], thisWeek: [] });

		// fix up date as a last step because it's format is so human-centric
		for (let category in sortedHeadlines){
			sortedHeadlines[category] = sortedHeadlines[category].map(dateToHuman);
		}

		// write headlines to db
		jsonfile.writeFile('./db.json', sortedHeadlines, {spaces: 2}, err => {
			if (err) return reject(err);

			resolve(sortedHeadlines);
		});
	});

}

function byDate(a, b){
	if (moment(a.date, common.momentInputFormat)
			.isBefore(
				moment(b.date, common.momentInputFormat))){
		return 1;
	}

	return -1;
}

function todayYesterdayAndThisWeek(accumulator, headline){

	let thisVeryMoment = moment();

	// get markers to query against
	let today =               thisVeryMoment.format(common.momentInputFormat);
	let yesterday =           thisVeryMoment.subtract(1, 'days').format(common.momentInputFormat);

	let queryDate = headline.date;

	// was it published this week?
	if (moment(queryDate, common.momentInputFormat).isSame(thisVeryMoment, 'week')){

		if (queryDate === today){
			accumulator.today.push(headline);     // was it today?

		} else if (queryDate === yesterday){
			accumulator.yesterday.push(headline); // was it yesterday?

		} else {
			accumulator.thisWeek.push(headline); // either way - it's this week
		}

	}

	return accumulator;
}

function dateToHuman(item){
	item.date = moment(item.date, common.momentInputFormat).format(common.momentOutputFormat);

	return item;
}