const mongoose = require('mongoose');
var Schema = mongoose.Schema;

//creating Schema used for storing users enquiries and complains
const votestorageSchema = new Schema ({
	name: {
			type: String
	  },

	email: {
		    type: String
	   		}, 
	contestant: {
		    type: String
	   		}, 

});


const votestorage = mongoose.model('votestorage', votestorageSchema);

//exporting the model
module.exports = votestorage