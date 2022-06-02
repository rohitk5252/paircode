const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);

const ACTIONS = require('./src/Actions');

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

    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
       io.to(socketId).emit(ACTIONS.SYNC_CODE, { code });
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