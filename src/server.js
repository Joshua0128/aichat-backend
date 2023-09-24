const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

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

// 設定 api docs 的資訊
const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'AIChat Docs',
			version: '1.0.0',
			description: 'Api Docs for AIChat',
		},
	},
	// Path to the API docs
	apis: ['./src/api.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

const app = express()
const PORT = 3333

app.use(express.json())
app.use(cors())
app.use('/', api)
app.use(
	'/api-docs',
	swaggerUi.serve,
	swaggerUi.setup(swaggerSpec, { explorer: true })
)

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
