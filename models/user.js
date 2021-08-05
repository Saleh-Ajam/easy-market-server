var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
  

var User = new Schema({
    firstname:{
        type: String,
        required : true
    },
    lastname:{
        type: String,
        required : true
    },
    admin: {
        type: Boolean,
        default: false
    }, 
    image :{
        type: String,
        default : '/assets/images/defaultAvatar.png'
    }
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);