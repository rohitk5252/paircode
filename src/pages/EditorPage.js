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
  const socketRef = useRef(null);
  const location = useLocation();
  const {roomId}  = useParams();
  useEffect(()=>{
    const init = async () => {
        socketRef.current = await initSocket();
        socketRef.current.on('connect_error',(err)=>handleErrors(err));
        socketRef.current.on('connect_failed',(err)=>handleErrors(err));

        function handleErrors(e){
          console.log('Socket error', e);
          toast.error('Socket connection failed, Refreshing..');
          reactNavigator('/');
        }

        socketRef.current.emit(ACTIONS.JOIN,{
          roomId,
          username : location.state?.username,
        } );
    };
    init();
  },[]);


  const [clients,setClients] = useState([
    {socketId:1, username: 'Rohit k'},
    {socketId:2, username: 'Khiladi'},
    {socketId:3, username: 'Gamer'},
    {socketId:4, username: 'Mimir'},
  ]);

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