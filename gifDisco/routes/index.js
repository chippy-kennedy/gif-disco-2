var express = require('express');
var router = express.Router();
var jwtsecret =  process.env.AUTHVARIABLE;

//mongoose db mode handles
var mongoose = require('mongoose');
var Gif = mongoose.model('Gif');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

//passport - routes
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: jwtsecret, userProperty: 'payload'});

//GET - return list of gifs
router.get('/gifs', function(req, res, next) {


	//TODO: validate USER's gifs!
  Gif.find(function(err, gifs){
    if(err){ return next(err); }

    res.json(gifs);
  });
});


//POST - add gif to database
router.post('/gifs', auth, function(req, res, next) {
  var gif = new Gif(req.body);
	gif.author = req.payload.username;
	
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
router.put('/gifs/:gif/upvote', auth, function(req, res, next) {
  req.gif.upvote(function(err, gif){
    if (err) { return next(err); }

    res.json(gif);
  });
});


//POST - Register New User
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

//POST - Log User uin
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
