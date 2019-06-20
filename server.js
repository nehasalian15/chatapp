const express = require('express')
const app = express()
const uuid = require('uuid/v4')
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)

var users = []
var connections = []

server.listen(process.env.PORT || 3000)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.sockets.on('connection', (socket) => {
  connections.push(socket)

  socket.on('disconnect', (data) => {
    users.splice(users.indexOf(socket.username), 1)
    connections.splice(connections.indexOf(socket), 1)
    updateUsernames()
  })

  // send message
  socket.on('send_message', (data) => {
    io.sockets.emit('new_message', {msg: data, user: socket.user})
  })

  // new user
  socket.on('create_user', (data, callback) => {
    callback(true)
    let user = {
      username: data,
      uniqueId: uuid()
    }
    socket.user = user
    users.push(user)
    updateUsernames()
  })

  function updateUsernames () {
    io.sockets.emit('users', users)
  }
})
