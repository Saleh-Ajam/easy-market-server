const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Products = require('../models/products');
const cors = require('./cors');

const productRouter = express.Router();

productRouter.use(bodyParser.json());
//when ever you need to preflight your requests, the client will first send the 
//HTTP OPTIONS request message and then obtain the reply from the server side before it 
//actually sends the actual request.
productRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Products.find(req.query)
    .populate('comments.author')
    .then((products) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(products);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req, res, next) => {
    Products.create(req.body)
    .then((product) =>{
        console.log('Product Created ', product);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(product);
    }, err => next(err))
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type','plain/text')
    res.end('PUT operation not supported on /products');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Products.deleteMany({})
    .then((resp) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    }, err => next(err)).catch(err => next(err));
});


productRouter.route('/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Products.findById(req.params.productId)
    .populate('comments.author')
    .then((product) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(product);
    }, err => next(err)).catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req, res, next) =>{
    res.statusCode = 403;
    res.setHeader('Content-Type','plain/text');
    res.end('POST operation is not supported on /products/'+ req.params.productId);
})
.put(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req, res, next) => {
    Products.findByIdAndUpdate(req.params.productId,{$set:req.body}, {new:true})
    .then((product) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(product)
    }, err => next(err)).catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req, res , next) => {
    Products.findByIdAndRemove(req.params.productId)
    .then((resp) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, err => next(err)).catch(err => next(err));
});



productRouter.route('/:productId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Products.findById(req.params.productId)
    .populate('comments.author')
    .then((product) => {
        if(product != null){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(product.comments);
        }else{
            err = new Error('Product '+ req.params.productId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Products.findById(req.params.productId)
    .then((product) =>{
        if(product != null){
            req.body.author = req.user._id;
            product.comments.push(req.body);
            product.save()
            .then((product) =>{
                Products.findById(product._id)
                    .populate('comments.author')
                    .then((product) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(product);
                    })
            }, (err) => next(err));
        }else{
            err = new Error('Product '+ req.params.productId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
        
    }, err => next(err))
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type','plain/text')
    res.end('PUT operation not supported on /products/' + req.params.productId+ '/comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Products.findById(req.params.productId)
    .then((product) =>{
        if(product != null){
            for(var i = product.comments.length-1; i>=0; i--){
                product.comments.id(product.comments[i]._id).remove();
            }
            product.save()
            .then((product) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(product);
            }, (err) => next(err));
        }else{
            err = new Error('Product '+ req.params.productId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
    }, err => next(err)).catch(err => next(err));
});


productRouter.route('/:productId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Products.findById(req.params.productId)
    .populate('comments.author')
    .then((product) => {
        if(product != null && product.comments.id(req.params.commentId) != null){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(product.comments.id(req.params.commentId));
        }else if(product == null){
            err = new Error('Product '+ req.params.productId + ' not found');
            err.statusCode = 404;
            return next(err);
        }else {
            err = new Error('Comment '+ req.params.commentId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
    }, err => next(err)).catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    res.statusCode = 403;
    res.setHeader('Content-Type','plain/text');
    res.end('POST operation is not supported on /products/'+ req.params.productId + '/comments/' + req.params.commentsId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Products.findById(req.params.productId)
    .then((product) => {
        // console.log(typeof product.comments.id(req.params.commentId).author._id.toString());
        // console.log(typeof req.user._id.toString());
        // console.log(typeof req.user._id);
        
        // check if the logged user is the same user that post the comment : author
        if(req.user._id.equals(product.comments.id(req.params.commentId).author._id)){
            if(product != null && product.comments.id(req.params.commentId) != null){
                if(req.body.rating){
                    product.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if(req.body.comment){
                    product.comments.id(req.params.commentId).comment = req.body.comment;
                }
                product.save()
                .then((product) =>{
                    console.log(product);
                    Products.findById(product._id)
                    .populate('comments.author')
                    .then((product) =>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(product);
                    });
                }, (err) => next(err));
            }else if(product == null){
                err = new Error('Product '+ req.params.productId + ' not found');
                err.statusCode = 404;
                return next(err);
            }else {
                err = new Error('Comment '+ req.params.commentId + ' not found');
                err.statusCode = 404;
                return next(err);
            }
        }else{
            var err  = new Error('You are not autherized to update this comment!');
            err.status= 403;
            next(err);
        }
        
    }, err => next(err)).catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res , next) => {
    Products.findById(req.params.productId)
    .then((product) =>{
        // check if the logged user is the same user that post the comment : author
        if(req.user._id.equals(product.comments.id(req.params.commentId).author._id)){   
            if(product != null && product.comments.id(req.params.commentId) != null){
                product.comments.id(req.params.commentId).remove();
                product.save()
                .then((product) =>{
                    Products.findById(product.id)
                    .populate('comments.author')
                    .then((product) =>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(product);
                    });
                }, (err) => next(err));
            }else if(product == null){
                err = new Error('Product '+ req.params.productId + ' not found');
                err.statusCode = 404;
                return next(err);
            }else {
                err = new Error('Comment '+ req.params.commentId + ' not found');
                err.statusCode = 404;
                return next(err);
            }
        }else{
            var err  = new Error('You are not autherized to delete this comment!');
            err.status= 403;
            next(err);
        }
    }, err => next(err)).catch(err => next(err));
});

module.exports = productRouter;