const mongoose = require('mongoose');
var Schema = mongoose.Schema;

//creating Schema used for storing users enquiries and complains
const enquiriesSchema = new Schema ({
	name: {
			type: String
	  },

	email: {
		    type: String
	   		}, 

	message_priority: {
						type: String
					  },

	message: {
				type: String
			}

});


const enquiries = mongoose.model('enquiries', enquiriesSchema);

//exporting the model
module.exports = enquiries