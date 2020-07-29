// socket.io-client is exposed automatically by the socket.io server as /socket.io/socket.io.js
// we are importing that from the HTML file as: <script src="/socket.io/socket.io.js"></script>

// Instance of socket-client
// io() function is used to connect the Client to the Server
// io() function returns a new Socket instance
const client = io()

client.on('message', (data) => {
	console.log(data)
})

const msgForm = document.querySelector('form')

msgForm.addEventListener('submit', (e) => {
	e.preventDefault()
	// e.target to get the form
	const msgString = e.target.elements.message.value
	// The function is for the acknowledgement
	client.emit('sendMessage', msgString, (error) => {
		if(error)
			return console.log(error)
		
		console.log('Message delivered')
	})
})

document.querySelector('#send-location').addEventListener('click', () => {
	if(!navigator.geolocation)
		return alert('Geolocation is not suppoerted by your browser.')

	navigator.geolocation.getCurrentPosition((position) => {
		client.emit('sendLocation', {
			lat: position.coords.latitude,
			long: position.coords.longitude
		}, () => {
			console.log('Location shared!')
		})
	})
})