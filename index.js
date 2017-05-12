'use strict'

const http = require('http')
const httpServer = require('./http')

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
	res.json({})
})

server.listen(port, (err) => {
	if (err) return showError(err)
	console.info(`HTTP server listening at port ${port}.`)
})
