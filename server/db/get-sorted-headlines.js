'use strict';

var common = require('../../common');

var mongoose = require('mongoose');
var moment = require('moment');

module.exports = () => {

	return new Promise(sortedHeadlinesPromise);

};

function sortedHeadlinesPromise(resolve, reject){

	var headlineModel = mongoose.model('headline');

	let firstDayOfThisWeek = moment()

	// go to beginning of week
		.subtract(moment().day(), 'days')

		// go to beginning of that day
		.set('hour', 0).set('minute', 0).set('second', 0)

		// return Date object
		.toDate();

	headlineModel.find({ 'date': { $gt: firstDayOfThisWeek } }).exec()
		.then(sortHeadlines)
		.catch(reject);

	function sortHeadlines(headlinesFromThisWeek){

		var sortedHeadlines = headlinesFromThisWeek

			.map(toPlainObject)

			// sort by descending date
			.sort(byDate)

			// turn url into a redirection route, with url as query
			// this is for tracking outbound links
			.map(headline => {
				headline.url = common.domain + '/redirect?url=' + headline.url;

				return headline;
			})

			// categorize by today, yesterday and this week
			.reduce(todayYesterdayAndThisWeek, { today: [], yesterday: [], thisWeek: [] });

		// fix up date as a last step because it's format is so human-centric
		for (let category in sortedHeadlines){
			sortedHeadlines[category] = sortedHeadlines[category].map(dateToHuman);
		}

		resolve(sortedHeadlines);
	}

}

function toPlainObject(doc){
	return doc.toObject();
}

function byDate(a, b){
	if (moment(a.date)
			.isBefore(
				moment(b.date))){
		return 1;
	}

	return -1;
}

function todayYesterdayAndThisWeek(accumulator, headline){

	let thisVeryMoment = moment();

	let today = thisVeryMoment.format(common.momentDayFormat);
	let yesterday = thisVeryMoment.subtract(1, 'days').format(common.momentDayFormat);

	let queryDate = moment(headline.date).format(common.momentDayFormat);

	// was it published this week?
	if (moment(headline.date).isSame(thisVeryMoment, 'week')){

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

function dateToHuman(headline){
	headline.date = moment(headline.date).format(common.momentHumanFormat);

	return headline;
}