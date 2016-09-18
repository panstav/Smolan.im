// const initServer = require('./server');
//
// initServer().listen(process.env.PORT || 3000, () => {
// 	console.log(`Server is up! Listening on ${port}.`);
// });

const crawler = require('./crawler');

crawler()
	.then(headlines => {
		console.log(headlines.length);
		return headlines;
	})
	.then(console.log)
	.catch(err => {
		console.error(err.message);
		console.error(err.stack);
	});