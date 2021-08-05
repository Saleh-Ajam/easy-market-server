const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Feedbacks = require('../models/feedback');
const cors = require('./cors');

const feedbackRouter = express.Router();
feedbackRouter.use(bodyParser.json());

feedbackRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Feedbacks.find(req.query)
    .populate('user')
    .then((feedbacks) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(feedbacks);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    if (req.body != null) {
        req.body.user = req.user._id;
        Feedbacks.findOne({user: req.user._id})
        .then((feedback) => {
            if(!feedback){
                
                Feedbacks.create({user: req.user._id})
                .then((feedback) => {
                    feedback.feedbacks.push(req.body);
                    feedback.save()
                    .then((feedback) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(feedback);
                    }, err => next(err)).catch(err => next(err))
                })
            }else{  
                feedback.feedbacks.push(req.body);
                feedback.save()
                .then((feedback) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(feedback);
                }, err => next(err)).catch(err => next(err))
            }
        }, (err) => next(err)).catch((err) => next(err));
    }
    else {
        err = new Error('Feedback not found in request body');
        err.status = 404;
        return next(err);
    }
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Feedbacks.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});


module.exports = feedbackRouter;