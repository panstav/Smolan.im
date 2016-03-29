'use strict';

const moment = require('moment');
const getDomain = require('top-domain');

const common = require('../../common');
const log = require('../log');

module.exports = latestHeadlines => {

	log.debug('Sorting headlines for display');

	const thisVeryMoment = moment();

	const today = thisVeryMoment.format(common.momentDayFormat);
	const yesterday = thisVeryMoment.subtract(1, 'days').format(common.momentDayFormat);
	const sevenDaysAgo = thisVeryMoment.subtract(7, 'days');

	const sortedHeadlines = latestHeadlines.map(toPlainObject)

		// sort by descending date
		.sort(byDate)

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

	function toPlainObject(doc){
		return doc.toObject();
	}

	function byDate(a, b){
		if (moment(a.date).isBefore(moment(b.date))) return 1;

		return -1;
	}

	function innerUrls(headline){
		headline.url = common.domain + '/redirect?url=' + headline.url;

		return headline;
	}

	function sortedByTimeCategory(accumulator, currentHeadline){

		const targetTimeCategory = getTimeCatorgory();

		if (sourceDidntBinge(targetTimeCategory)) accumulator[targetTimeCategory].push(currentHeadline);

		return accumulator;

		function getTimeCatorgory(){
			const queryDate = moment(currentHeadline.date).format(common.momentDayFormat);

			if (queryDate === today){ // was it today?
				return 'today';

			} else if (queryDate === yesterday){ // was it yesterday?
				return 'yesterday';

			} else if (sevenDaysAgo.isBefore(currentHeadline.date)){ // was during last seven days?
				return 'lastSevenDays';

			} else { // either way - it's this week
				return 'lastThirtyDays';
			}

		}

		function sourceDidntBinge(timeCategory){
			const appearancesAtTimeCategory = accumulator[timeCategory].filter(headline => headline.source === currentHeadline.source);

			return appearancesAtTimeCategory.length < common.maxPerMagazingForToday;
		}

	}

	function dateToHuman(headline){
		headline.date = moment(headline.date).format(common.momentHumanFormat);

		return headline;
	}

};