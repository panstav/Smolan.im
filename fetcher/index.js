var jsonfile = require('jsonfile');
var moment = require('moment');

var common = require('./common');

var getHeadlines = require('./get-headlines');

console.time('Scraping for headlines.');
getHeadlines((err, headlines) => {
	if (err) return console.log(err);

	console.timeEnd('Scraping for headlines.');

	var sortedHeadlines = headlines
		.sort(byDate) // sort by descending date
		.map(dateToHuman); // transform date to human format

	// write headlines to db
	jsonfile.writeFile('./db.json', sortedHeadlines, {spaces: 2}, err => {
		if (err) return console.error(err);
		
		console.log('Scraping done.');
	});
});

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