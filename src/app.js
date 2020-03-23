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

const {addUser, getUser, getUsersInRoom, removeUser } = require('./users.js')

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
  socket.on('join', ({name, room }) => {
   const { error, user } = addUser({ id: socket.id, name, room});

   if(error) return callback(error);

   socket.emit('message', { user: 'admin', text: `Hello ${user.name} you are now chatting in ${user.room}`});
   socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!`});

   socket.join(user.room);

   callback();

  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).getMaxListeners('message', {user: user.name, text: message});

    callback();
  } );

  socket.on('disconnect', () => {
    console.log('Offline!');
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