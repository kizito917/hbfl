const mongoose = require('mongoose');
var Schema = mongoose.Schema;

//creating Schema used for storing users enquiries and complains
const contactSchema = new Schema ({
	name: {
			type: String
	  },

	email: {
		    type: String
	   		}, 

	telephone: {
					type: String
				  },

	message: {
				type: String
			}

});


const contact = mongoose.model('contact', contactSchema);

//exporting the model
module.exports = contact