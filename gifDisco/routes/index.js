var express = require('express');
var router = express.Router();

//mongoose db mode handles
var mongoose = require('mongoose');
var Gif = mongoose.model('Gif');
var Comment = mongoose.model('Comment');

//GET - return list of gifs
router.get('/gifs', function(req, res, next) {


	//TODO: validate USER's gifs!
  Gif.find(function(err, gifs){
    if(err){ return next(err); }

    res.json(gifs);
  });
});


//POST - add gif to database
router.post('/gifs', function(req, res, next) {
  var gif = new Gif(req.body);

  gif.save(function(err, gif){
    if(err){ return next(err); }

    res.json(gif);
  });
});

//Preload - Gifs - gets run before the POST command
router.param('gif', function(req, res, next, id) {
  var query = Gif.findById(id);

  query.exec(function (err, gif){
    if (err) { return next(err); }
    if (!gif) { return next(new Error('can\'t find gif')); }

    req.gif = gif;
    return next();
  });
});

//GET - retrieve one gif by id
router.get('/gifs/:gif', function(req, res) {
  res.json(req.gif);
});

//PUT - increment upvote on GIF
router.put('/gifs/:gif/upvote', function(req, res, next) {
  req.gif.upvote(function(err, gif){
    if (err) { return next(err); }

    res.json(gif);
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
