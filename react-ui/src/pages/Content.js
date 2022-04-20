import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import axios from "axios";

import { verifyTokenAsync, userLogoutAsync } from "./../asyncActions/authAsyncActions";
import { userLogout, verifyTokenEnd } from "./../actions/authActions";

import { setAuthToken } from './../services/auth';
import { getUserListService } from './../services/user';

const API_URL = 'http://localhost:5000';

function Content() {
  const dispatch = useDispatch();
  const authObj = useSelector(state => state.auth);
  const { user, token, expiredAt } = authObj;
  

  const [userList, setUserList] = useState([]);
  const [argument, setArgument] = useState("");

  //Argument Form
  const sendArgument = async () => {
    await axios.post(`${API_URL}/user/updateArgument`,  {argument, user});
    getUserList();
    setArgument("")
  }

  // handle click event of the logout button
  const handleLogout = () => {
    dispatch(userLogoutAsync());
  }

  // get user list
  const getUserList = async () => {
    const result = await getUserListService();
    if (result.error) {
      dispatch(verifyTokenEnd());
      if (result.response && [401, 403].includes(result.response.status))
        dispatch(userLogout());
      return;
    }
    
      setUserList(result.data.data);
  }

   // set timer to renew token
   useEffect(() => {
    setAuthToken(token);
    const verifyTokenTimer = setTimeout(() => {
      dispatch(verifyTokenAsync(true));
    }, moment(expiredAt).diff() - 10 * 1000);
    return () => {
      clearTimeout(verifyTokenTimer);
    }
  }, [dispatch, expiredAt, token])

   // get user list on page load
   useEffect(() => {
    const getUserList = async () => {
      const result = await getUserListService();
      if (result.error) {
        dispatch(verifyTokenEnd());
        if (result.response && [401, 403].includes(result.response.status))
          dispatch(userLogout());
        return;
      }
      
      setUserList(result.data.data); 
    }
    getUserList();
  }, [dispatch]);


  
//get your lists
function Node(props) {
  const [sublist, setSublist] = useState("");
  const [showPanel, togglePanel] = useState(false)
  const [showDelete, toggleDelete] = useState(false)

  const fatherId = props.father
  const id = props.id

  const sendSublist = async () => {
    await axios.post(`${API_URL}/user/updateSublist`,  {sublist, user, id, fatherId});
    getUserList();
    setSublist("")
  }
  const Delete = async () => {
    await axios.post(`${API_URL}/user/Delete`,  {user, id});
    getUserList();
  }

      let nodes = null;
      
      if (props.children) {

      nodes = props.children.map(node => { return (

        <Node
        key={node.id}
        id={node.id}
        value={node.list} 
        children={node.node}
        father={props.father}
        isActive={node.isActive}
        />

        )})}

return( 
      <div className='List-container'>
        <li key={props.id}>
        <input type="checkbox" onChange={() => toggleDelete(!showDelete)} defaultChecked={props.isActive} />
        <label>{props.value}</label>
        <input className='List-cmdadd' type="button" onClick={() => togglePanel(!showPanel)} value="⚙️" />
        <br/>
        {showPanel && (
        
          <form onClick={(e) => e.preventDefault()}>
          <input className='Text-input' type="text" value={sublist} onChange={(e) => setSublist(e.target.value)} placeholder= "Enter New List" maxLength="50" required />
          <input className='List-cmdadd' type="submit" onClick={sendSublist} value="✒️" disabled={sublist === ""} />
          <input className='List-cmddel' type="button" onClick={Delete} disabled={showDelete === false} value="❌" />
          </form>
          
        )}
        </li>

        { nodes ?
          <ul>{nodes}</ul>
        : null }


      
      </div>
      );
    
    }

//get your argument box
function Arguments(props) {
  const [list, setList] = useState("");
  const id = props.id
  const sendList = async () => {
    await axios.post(`${API_URL}/user/updateList`,  {list, user, id});
    getUserList();
    setList("")
  }
  const Delete = async () => {
    await axios.post(`${API_URL}/user/Delete`,  {user, id});
    getUserList();
  }

      return (
        <div className="table">
        <div className='table-header'>
        {props.value}
        <br />
        <br />
        <br />
        <form onClick={(e) => e.preventDefault()}>
        <input className='Text-input' type="text" value={list} onChange={(e) => setList(e.target.value)} placeholder= "Enter New List" maxLength="50" required />
        <input className='Text-input' type="submit" disabled={list === ""} onClick={sendList} value="Add a New Point" />
        </form>
        </div>
        <ul>
        {props.children.map(list => {return (

          <Node
          key={list.id}
          id={list.id}
          value={list.list} 
          children={list.node}
          father={props.id}
          isActive={list.isActive}
          />

        )})}  
        </ul>
        <div className='table-footer'>
        <input className='List-cmddel' type="button" onClick={Delete} value="❌" />
        
        </div>
        </div>
      );
    }

return (
<div className='App-content'>
<div className='Welcome'>
Welcome {user.name}!
</div>
<br />
<br />
<br />
<div className='New-argument'>
Set your own Arguments:
<br/>
<form onClick={(e) => e.preventDefault()}>
<input className='Text-input' type="text" value={argument} onChange={(e) => setArgument(e.target.value)} placeholder= "Enter New Argument" maxLength="50" required />
<input className='Text-input' type="submit" disabled={argument === ""} onClick={sendArgument} value="Add a New Argument" />
</form>
<br /><br />
</div>

      <div className='main-container'>
      
      {userList.map(argument => {return (
        
          <Arguments 
          key={argument.id}
          id={argument.id}
          value={argument.listName}
          children={argument.mainNode}
          />

      );})}

      </div>
      <div >
      
      <input className='btn' type="button" onClick={handleLogout} value="Logout" /><br /><br />
      
      </div>
</div>
)}

export default Content;