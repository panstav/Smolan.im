'use strict';

var getHeadlines = require('./get-headlines');
var saveHeadlines = require('./save-headlines');

module.exports = () => {

	return getHeadlines().then(saveHeadlines);

};