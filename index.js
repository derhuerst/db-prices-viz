'use strict'

const http = require('http')
const corser = require('corser')
const url = require('url')
const through = require('through2')
const pick = require('lodash.pick')
const ndjson = require('ndjson')

const readJourneys = require('./lib/read-journeys')

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const port = process.env.PORT || 3000

const handleCORS = corser.create()

const err400 = (res, msg) => {
	console.error(msg)
	res.writeHead(400, {'content-type': 'application/json'})
	res.end(JSON.stringify({error: true, msg}))
}

const server = http.createServer((req, res) => {
	handleCORS(req, res, () => {
		const {query} = url.parse(req.url, true)
		const {origin, destination, departure, arrival} = query

		if (!origin) return err400(res, 'Missing origin parameter.')
		if (!destination) return err400(res, 'Missing destination parameter.')

		if (!departure) return err400(res, 'Missing departure parameter.')
		if (isNaN(+new Date(departure))) return err400(res, 'departure must be a date string.')
		if (!arrival) return err400(res, 'Missing arrival parameter.')
		if (isNaN(+new Date(arrival))) return err400(res, 'arrival must be a date string.')

		if (!query.lines) return err400(res, 'Missing lines parameter.')
		const lines = query.lines.split(',')

		readJourneys({origin, destination, departure, arrival, lines})
		.pipe(through.obj((journey, _, cb) => {
			cb(null, pick(journey, ['trips', 'offer', 'requestDate']))
		}))
		.pipe(ndjson.stringify())
		.pipe(res)
	})
})

server.listen(port, (err) => {
	if (err) return showError(err)
	console.info(`HTTP server listening at port ${port}.`)
})
