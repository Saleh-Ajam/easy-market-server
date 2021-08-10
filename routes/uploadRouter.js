const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');
const fs = require('fs');
const path = require('path');

const uploadPath = 'public/assets/images/upload/usersImages';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        cb(null,Date.now() + req.user._id + file.originalname );
    }
});

const imageFileFilter = (req, file, cb) =>{
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser,  authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type','plain/text');
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.oldImage = req.user.image; 
    return next();
},upload.single('imageFile'), (req, res) =>{
    if(res.oldImage !== 'assets/images/defaultAvatar.png'){
        try {
            fs.unlinkSync(path.resolve('./public/'+res.oldImage));
        } catch (error) {
            console.log(error);
        }
    }
        
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({...(req.file), success: true});
})
.put(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type','plain/text')
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type','plain/text')
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;