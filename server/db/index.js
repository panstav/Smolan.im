'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const log = require('../log');

var headlineModel;
const headlineSchema = {
	title:        String,
	description:  String,
	source:       String,
	url:          String,
	date:         Date,
	image:        String,

	views: {
		count: { type: Number, default: 0 },
		ips: [String]
	}
};

module.exports = {

	init,
	close,

	get models(){ return { headlines: headlineModel } }

};

function init(dbUri){
	return new Promise((resolve, reject) => {

		mongoose.connect(dbUri);

		mongoose.connection.on('connected', () => {
			resolve(mongoose.connection);
		});

		mongoose.connection.on('error', reject);

		mongoose.connection.on('disconnected', () => {
			log.debug('Mongoose connection disconnected');
		});

		headlineModel = mongoose.model('headline', mongoose.Schema(headlineSchema));
	});
}

function close(){
	mongoose.connection.close(Promise.resolve);
}

function incr(headlineUrl, ip){

	// get this headlines document (but only if it doesn't already have the current ip)
	const query = { 'url': headlineUrl, 'views.ips': { $nin: [ip] } };

	// append ip and increase count
	const operation = { $push: { 'views.ips': ip }, $inc: { 'views.count': 1 } };

	return headlineModel.update(query, operation).exec();
}