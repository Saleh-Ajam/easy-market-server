const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send all the leaders to you !');
})
.post((req, res, next) => {
    res.end('Will add the leader:' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.end('PUT operation is not supported on /leaders');
})
.delete((req, res, next) => {
    res.end('Deleting all the leaders');
});

leaderRouter.route('/:leaderId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send to you the leader :' + req.params.leaderId);
})
.post((req, res, next) => {
    res.end('POST opeartion is not supported on /leaders/' + req.params.leaderId);
})
.put((req, res, next) => {
    res.write('Updating the leader: ' + req.params.leaderId + '\n');
    res.end('Update the leader ' + req.body.name + ' with the details: ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting the leader :' + req.params.leaderId);
});

module.exports = leaderRouter;