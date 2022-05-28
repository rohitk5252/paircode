const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);

const ACTIONS = require('./src/Actions');

// 2:25:00 video 
// about getting clients list 
const userSocketMap = {};

function getAllConnectedClients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId)=>{
        return {
            socketId,
            username : userSocketMap[socketId],
        };
    });
}
io.on('connection', (socket)=>{
    // 
    
 console.log('Socket connected',socket.id);
    
    socket.on('join',({roomId,username})=>{
       userSocketMap[socket.id] = username;
       socket.join(roomId);
        
       const clients = getAllConnectedClients(roomId);
       console.log(clients);
       clients.forEach(({socketId}) =>{
           io.to(socketId).emit(ACTIONS.JOINED, {
               clients,
               username,
               socketId : socket.id,
           });
       });
       
    });

    socket.on('disconnecting', () =>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) =>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });

        delete userSocketMap[socket.id];
        socket.leave();
    });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT,()=> console.log(`Listening on port ${PORT}`));