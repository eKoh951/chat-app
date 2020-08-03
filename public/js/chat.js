// socket.io-client is exposed automatically by the socket.io server as /socket.io/socket.io.js
// we are importing that from the HTML file as: <script src="/socket.io/socket.io.js"></script>

// Instance of socket-client
// io() function is used to connect the Client to the Server
// io() function returns a new Socket instance
const client = io()

// Elements, the $ preFix stands for elements in the DOM, this is a convention
const $msgForm = document.querySelector('#msg-form')
const $msgFormInput = $msgForm.querySelector('input')
const $msgFormButton = $msgForm.querySelector('button')
const $sendLocationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
// Using the qs library (defined within the script markups in chat.html)
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Autoscroll
const autoscroll = () => {
	// New message element
	const $newMessage = $messages.lastElementChild

	// Height of the new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

	// Visible height
	const visibleHeight = $messages.offsetHeight

	// Height of messages container
	const containerHeight = $messages.scrollHeight

	// How far have I scrolled?
	const scrollOffset = $messages.scrollTop + visibleHeight

	if(containerHeight - newMessageHeight <= scrollOffset){
		$messages.scrollTop = $messages.scrollHeight
	}
}

// Listening to message event
client.on('message', (message) => {
	console.log(message)
	// html will store the final html that renders to the browser
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	// 'beforeend' adds the html before the 'div' ends
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

// Listening to locationMessage event
client.on('locationMessage', (message) => {
	const html = Mustache.render(locationMessageTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

client.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	})
	document.querySelector('#sidebar').innerHTML = html
})

window.onload = (event) => {
	$msgFormInput.focus()
}

$msgForm.addEventListener('submit', (e) => {
	e.preventDefault()
	
	// Disable button
	$msgFormButton.setAttribute('disabled', 'disabled')

	// e.target to get the form
	// .message is the name property from the input tag
	const msgString = e.target.elements.message.value
	
	// The function (3rd parameter) is for the acknowledgement
	client.emit('sendMessage', msgString, (error) => {
		$msgFormButton.removeAttribute('disabled')
		$msgFormInput.value = ''

		// .focus() is used to move the cursor to the input
		$msgFormInput.focus()

		if(error)
			return console.log(error)
		
		console.log('Message delivered')
	})
})

$sendLocationBtn.addEventListener('click', () => {
	if(!navigator.geolocation)
		return alert('Geolocation is not supported by your browser.')

	$sendLocationBtn.setAttribute('disabled', 'disabled')
	$msgFormInput.focus()
	navigator.geolocation.getCurrentPosition((position) => {
		client.emit('sendLocation', {
			lat: position.coords.latitude,
			long: position.coords.longitude
		}, () => {
			$sendLocationBtn.removeAttribute('disabled')
			console.log('Location shared!')
		})
	})
})

client.emit('join', { username, room }, (error) => {
	if(error) {
		alert(error)
		location.href = '/'
	}
})