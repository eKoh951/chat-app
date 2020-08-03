const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage,
				generateLocationMessage
			} = require('./utils/messages')

const {	addUser,
				removeUser,
				getUser,
				getUsersInRoom
			} = require('./utils/users')

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

	socket.on('join', (options, callback) => {
		const { error, user} = addUser({id: socket.id, ...options })
		
		if(error){
			return callback(error)
		}
		
		socket.join(user.room)

		// Flag: 'broadcast' send to every client but to the current client
		socket.emit('message', generateMessage('Welcome!'))
		socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
		
		// We call the callback function so the client knows that he was able to join
		callback()
	})

	socket.on('sendMessage', (message, callback) => {
		// Initialize bad-words
		const filter = new Filter()

		if(filter.isProfane(message))
			return callback('Profanity is not allowed')

		const user = getUser(socket.id)

		io.to(user.room).emit('message', generateMessage(message, user))
		callback()
	})

	socket.on('disconnect', () => {
		const user = removeUser(socket.id)

		if(user) {
			io.to(user.room).emit('message', generateMessage(`User ${user.username} has left!`))
		}

	})

	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id)
		io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.lat},${location.long}`))
		callback()
	})
})

server.listen(port, () => console.log(`Listening to port ${3000}`))