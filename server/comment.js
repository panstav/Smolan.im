const _ = require('lodash');

const db = require('../db');
const log = require('./log');

const validMongoId = require('./valid-mongo-id');

module.exports = (req, res) => {

	validate(req.body)
		.then(getHeadlineDoc)
		.then(addComment)
		.then(() => res.status(200).end(), logAndRespond);

	function validate(data){

		const error = checkForErrors();
		if (error) return Promise.reject({ label: error, data });

		return Promise.resolve(data);

		function checkForErrors(){
			if (!data)
				return 'no-data';

			if (!data.headlineId)
				return 'no-id';

			if (!validMongoId(data.headlineId))
				return 'invalid-id';

			if (!data.comment || !data.comment.length)
				return 'bad-comment';

			if (data.comment.length > 140)
				return 'comment-too-long';

			return false;
		}

	}

	function getHeadlineDoc(data){
		return new Promise((resolve, reject) => {

			db.models.headlines.findById(data.headlineId, 'comments').exec()
				.then(attachDocIfExists, err => reject({ label: 'db-error', data, err }));

			function attachDocIfExists(headlineDoc){
				if (!headlineDoc) return reject({ label: 'no-document', data, headlineDoc });

				data.doc = headlineDoc;

				resolve(data);
			}

		});
	}

	function addComment(data){

		const commentObj = {
			content: data.comment,
			createdAt: new Date(),
			user: _.pick(req.user, ['name', 'image', 'link'])
		};

		data.doc.comments.push(commentObj);

		return Promise.resolve(data.doc.save());
	}

	function logAndRespond(err){
		log.error(err);

		res.status(400).end();
	}

};