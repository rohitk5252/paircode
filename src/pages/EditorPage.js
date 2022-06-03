import React, { useState , useRef, useEffect} from 'react'
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';


const EditorPage = () => {
  console.log('i ran...Editor Page...');

  const reactNavigator = useNavigate();
  const codeRef = useRef(null);
  const socketRef = useRef(null);
  const location = useLocation();
  const {roomId}  = useParams();
  const [clients,setClients] = useState([]);

  useEffect(()=>{
    const init = async () => {
        socketRef.current = await initSocket();
        socketRef.current.on('connect_error',(err) => handleErrors(err));
        socketRef.current.on('connect_failed',(err) => handleErrors(err));

        function handleErrors(e){
          console.log('Socket error', e);
          toast.error('Socket connection failed, Refreshing..');
          reactNavigator('/');
        }

        socketRef.current.emit(ACTIONS.JOIN,{
          roomId,
          username : location.state?.username,
        } );

        // Listening For Joined Event
        socketRef.current.on(
          ACTIONS.JOINED, 
          ({clients,username,socketId}) => {
          if(username !== location.state?.username){
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }

          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
        );
        // Listening for disconnected
        socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username}) =>{
            toast.success(`${username} left the room`);
            setClients((prev) =>{
              return prev.filter(client => client.socketId !== socketId);
            });
        });
    };
    init();

    // Cleaning Function 
    return function cleanup() {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);      
    };

  },[]); 

  // TODO to BUG 
  async function copyRoomId() {
    const val = roomId;
    try {
        await navigator.clipboard.writeText(val);
        toast.success('Room ID copied to clipboard');
    } catch (err) {
        toast.error('Could not copy room ID');
        console.log('----',err);

    }
  }

  function leaveRoom(){
    reactNavigator('/');
  }

  if(!location.state){
    return <Navigate/>
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img src="/pair-code.png" alt="" className="logoImage" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {
              clients.map((client)=>(
                <Client key={client.socketId} username={client.username}/>
              ))
            }
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>Copy Room</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
      </div>
      <div className="editorWrap">
         <Editor socketRef={socketRef} 
                 roomId={roomId} 
                 onCodeChange={(code) => {
                     codeRef.current = code;
           }}/>
      </div>
    </div>
  )
}

export default EditorPage