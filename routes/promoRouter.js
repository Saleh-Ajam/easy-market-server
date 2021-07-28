const express = require('express');
const bodyParser = require('body-parser');
const Promotions = require('../models/promotions');
const authenticate = require('../authenticate');

promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter.route('/')
.get((req,res, next) =>{
   Promotions.find({})
   .then((promos)=>{
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(promos);
   } , err => next(err)).catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) =>{
    Promotions.create(req.body)
    .then((promo)=>{
        console.log('Promotions created ', promo);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, err => next(err)).catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) =>{
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end('PUT operation is not support on /promotions');
})
.delete(authenticate.verifyUser, (req, res, next) =>{
    Promotions.deleteMany({})
    .then((resp)=>{
        res.stayusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp)
    }, err => next(err)).catch((err) => next(err));
});

promoRouter.route('/:promoId')
.get((req, res, next) =>{
    Promotions.findById(req.params.promoId)
    .then((promo)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    },err => next(err)).catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res, next) =>{
     Promotions.findByIdAndUpdate(req.params.promoId, {$set :req.body}, {new: true})
    .then((promo)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, err => next(err)).catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next)=>{
    res.end('POST operation is not supported on /promotions/' + req.params.promoId);
})
.delete(authenticate.verifyUser, (req, res, next) =>{
    Promotions.findByIdAndDelete(req.params.promoId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    } , err => next(err)).catch(err => next(err));
});

module.exports = promoRouter;