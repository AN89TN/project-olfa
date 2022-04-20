import React, { useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Navigate, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Home from "./pages/Home";
import Content from "./pages/Content";
import Footer from "./pages/Footer";
import './App.css';
import { verifyTokenAsync } from './asyncActions/authAsyncActions';

function App() {
  const authObj = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const newLocal = useCallback(() => {
  }, []);
  const verifyToken = newLocal;

  const { authLoading, isAuthenticated } = authObj;

  // verify token on app load
  useEffect(() => {
    dispatch(verifyTokenAsync());
  }, [dispatch, verifyToken]);

  // checking authentication
  if (authLoading) {
    return <div className="content">Checking Authentication...</div>
  }
  

return (
  <div className="App">
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} isAuthenticated={isAuthenticated} />
        <Route path="/content" element={isAuthenticated ? <Content /> : <Navigate replace to='/home'/> } />
        <Route path="/*" element={<Navigate replace to={isAuthenticated ? '/content' : '/home'} />} />
      </Routes>
        <Footer />

    </Router>
    </div>
  );
}

export default App;
