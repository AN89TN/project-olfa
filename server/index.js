require('dotenv').config();
 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require ('mongoose');
 
const {
  refreshTokens, COOKIE_OPTIONS, generateToken, generateRefreshToken,
  getCleanUser, verifyToken, clearTokens, handleResponse,
} = require('./utils');
 
const app = express();
const port = process.env.PORT || 5000;


mongoose.connect("mongodb://localhost:27017/olfaDB", {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = {
    userId: String,
    password: String,
    name: String,
    username: String,
    isAdmin: String,
    data: Array
};

const Data = mongoose.model("datas", Schema);
// list of the users to be consider as a database for example
const userList = []

// enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // url of the frontend application
  credentials: true // set credentials true for secure httpOnly cookie
}));
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
 
// use cookie parser for secure httpOnly cookie
app.use(cookieParser(process.env.COOKIE_SECRET));
 
 
// middleware that checks if JWT token exists and verifies if it does exist.
// In all private routes, this helps to know if the request is authenticated or not.
const authMiddleware = function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return handleResponse(req, res, 401);
 
  token = token.replace('Bearer ', '');
 
  // get xsrf token from the header
  const xsrfToken = req.headers['x-xsrf-token'];
  if (!xsrfToken) {
    return handleResponse(req, res, 403);
  }
 
  // verify xsrf token
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  if (!refreshToken || !(refreshToken in refreshTokens) || refreshTokens[refreshToken] !== xsrfToken) {
    return handleResponse(req, res, 401);
  }
 
  // verify token with secret key and xsrf token
  verifyToken(token, xsrfToken, (err, payload) => {
    if (err)
      return handleResponse(req, res, 401);
    else {
      req.user = payload; //set the user to req so other routes can use it
      next();
    }
  });
}


// create new user
 app.post('/users/signin', function (req, res) {
  const user = req.body.username;
  const pwd = req.body.password;
  const isTrue = userList.some(x => x.username === user); //for checking if user alredy exist
  
  if (!user || !pwd) {
    return handleResponse(req, res, 400, null, "Username and Password required.");
  }

  if (isTrue === true) {
    return handleResponse(req,res, 400, null, "Username Alredy Exist.")
  }
  const idrng = Math.floor(Math.random() * 1000000000000); //change it for DB id

  newUser = {
    userId: idrng,
    password: pwd,
    name: user,
    username: user,
    isAdmin: true,
    data: []
  };

  userList.push(newUser);

  const userData = userList.find(x => x.username === user && x.password === pwd);

  const userObj = getCleanUser(userData);
 
  const tokenObj = generateToken(userData);
 
  const refreshToken = generateRefreshToken(userObj.userId);
 
  refreshTokens[refreshToken] = tokenObj.xsrfToken;
 
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.cookie('XSRF-TOKEN', tokenObj.xsrfToken);

  return handleResponse(req, res, 200, {
    user: userObj,
    token: tokenObj.token,
    expiredAt: tokenObj.expiredAt
  });
});



  
 
// validate user credentials
app.post('/users/login', function (req, res) {
  const user = req.body.username;
  const pwd = req.body.password;
 
  // return 400 status if username/password is not exist
  if (!user || !pwd) {
    return handleResponse(req, res, 400, null, "Username and Password required.");
  }
 
  const userData = userList.find(x => x.username === user && x.password === pwd);
  // return 401 status if the credential is not matched
  if (!userData) {
    return handleResponse(req, res, 401, null, "Username or Password is Wrong.");
  }
 
  // get basic user details
  const userObj = getCleanUser(userData);
 
  // generate access token
  const tokenObj = generateToken(userData);
 
  // generate refresh token
  const refreshToken = generateRefreshToken(userObj.userId);
 
  // refresh token list to manage the xsrf token
  refreshTokens[refreshToken] = tokenObj.xsrfToken;
 
  // set cookies
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.cookie('XSRF-TOKEN', tokenObj.xsrfToken);
 
  return handleResponse(req, res, 200, {
    user: userObj,
    token: tokenObj.token,
    expiredAt: tokenObj.expiredAt
  });
});
 
 
// handle user logout
app.post('/users/logout', (req, res) => {
  clearTokens(req, res);
  return handleResponse(req, res, 204);
});
 
 
// verify the token and return new tokens if it's valid
app.post('/verifyToken', function (req, res) {
 
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  if (!refreshToken) {
    return handleResponse(req, res, 204);
  }
 
  // verify xsrf token
  const xsrfToken = req.headers['x-xsrf-token'];
  if (!xsrfToken || !(refreshToken in refreshTokens) || refreshTokens[refreshToken] !== xsrfToken) {
    return handleResponse(req, res, 401);
  }
 
  // verify refresh token
  verifyToken(refreshToken, '', (err, payload) => {
    if (err) {
      return handleResponse(req, res, 401);
    }
    else {
      const userData = userList.find(x => x.userId === payload.userId);
      if (!userData) {
        return handleResponse(req, res, 401);
      }
 
      // get basic user details
      const userObj = getCleanUser(userData);
 
      // generate access token
      const tokenObj = generateToken(userData);
 
      // refresh token list to manage the xsrf token
      refreshTokens[refreshToken] = tokenObj.xsrfToken;
      res.cookie('XSRF-TOKEN', tokenObj.xsrfToken);
 
      // return the token along with user details
      return handleResponse(req, res, 200, {
        user: userObj,
        token: tokenObj.token,
        expiredAt: tokenObj.expiredAt
      });
    }
  });
 
});

//handle data Arguments
app.post("/user/updateArgument", authMiddleware, function (req, res){
  const argument = req.body.argument;
  const user = req.body.user.username;
  const index = userList.findIndex(x => x.username === user);
  const idrng = Math.floor(Math.random() * 1000000000000); //change it for DB id
  newArgument = {
    id: idrng,
    listName: argument,
    node: []
  };
userList[index].data.unshift(newArgument);

return handleResponse(req, res, 200)
});

//handle data Lists
app.post("/user/updateList", authMiddleware, function (req, res){
  const list = req.body.list;
  const user = req.body.user.username;
  const id = req.body.id
  const index = userList.findIndex(x => x.username === user);
  const index2 = userList[index].data.findIndex(x => x.id === id)
  const idrng = Math.floor(Math.random() * 1000000000000); //change it for DB id
  newList = {
    id: idrng,
    list: list,
    isActive: false,
    node: []
  };

userList[index].data[index2].node.push(newList);
return handleResponse(req, res, 200)
});

//handle data Sublists
app.post("/user/updateSublist", authMiddleware, function (req, res){
  const sublist = req.body.sublist;
  const user = req.body.user.username;
  const id = req.body.fatherId
  const newId = req.body.id
  const index = userList.findIndex(x => x.username === user);
  const index2 = userList[index].data.findIndex(x => x.id === id)
  const array = userList[index].data[index2].node
  const idrng = Math.floor(Math.random() * 1000000000000); //change it for DB id
  newSublist = {
        id: idrng,
        list: sublist,
        isActive: false
  };

function findUpdate(array, id) {
  newSublist = {
    id: idrng,
    list: sublist,
    isActive: false
};
  array.forEach(function(elem) {
    if (elem.id === id) {
      // push value to children of that object
      elem.node.push(newSublist)
    } else {
       //check if children is an array and if it is empty
      if (Array.isArray(elem.node) && elem.node.length > 0) {
        //call the same function with the new arra
        findUpdate(elem.node, id)
      }
    }
  });


} 

findUpdate(array, newId);

return handleResponse(req, res, 200)
});

//handle data Delete
app.post("/user/Delete", authMiddleware, function (req, res){
  const user = req.body.user.username;
  const id = req.body.id
  const index = userList.findIndex(x => x.username === user);
  const array = userList[index].data

  function findDelete(array, id) {
    array.forEach(function(elem) {
      let item = array.findIndex(item => item.id === id)
      if (elem.id === id) {
        // delete value
        array.splice(item, 1)
      } else {
         //check if children is an array and if it is empty
        if (Array.isArray(elem.mainNode) && elem.mainNode.length > 0) {
          //call the same function with the new arra
          findDelete(elem.mainNode, id)
        } else {
          if (Array.isArray(elem.node) && elem.node.length > 0) {
            //call the same function with the new arra
            findDelete(elem.node, id)
          }
        }
      }
    });
  
  
  } 

  findDelete(array, id);
  
return handleResponse(req, res, 200)
});

// get list of the users
app.get('/users/getList', authMiddleware, (req, res) => {
  const id = userList.find(({ userId }) => userId === req.user.userId);
  const data = id.data
  
  return handleResponse(req, res, 200, { data: data });
});

app.get('*', function(req, res) {
  res.send("Error 404");
});
 
 
app.listen(port, () => {
  console.log('Server started on: ' + port);
});