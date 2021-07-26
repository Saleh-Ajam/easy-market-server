const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


const Schema = mongoose.Schema;
var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    author:  {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const dishSchema  = new Schema({
    name: {
        unique: true,
        type: String,
        required: true
    },
    description: {
        type: String,
        rquired : true,
    },
    image: {
        type: String,
        required: true,
    },
    category:{
        type: String,
        reuired: true
    },
    label: {
        type: String,
        default: ''
    },
    price:{
        type: Currency,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments:[commentSchema]
},{
    timestamps: true
});

var Dishes = mongoose.model('Dish' , dishSchema);

module.exports = Dishes;