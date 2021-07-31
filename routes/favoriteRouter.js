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
    .populate('dishes')
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
                
                const found =  favorite.dishes.find(element => element == req.body[i]._id);
                if(!found){
                    favorite.dishes.push(req.body[i]._id);
                    favorite.save()
                    .then((favorite) => {
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorite) =>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    });
                }else{
                    res.statusCode = 403;
                    res.setHeader('Content-Type','text/plain')
                    res.end('the dish: '+ req.body[i]._id +' is already exists!');
                }
            }

        }else{ 
            Favorites.create({user: req.user._id})
            .then((favorite) =>{
                for(var i = req.body.length-1 ; i>=0 ; i--){
                    const found =  favorite.dishes.find(element => element == req.body[i]._id);
                    if(!found){
                        favorite.dishes.push(req.body[i]._id);
                        favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorite) =>{
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                        });
                    }else{
                        res.statusCode = 403;
                        res.setHeader('Content-Type','text/plain')
                        res.end('the dish: '+ req.body[i]._id +' is already exists!');
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


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) =>{
        if(!favorites){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }else{
            if(favorites.dishes.indexOf(req.params.dishId) < 0){
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
            const found =  favorite.dishes.find(element => element == req.params.dishId);
            if(!found){
                favorite.dishes.push(req.params.dishId);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorite) =>{
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                });
            }else{
                res.statusCode = 403;
                res.setHeader('Content-Type','text/plain')
                res.end('the dish is already exists!');
            }
        }else{ 
            Favorites.create({user: req.user._id})
            .then((favorite) =>{
                favorite.dishes.push(req.params.dishId);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
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
            const found =  favorite.dishes.find(element => element == req.params.dishId);
            if(found){
                const index = favorite.dishes.indexOf(req.params.dishId);
                if (index > -1) {
                    favorite.dishes.splice(index, 1);
                    favorite.save().then((favorite) => {
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorite) =>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    } , err => next(err)).catch(err => next(err));
                }else{
                    res.statusCode = 404;
                    res.setHeader('Content-Type','text/plain')
                    res.end('Dish ' + req.params._id+' is not in your favorites!');
                }
               
                
            }else{
                res.statusCode = 404;
                res.setHeader('Content-Type','text/plain')
                res.end('this dish is not exists !');
            }
        }else{
            res.statusCode = 404;
            res.setHeader('Content-Type','text/plain')
            res.end('there is no favorites for this user');
        }
    },err => next(err)).catch(err => next(err));
});

module.exports = favoriteRouter;