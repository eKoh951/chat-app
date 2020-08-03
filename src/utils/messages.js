//Default username: 'Admin'
const generateMessage = (text, {id, username, room } = {username: 'Admin'}) => {
	return {
		username,
		text,
		createdAt: new Date().getTime()
	}
}

const generateLocationMessage = (username, url) => {
	return {
		username,
		url,
		createdAt: new Date().getTime()
	}
}

module.exports = {
	generateMessage,
	generateLocationMessage
}