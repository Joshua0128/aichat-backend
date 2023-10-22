const mongoose = require('mongoose')

const SessionSchema = new mongoose.Schema({
	createdAt: Date,
	user: String,
	title: String,
	messages: [String],
})

module.exports = mongoose.model('Session', SessionSchema)
