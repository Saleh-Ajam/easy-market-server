const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


const Schema = mongoose.Schema;

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
    }
},{
    timestamps: true
});

var Dishes = mongoose.model('Dish' , dishSchema);

module.exports = Dishes;