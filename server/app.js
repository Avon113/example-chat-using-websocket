const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4004"],
    methods: ['GET', 'POST']
  }
});

io.use(async (socket, next) => {
  const username = socket.handshake.auth?.username
  if(!username) return next(new Error('unknown user'))
  socket.username = username

  next()
});

io.on('connection', (socket) => {
  const users = []

  for(let [id, socket] of io.of('/').sockets) {
    users.push({
      userId: id,
      username: socket.username
    })
  }
  socket.emit('getUsers', users)

  socket.broadcast.emit('userJustConnected', {
    userId: socket.id,
    username: socket.username
  })

  socket.on('privateMessage', ({message, to}) => {
    socket.to(to).emit('privateMessageToReceiver', {
      message,
      from: socket.id
    })
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('userDisconnect', socket.id)
  });
});

server.listen(8080, () => {
  console.log('listening on *:8080');
});