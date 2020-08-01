const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage,
				generateLocationMessage
			} = require('./utils/messages')

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

	socket.on('join', ({ username, room }) => {
		socket.join(room)

		// Flag: 'broadcast' send to every client but to the current client
		socket.emit('message', generateMessage('Welcome!'))
		socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
	})

	socket.on('sendMessage', (message, callback) => {
		// Initialize bad-words
		const filter = new Filter()

		if(filter.isProfane(message))
			return callback('Profanity is not allowed')

		io.to('1').emit('message', generateMessage(message))
		callback()
	})

	socket.on('disconnect', () => {
		io.emit('message', generateMessage('A user has left!'))
	})

	socket.on('sendLocation', (location, callback) => {
		io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.lat},${location.long}`))
		callback()
	})
})

server.listen(port, () => console.log(`Listening to port ${3000}`))