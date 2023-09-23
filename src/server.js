const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')

require('dotenv').config()

const api = require('./api')

const uri = process.env.MONGO_URI
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}

// 連接到 MongoDB
mongoose
	.connect(uri, options)
	.then(() => {
		console.log('MongoDB is connected')
	})
	.catch((err) => {
		console.log(err)
	})

const app = express()

const PORT = 3333

app.use(express.json())
app.use(cors())
app.use('/api', api)

app.get('*', (req, res) => {
	res.send('Default route is working')
})

app.use((err, req, res, next) => {
	const status = err.status || 500
	if (status === 500) {
		console.log('The server errored when processing a request')
		console.log(err)
	}

	res.status(status)
	res.send({
		status: status,
		message: err.message,
	})
})

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})
