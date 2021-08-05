const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorites');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,  authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('products')
    .populate('user')
    .then((favorites)=>{
        res.statusCode =200;
        res.setHeader('Content-Type','application/json');
        res.json(favorites);
    }, err => next(err)).catch(err => next(err));
})
.post(cors.cors, authenticate.verifyUser,  (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(favorite != null){
            for(var i = req.body.length-1 ; i>=0 ; i--){
                
                const found =  favorite.products.find(element => element == req.body[i]._id);
                if(!found){
                    favorite.products.push(req.body[i]._id);
                    favorite.save()
                    .then((favorite) => {
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('products')
                        .then((favorite) =>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    });
                }else{
                    res.statusCode = 403;
                    res.setHeader('Content-Type','text/plain')
                    res.end('the product: '+ req.body[i]._id +' is already exists!');
                }
            }

        }else{ 
            Favorites.create({user: req.user._id})
            .then((favorite) =>{
                for(var i = req.body.length-1 ; i>=0 ; i--){
                    const found =  favorite.products.find(element => element == req.body[i]._id);
                    if(!found){
                        favorite.products.push(req.body[i]._id);
                        favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('products')
                            .then((favorite) =>{
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                        });
                    }else{
                        res.statusCode = 403;
                        res.setHeader('Content-Type','text/plain')
                        res.end('the product: '+ req.body[i]._id +' is already exists!');
                    }
                }
            });
        }
    }, err => next(err)).catch(err => next(err));
    
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.end('PUT operation is not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(favorite != null){
            Favorites.deleteOne({user: req.user._id})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, err => next(err)).catch(err => next(err));
        }else{
            res.statusCode = 404;
            res.setHeader('Content-Type','text/plain')
            res.end('there is no favorites for this user');
        }
        
    } , err => next(err)).catch(err => next(err));
   
});


favoriteRouter.route('/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) =>{
        if(!favorites){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }else{
            if(favorites.products.indexOf(req.params.productId) < 0){
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }
    }, err => next(err)).catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(favorite != null){
            const found =  favorite.products.find(element => element == req.params.productId);
            if(!found){
                favorite.products.push(req.params.productId);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('products')
                            .then((favorite) =>{
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                });
            }else{
                res.statusCode = 403;
                res.setHeader('Content-Type','text/plain')
                res.end('the product is already exists!');
            }
        }else{ 
            Favorites.create({user: req.user._id})
            .then((favorite) =>{
                favorite.products.push(req.params.productId);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('products')
                        .then((favorite) =>{
                             res.statusCode = 200;
                             res.setHeader('Content-Type', 'application/json');
                             res.json(favorite);
                        })
                });
            });
        }
    }, err => next(err)).catch(err => next(err));

})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(favorite != null){
            const found =  favorite.products.find(element => element == req.params.productId);
            if(found){
                const index = favorite.products.indexOf(req.params.productId);
                if (index > -1) {
                    favorite.products.splice(index, 1);
                    favorite.save().then((favorite) => {
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('products')
                        .then((favorite) =>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    } , err => next(err)).catch(err => next(err));
                }else{
                    res.statusCode = 404;
                    res.setHeader('Content-Type','text/plain')
                    res.end('Product ' + req.params._id+' is not in your favorites!');
                }
               
                
            }else{
                res.statusCode = 404;
                res.setHeader('Content-Type','text/plain')
                res.end('this product is not exists !');
            }
        }else{
            res.statusCode = 404;
            res.setHeader('Content-Type','text/plain')
            res.end('there is no favorites for this user');
        }
    },err => next(err)).catch(err => next(err));
});

module.exports = favoriteRouter;