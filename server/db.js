const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const log = require('./log');

var headlineModel;
const headlineSchema = {
	title:        String,
	description:  String,
	source:       String,
	url:          String,
	date:         Date,
	image:        String,

	comments: [{
		createdAt: Date,
		votes: {
			count: { type: Number, default: 0 },
			ips: [String]
		},
		user: {
			name: String,
			link: String,
			image: String
		}
	}],

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
	mongoose.connection.close(() => Promise.resolve);
}