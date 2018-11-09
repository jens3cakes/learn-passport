const Users = require('./models/users');
// require packages
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// invoke express
const app = express();
// add middleware

// app.use((req,res,next)=>{
//   console.log('req',req)
//   next()
// })console.log all 
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user.id)
});

passport.deserializeUser((userId, cb) => {
  Users.findById(userId, cb)//this might be different,it is database ORM specific
});
//done is a callback function
passport.use(new LocalStrategy((username, password, done) => {
  //this part is unique to the app
  Users.findUser({ username: username }, (err, user) => {
    if (err) { return done(err) };
    if (!user) {
      return done(null, false, { message: `Incorrect username/password` });
    };
    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password/username' });
    };
    return done(null, user);
  });
}));

// add routes
app.get('/', (req, res) => {
  res.send('smoke test');
});

app.get('/secret', isAuthenticated, (req, res) => {
  const { user } = req;
  res.send(`You have access to the secret: ${user.id} ${user.username}`)
});

app.get('/admin', hasAdminAccess, (req, res)=>{
  const {user} = req
  res.send(`Welcome to the admin section ${user.name} ${user.role}`)
});

app.get('/logout', (req, res)=>{
  req.logout();
  res.redirect('/login.html');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/secret',
  failureRedirect: '/login.html'
}));

module.exports = app;

// custom authentication check middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login.html');
};

function hasAdminAccess(req, res, next){
  if(req.isAuthenticated()){
    if(req.user.role === 'admin'){
      return next;
    }
    return res.redirect('/secret');
  }
  res.redirect('/login.html');
}

