const express = require('express');
const path = require('node:path');
const http = require('node:http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ['websocket'],
  pingTimeout: 60 * 1000,
  upgradeTimeout: 30 * 1000,
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  }
});

app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../client/index.html')));

io.on('connection', socket => {
  console.log(`${socket.id} connect ${socket.recovered ? '(recovered)' : ''}`);

  const id = setInterval(() => socket.emit("ping", new Date().toISOString()), 1000);

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnect ${socket.recovered ? '(recovered)' : ''}`);
    clearTimeout(id);
  })
});

server.listen(3333, () => console.log('listening on *:3333'));