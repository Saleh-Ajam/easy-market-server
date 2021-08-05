const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-type-email');


var feedbackSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, 
    feedbacks: [{
        firstname:{
            type: String,
            required: true
        },
        lastname:{
            type: String,
            required: true
        },
        email:{
            type: mongoose.SchemaTypes.Email,
            required: true
        },
        telnum :{
            type: Number,
            required: true
        },
        agree: {
            type: Boolean,
            default: false
        },
        contactType:{
            type: String,
            default: 'Tel.'
        },
        message:{
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

var Feedbacks = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedbacks;