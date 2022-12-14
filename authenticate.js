var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');


var config = require('./config');

// if you use local passport without mongoose plugin you need to writr auth function
// like basic authentication function
exports.local = passport.use(new LocalStrategy(User.authenticate()));
// to take care what is required for sessions inpassport
// remember that we have user in req.user now
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600}); // in seconds => hour
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,(jwt_payload, done)=>{
    console.log('JWT payloda: ', jwt_payload);
    User.findOne({_id: jwt_payload._id}, (err, user) =>{
        if (err){
            return done(err, false);
        }else if(user) {
            return done(null,user);
        }else{
            return done(null, false);
        }
    });
}));

exports.verifyUser = passport.authenticate('jwt', {session: false}); // this means that we will never create session in this case
exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin){
        return next();
    }else{
        var err  = new Error('You are not autherized to perform this operation!');
        err.status= 403;
        next(err);
    }
}