'use strict'

const fs = require('fs')
const path = require('path')
const from = require('from2')
const through = require('through2')
const filter = require('stream-filter')
const isRoughlyEqual = require('is-roughly-equal')
const slugg = require('slugg')

const minute = 60 * 1000

const dir = path.join(__dirname, '../data')
const allFiles = fs.readdirSync(dir).filter((f) => path.extname(f) === '.json')

const ids = /(\d{7,})-(\d{7,})/
const spaces = /\s+/

const readJourneys = (query) => {
	const files = allFiles.filter((name) => {
		const match = ids.exec(name)
		if (!match) return false
		return match[1] === query.origin && match[2] === query.destination
	})

	let i = 0
	return from({objectMode: true}, (_, cb) => {
		if (i >= files.length) return cb(null, null)
		const file = files[i]
		i++

		fs.readFile(path.join(dir, file), {encoding: 'utf8'}, (err, data) => {
			if (err) return cb(err)
			try {
				cb(null, JSON.parse(data))
			} catch (err) {
				cb(err)
			}
		})
	})

	.pipe(through.obj(function (data, _, cb) {
		for (let journey of data.data) {
			this.push(journey)
		}
		cb()
	}))

	.pipe(filter.obj((journey) => {
		if (journey.trips.length === 0) return false

		const first = journey.trips[0]
		const last = journey.trips[journey.trips.length - 1]
		const dep = new Date(first.start)
		const arr = new Date(last.end)
		if (!isRoughlyEqual(minute, dep, new Date(query.departure))) return false
		if (!isRoughlyEqual(minute, arr, new Date(query.arrival))) return false

		if (journey.trips.length !== query.lines.length) return false
		journey.trips.every((trip, i) => {
			const lineA = slugg(query.lines[i].replace(spaces, ''))
			const lineB = slugg(trip.line.replace(spaces, ''))
			return lineA === lineB
		})

		return true
	}))
}

module.exports = readJourneys
