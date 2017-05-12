'use strict'

const query = require('./client')

query(
	'8011160', // Berlin Hbf
	'8000105', // Frankfurt (Main) Hbf
	'2017-04-20T16:35:00+0200',
	'2017-04-20T20:44:00+0200',
	['ICE 377']
).then((stream) => {
	stream.on('data', console.log)
	stream.on('error', console.error)
}, console.error)
