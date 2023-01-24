#!/usr/bin/env node

/**
 * Module dependencies.
 */




const app = require('../app');
const debug = require('debug')('chat:server');
const http = require('http');

const Message = require('../models/message.models');

//* CONFIG.ENV-------LO ANTES POSIBLE
require('dotenv').config();

//*CONFIG BD
require('../config/db');




/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

//*config socket.io
const io = require('socket.io')(server);

//Hay quedectar eventos. los eventos pueden ser propios o en este caso de io.
io.on('connection', (socket) => {
  console.log('se ha conectado un nuevo cliente');

  socket.broadcast.emit('chat_mensajito', {
    text: 'Se ha conectado un nuevo usuario',
    user: { username: 'INFO' }
  }); //emitimos

  io.emit('chat_users', io.engine.clientsCount);

  socket.on('chat_mensajito', async (data) => { //aqui me he suscrito a un evento.
    //guardar datos en bd
    //data contiene: menssage, username, user_id
    const message = await Message.create({
      text: data.message,
      user: data.user_id
    });

    io.emit('chat_mensajito', await message.populate('user'));//! lo mismo que me esta entrando lo revoto a los demas.
  });

  socket.on('disconnect', (reason) => {
    console.log('REASON', reason);
    io.emit('chat_mensajito', {
      text: 'se ha desconectado un usuario',
      user: { username: 'INFO' }
    });
    io.emit('chat_users', io.engine.clientsCount);
  });

}); // oye cuando dectectes este evento lanzame esto .....


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
