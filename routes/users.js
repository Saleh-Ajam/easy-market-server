var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate');

router.use(bodyParser.json());
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  // the mongoose plugin provide us with a method called register on the user schema and model
  User.register( new User({username: req.body.username}), req.body.password,(err, user) =>{
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err})
    }else{
      passport.authenticate('local')(req, res, () =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  })
});

// here we expect to include the username and password in the body unlike before in the header
router.post('/login',passport.authenticate('local'),(req,res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true,token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req,res,next) => {
  if(req.session) {
    req.session.destroy();// destroy the session on the server side
    res.clearCookie('session-id'); // ask the client to remove the cookie
    res.redirect('/');
  }else {
    var err = new Error('You are not logged in!');
    err.status = 403;  // The HTTP 403 Forbidden client error status response code indicates that the server understood the request but refuses to authorize it
    next(err);
  }
});

module.exports = router;
