'use strict'

const {fetch} = require('fetch-ponyfill')()
const url = require('url')
const ndjson = require('ndjson')

const query = (origin, destination, departure, arrival, lines) => {
	if (!origin) throw new Error('Missing origin parameter.')
	if (!destination) throw new Error('Missing destination parameter.')

	if (!departure) throw new Error('Missing departure parameter.')
	if (isNaN(+new Date(departure))) throw new Error('departure must be a timestamp.')
	if (!arrival) throw new Error('Missing arrival parameter.')
	if (isNaN(+new Date(arrival))) throw new Error('arrival must be a timestamp.')

	if (!Array.isArray(lines)) throw new Error('lines must be an array.')

	const target = url.format({
		protocol: 'http',
		hostname: 'localhost',
		port: 3000,
		pathname: '/',
		query: {origin, destination, departure, arrival, lines: lines.join(',')}
	})

	return fetch(target, {
		cache: 'no-store',
		mode: 'cors'
	})
	.then((res) => {
		if (!res.ok) {
			return res.json().then(({msg}) => {
				throw new Error(msg)
			})
		}

		// todo: streaming
		return res.buffer()
	})
	.then((data) => {
		const s = ndjson.parse()
		s.end(data)
		return s
	})
}

module.exports = query
