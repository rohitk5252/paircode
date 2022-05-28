import React, { useState , useRef, useEffect} from 'react'
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';


// 2 ; 47 // 2 ; 47 // 2 ; 47 
// 2 ; 47 // 2 ; 47 
// 2 ; 47 // 2 ; 47 // 2 ; 47 
// 2 ; 47 // 2 ; 47 // 2 ; 47 


const EditorPage = () => {
  console.log('i ran...Editor Page...');

  const reactNavigator = useNavigate();
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
        console.log(clients,"cl");

        socketRef.current.on(
          ACTIONS.JOINED, 
          ({clients,username,socketId}) => {
          if(username !== location.state?.username){
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }

          setClients(clients);
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
  },[]); 



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
        <button className="btn copyBtn">Copy Room</button>
        <button className="btn leaveBtn">Leave</button>
      </div>
      <div className="editorWrap">
         <Editor />
      </div>
    </div>
  )
}

export default EditorPage