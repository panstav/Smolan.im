const fs = require('fs');
const pug = require('pug');

const common = require('./common');

module.exports = compileJade;

function compileJade(headlines){

	const compiler = pug.compileFile('./client/index.pug', { pretty: process.env.NODE_ENV === 'production' });

	const locals = {
		production: process.env.NODE_ENV === 'production',
		domain: common.domain,
		bingVerification: '66210C1BD52CB9DFEAF89E92C2D0C35C',
		siteName: 'שמאלנים',
		fullTitle: 'שמאלנים - ויש נקודה.',
		description: 'אוסף מאמרים מהאתרים: הארץ, המקום הכי חם בגהינום, העוקץ, הטלויזיה החברתית, שיחה מקומית מאבק סוציאליסטי ו- פרספקטיבה. זכרו - כמו עם כל גוף ידע - השתמשו בביקורתיות ובתבונה כאשר אתם קוראים "אקטואליה".',
		logoUrl: common.domain + '/logo.png',
		headlines
	};

	return new Promise((resolve, reject) =>{

		fs.writeFile('./public/index.html', compiler(locals), err => {
			if (err) return reject(err);
			resolve();
		})

	});
}