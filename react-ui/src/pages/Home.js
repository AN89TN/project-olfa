import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { userLoginAsync, userSigninAsync } from './../asyncActions/authAsyncActions';


function Home(props) {
  const authObj = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userLoginLoading, loginError, userSigninLoading } = authObj;


  const authErr = () => {
    if (loginError)
    return loginError
  }
  
  const username = useFormInput('');
  const password = useFormInput('');
    const handleLogin =  () => {
        dispatch(userLoginAsync(username.value, password.value)) 
          .then (res => {navigate('/content')})
      }

    const handleSignin =  () => {
        dispatch(userSigninAsync(username.value, password.value)) 
           .then (res => {navigate('/content')})
          } 
  
return ( 
        <header className="App-header">
        <div><h1><strong>Welcome {username.value} to One List For All</strong></h1></div>
        <div>
        <p>This app is meant to be a list of all your lists<br/> but in order to use it and save your data please create your profile<br/> with Sign in button (no email needed) or Log in with an existing one.</p>
      </div>
        <div>
            <label>Set your name: </label>
            <div className="input-form-group">
				    <label className="form-input-underlined">
            <input type="text" {...username} maxLength="20" required />
				    <span className="form-input-label">Enter Username</span>
		        </label>
            </div>
			  </div>
        <div>
            <label>Set your password: </label>
            <div className="input-form-group">
				    <label className="form-input-underlined">
            <input type="password" {...password} maxLength="20" required />
            <span className="form-input-label">Enter Password</span>
		        </label>
            </div>
        </div>
        <div>
            <input className='btn'
              type="button"
              value={userLoginLoading ? 'Loading...' : 'Log in'}
              onClick={handleLogin}
              disabled={userLoginLoading} />
            <input className='btn'
              type="button"
              value={userSigninLoading ? 'Loading...' : 'Sign in'}
              onClick={handleSignin}
              disabled={userSigninLoading} />
        </div>
            
            {authErr() && <div style={{ color: '#BE3144', marginTop: 10 }}>{authErr()}</div>}
      </header>
    );
}

const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue);

  const handleChange = e => {
    setValue(e.target.value);
  }
  return {
    value,
    onChange: handleChange
  }
}


export default Home;