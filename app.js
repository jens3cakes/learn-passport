const Users = require('./models/users');
// require packages
const express = require('express');
const bodyParser = require('body-parser');
// invoke express
const app = express();
// add middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

// add routes
app.get('/', (req, res) => {
  res.send('smoke test');
});

module.exports = app;

// custom authentication check middleware
