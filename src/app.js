require('dotenv').config()
const PORT = process.env.PORT || 5000
const socketio = require('socket.io');
const http = require('http');
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const app = express()
const router = require('./router');

const {addUser, getUser, getUsersInRoom, removeUser } = require('./users-helpers.js')

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
  socket.on('join', ({name, room }, callback) => {
   const { error, user } = addUser({ id: socket.id, name, room});

   if(error) return callback(error);

   socket.emit('message', { user: 'admin', text: `Hello ${user.name} you are now chatting in ${user.room}`});
   socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!`});

   socket.join(user.room);

   io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})

   callback();

  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', {user: user.name, text: message});
    io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});

    callback();
  } );

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user){
      io.to(user.room).emit('message', { user:'admin', text: `Goodbye, ${user.name}!`})
    }
  })

});

server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));





const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

    app.use(function errorHandler(error, req, res, next) {
          let response
          if (NODE_ENV === 'production') {
            response = { error: { message: 'server error' } }
          } else {
            console.error(error)
            response = { message: error.message, error }
          }
          res.status(500).json(response)
        })

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use(router);

module.exports = app