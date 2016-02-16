const filterOnlyNew = require('./filter-only-new');
const saveNew = require('./save-new');

module.exports = headlines => {

	return filterOnlyNew(headlines).then(saveNew);

};