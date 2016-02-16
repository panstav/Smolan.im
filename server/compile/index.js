const queryMonthyArticles = require('./query-monthy-articles');
const compileJade = require('./compile-jade');

module.exports = () => {
	return queryMonthyArticles().then(compileJade);
};