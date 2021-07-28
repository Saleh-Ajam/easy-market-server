var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
// if you use local passport without mongoose plugin you need to writr auth function
// like basic authentication function
exports.local = passport.use(new LocalStrategy(User.authenticate()));
// to take care what is required for sessions inpassport
// remember that we have user in req.user now
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());;