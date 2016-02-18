'use strict';

const moment = require('moment');
const getDomain = require('top-domain');

const common = require('../../common');

module.exports = latestHeadlines => {

	var sortedHeadlines = latestHeadlines.map(toPlainObject)

		// sort by descending date
		.sort(byDate)

		// limit per-magazine
		.reduce(maxHeadlinesPerMagazine(), [])

		// turn url into a redirection route, with url as query
		// this is for tracking outbound links
		.map(innerUrls)

		// categorize by today, yesterday and this week
		.reduce(sortedByTimeCategory, { today: [], yesterday: [], lastSevenDays: [], lastThirtyDays: [] });

	// fix up date as a last step because it's format is so human-centric
	for (let category in sortedHeadlines){
		sortedHeadlines[category] = sortedHeadlines[category].map(dateToHuman);
	}

	return Promise.resolve(sortedHeadlines);
};

function toPlainObject(doc){
	return doc.toObject();
}

function byDate(a, b){
	if (moment(a.date).isBefore(moment(b.date))) return 1;

	return -1;
}

function maxHeadlinesPerMagazine(){

	const counter = {};

	return (arr, headline) => {

		const domainName = getDomain(headline.url);

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

function innerUrls(headline){
	headline.url = common.domain + '/redirect?url=' + headline.url;

	return headline;
}

function sortedByTimeCategory(accumulator, headline){

	const thisVeryMoment = moment();

	const today = thisVeryMoment.format(common.momentDayFormat);
	const yesterday = thisVeryMoment.subtract(1, 'days').format(common.momentDayFormat);
	const sevenDaysAgo = thisVeryMoment.subtract(7, 'days');

	const queryDate = moment(headline.date).format(common.momentDayFormat);

	if (queryDate === today){ // was it today?
		accumulator.today.push(headline);

	} else if (queryDate === yesterday){ // was it yesterday?
		accumulator.yesterday.push(headline);

	} else if (sevenDaysAgo.isBefore(headline.date)){ // was during last seven days?
		accumulator.lastSevenDays.push(headline);

	} else { // either way - it's this week
		accumulator.lastThirtyDays.push(headline);
	}

	return accumulator;
}

function dateToHuman(headline){
	headline.date = moment(headline.date).format(common.momentHumanFormat);

	return headline;
}