const moment = require('moment');

const db = require('../db');

module.exports = () => {

	const lastThirtyDays = moment().subtract(30, 'days')
		.set('hour', 0).set('minute', 0).set('second', 0) // go to beginning of that day
		.toDate();                                        // return Date object

	return db.models.headlines.find({ 'date': { $gt: lastThirtyDays } }).exec();

};