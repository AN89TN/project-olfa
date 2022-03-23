const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();


  app.get('/api', function (req, res) {
    res.send('{"message":"Hello from the custom server your data is here!"}');
  });

  app.get('/app', function (req, res) {
    res.send('{"message":"You press the button"}');
  });

  app.get('*', function(req, res) {
    res.send("Error 404");
  });

  app.listen(PORT, function () {
    console.log("API up and running on port " + PORT);
  });
