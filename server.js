const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
const ACTIONS = require('./src/Actions');
//middleware 
// for deployment 
app.use(express.static('build'));
app.use((req, res, next)=>{
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

const userSocketMap = {};
let id = null ;
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
    id = socket.id;
    console.log('Socket connected',socket.id);
    
    socket.on(ACTIONS.JOIN,({roomId,username})=>{
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
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
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


const PORT = process.env.PORT || 5001;
server.listen(PORT,()=> console.log(`Listening on port ${PORT}`));