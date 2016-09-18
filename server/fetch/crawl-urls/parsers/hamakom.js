'use strict';

var cheerio = require('cheerio');

var moment = require('moment');
moment.locale('he');

var common = require('../../../../common');

let domain = 'http://www.ha-makom.co.il';

module.exports = res => {

	var $ = cheerio.load(res.body);

	return new Promise((resolve, reject) => {



	});

};

module.exports.headlinesSourceUrl = domain + '/articles';
module.exports.description = { selector: 'article .field-name-field-sub-title .field-item' };