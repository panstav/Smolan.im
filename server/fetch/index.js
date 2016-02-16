const crawlUrls = require('./crawl-urls');
const saveHeadlines = require('./save-headlines');

module.exports = () => {

	return crawlUrls().then(saveHeadlines);

};