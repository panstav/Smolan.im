const server = require('./server');
const registerCron = require('./cron');

const port = process.env.PORT || 3000;
server.init().listen(port, () => {
	console.log(`Server is up! Listening on ${port}.`);
	registerCron();
});