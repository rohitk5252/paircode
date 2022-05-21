import {React, useEffect} from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';


const Editor = () => {
useEffect(()=>{
    async function init(){
        console.log('i ran......');
        Codemirror.fromTextArea(document.getElementById('realtimeEditor'),{
            mode: {name:'javascript',json: true},
            theme: 'dracula',
            autoCloseTags: true,
            autoCloseBrackets: true,
            lineNumbers: true,
        })
    }
    init();
},[]);

  return <textarea id="realtimeEditor"></textarea>
}

export default Editor