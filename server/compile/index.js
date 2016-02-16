const queryMonthyArticles = require('./query-monthy-articles');
const sortHeadlines = require('./sort-headlines');
const compileJade = require('./compile-jade');

module.exports = () => {
	return queryMonthyArticles().then(sortHeadlines).then(compileJade);
};