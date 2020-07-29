const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

const data = 'Welcome!'

// io.on: Server method
io.on('connection', (socket) => {
	console.log('New WebSocket connection')

	// Flag: 'broadcast' send to every client but to the current client
	socket.broadcast.emit('message', 'A new user has joined!')

	socket.on('sendMessage', (message, callback) => {
		// Initialize bad-words
		const filter = new Filter()

		if(filter.isProfane(message))
			return callback('Profanity is not allowed')

		io.emit('message', message)
		callback()
	})

	socket.on('disconnect', () => {
		io.emit('message', 'A user has left!')
	})

	socket.on('sendLocation', (location, callback) => {
		io.emit('message', `https://google.com/maps?q=${location.lat},${location.long}`)
		callback()
	})
})

server.listen(port, () => console.log(`Listening to port ${3000}`))