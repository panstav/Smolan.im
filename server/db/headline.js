module.exports = {
	title: String,
	description: String,
	source: String,
	url: String,
	date: Date,
	image: String,

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