const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const log = require('./../log');

var headlineModel, userModel;

module.exports = {

	init,
	close,

	get models(){
		return {
			users: userModel,
			headlines: headlineModel
		}
	}

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

		userModel = mongoose.model('user', mongoose.Schema(require('./user')));
		headlineModel = mongoose.model('headline', mongoose.Schema(require('./headline')));
	});
}

function close(){
	mongoose.connection.close(() => Promise.resolve);
}