const mongoose = require('mongoose');

module.exports = id => id && mongoose.Types.ObjectId.isValid( typeof(id) === 'string' ? id : id.toString() );

// generate a random mongoID
module.exports.gen = () => mongoose.Types.ObjectId().toString();