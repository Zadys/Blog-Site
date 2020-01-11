let mongoose = require("mongoose");


let blogSchema = mongoose.Schema({
	title: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	content: String,
	image: { type: String, default: "https://images.unsplash.com/photo-1531213203257-16afb0eac95e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1929&q=80" },
	published: { type: Date, default: Date.now },
	//comment array is associated using object reference
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}]
});

module.exports = mongoose.model("Blog", blogSchema);