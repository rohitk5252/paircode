const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');

const io = new Server(server);

const userSocketMap = {};

io.on('connection',(socket)=>{
    console.log('Socket connected',socket.id);
    socket.on(ACTIONS.JOIN,({roomId,username})=>{
       userSocketMap[socket.id] = username;
    })
})


const PORT = process.env.PORT || 5000;
server.listen(PORT,()=> console.log(`Listening on port ${PORT}`));