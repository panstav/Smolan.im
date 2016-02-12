'use strict';

const common = require('../../common');

const mongoose = require('mongoose');
const moment = require('moment');

const getDomain = require('top-domain');

module.exports = () => new Promise((resolve, reject) => {

	const headlineModel = mongoose.model('headline');

	const lastThirtyDays = moment().subtract(30, 'days')
		.set('hour', 0).set('minute', 0).set('second', 0) // go to beginning of that day
		.toDate();                                        // return Date object

	headlineModel.find({ 'date': { $gt: lastThirtyDays } }).exec().then(sortHeadlines, reject);

	function sortHeadlines(headlinesFromThisMonth){

		var sortedHeadlines = headlinesFromThisMonth.map(toPlainObject)

			// sort by descending date
			.sort(byDate)

			// limit per-magazine
			.reduce(maxHeadlinesPerMagazine(), [])

			// turn url into a redirection route, with url as query
			// this is for tracking outbound links
			.map(headline => {
				headline.url = common.domain + '/redirect?url=' + headline.url;

				return headline;
			})

			// categorize by today, yesterday and this week
			.reduce(sortedByTimeCategory, { today: [], yesterday: [], lastSevenDays: [], lastThirtyDays: [] });

		// fix up date as a last step because it's format is so human-centric
		for (let category in sortedHeadlines){
			sortedHeadlines[category] = sortedHeadlines[category].map(dateToHuman);
		}

		resolve(sortedHeadlines);
	}

});

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

function maxHeadlinesPerMagazine(){

	var counter = {};

	return (arr, headline) => {

		var domainName = getDomain(headline.url);

		// if counter wasn't initiated for this domain, include it, increment and continue
		if (!counter[domainName]){
			counter[domainName] = 1;

			arr.push(headline);
			return arr;
		}

		// if it already reached max headlines, don't include it
		if (counter[domainName] === common.itemsPerMagazine) return arr;

		// otherwise we're just counting, include it and continue
		counter[domainName]++;
		arr.push(headline);
		return arr;
	};


}

function sortedByTimeCategory(accumulator, headline){

	let thisVeryMoment = moment();

	let today = thisVeryMoment.format(common.momentDayFormat);
	let yesterday = thisVeryMoment.subtract(1, 'days').format(common.momentDayFormat);
	let sevenDaysAgo = thisVeryMoment.subtract(7, 'days');

	let queryDate = moment(headline.date).format(common.momentDayFormat);

	if (queryDate === today){
		accumulator.today.push(headline);     // was it today?

	} else if (queryDate === yesterday){
		accumulator.yesterday.push(headline); // was it yesterday?

	} else if (sevenDaysAgo.isBefore(headline.date)){
		accumulator.lastSevenDays.push(headline); // was during last seven days?

	} else {
		accumulator.lastThirtyDays.push(headline); // either way - it's this week
	}

	return accumulator;
}

function dateToHuman(headline){
	headline.date = moment(headline.date).format(common.momentHumanFormat);

	return headline;
}