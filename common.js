module.exports = {
	domain: process.env.LOCAL ? 'http://localhost:3000' : 'http://www.smolan.im',

	itemsPerMagazine: 5,
	maxPerMagazingForToday: 3,

	momentDayFormat: 'DD/MM/YYYY',
	momentHumanFormat: 'DD/MM'
};