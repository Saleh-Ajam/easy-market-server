var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');

router.use(bodyParser.json());
/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) =>{res.sendStatus(200);})
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,function(req, res, next) {
  
    User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }, err => next(err)).catch(err => next(err));
    
  
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  // the mongoose plugin provide us with a method called register on the user schema and model
  User.register( new User({username: req.body.username}), req.body.password,(err, user) =>{
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err})
    }else{
      if(req.body.firstname){
        user.firstname = req.body.firstname;
      } 
      if(req.body.lastname){
        user.lastname = req.body.lastname;
      }
      user.save((err, user) => {
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return;
        }
        passport.authenticate('local')(req, res, () =>{
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});

// here we expect to include the username and password in the body unlike before in the header

router.post('/login', cors.corsWithOptions, (req, res, next) => {

  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});          
      }

      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Login Successful!', token: token});
    }); 
  }) (req, res, next);
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


router.get('/checkJWTtoken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)
      return next(err);
    
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, user: user});

    }
  }) (req, res);
});

module.exports = router;
