import {
    verifyTokenStarted, verifyUserSuccess, verifyTokenEnd,
    userLoginStarted, userLoginFailure, userLogout, userSigninStarted, userSigninFailure
  } from "../actions/authActions";
  import { verifyTokenService, userLoginService, userLogoutService, userSigninService } from '../services/auth';
  
  // handle verify token
  export const verifyTokenAsync = (silentAuth = false) => async dispatch => {
    dispatch(verifyTokenStarted(silentAuth));
  
    const result = await verifyTokenService();
  
    if (result.error) {
      dispatch(verifyTokenEnd());
      if (result.response && [401, 403].includes(result.response.status))
        dispatch(userLogout());
      return;
    }
  
    if (result.status === 204)
      dispatch(verifyTokenEnd());
    else
      dispatch(verifyUserSuccess(result.data));
  }
  
  // handle user login
  export const userLoginAsync = (username, password) => async dispatch => {
    dispatch(userLoginStarted());
  
    const result = await userLoginService(username, password);
  
    if (result.error) {
      dispatch(userLoginFailure(result.response.data.message));
      return;
    }
  
    dispatch(verifyUserSuccess(result.data));
  }
  
  // handle user logout
  export const userLogoutAsync = () => dispatch => {
    dispatch(userLogout());
    userLogoutService();
  }

  // handle user signin
  export const userSigninAsync = (username, password) => async dispatch => {
    dispatch(userSigninStarted());
  
    const result = await userSigninService(username, password);
  
    if (result.error) {
      dispatch(userSigninFailure(result.response.data.message));
      return;
    }
  
    dispatch(verifyUserSuccess(result.data));
  }