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
			.sort(byDate) // sort by descending date
			.map(dateToHuman); // transform date to human format

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

function dateToHuman(item){
	item.date = moment(item.date, common.momentInputFormat).format(common.momentOutputFormat);

	return item;
}