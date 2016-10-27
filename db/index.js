const debug = require('debug')('db');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const headlineModel = mongoose.model('headline', mongoose.Schema(require('./headline')));

module.exports = {

	init,
	close,
	models: {
		headlines: headlineModel
	}

};

function init(){

	const p = new Promise((resolve, reject) => {
		mongoose.connection.on('error', reject);
		mongoose.connection.on('disconnected', () => debug('Mongoose connection disconnected'));
		mongoose.connection.on('connected', () => {
			debug('Mongoose connection established');
			resolve(mongoose.connection);
		});

		mongoose.connect(process.env.MONGO_URI);
	});

	return p.catch(err => {
		debug(err.message);
		debug(err.stack);
	});

}

function close(){
	return new Promise((resolve, reject) => {
		mongoose.connection.close(resolve);
	});
}