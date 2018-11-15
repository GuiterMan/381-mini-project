var mongoose = require('mongoose');

var restSchema = mongoose.Schema({
	address:
{
		street:String,
		zipcode:String,
		building:String,	
	}
	,
	borough:String,
	cuisine:String,
	name: String,
	restaurant_id: Number
});

module.exports = restSchema;
