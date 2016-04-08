var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
//token instead of more formal user session
var jwt = require('jsonwebtoken');
var jwtsecret = process.env.AUTHVARIABLE; 

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
  hash: String,
  salt: String,

	gifs: [{ type: mongoose.Schema.Types.ObjectID, ref: 'Gif' }]
});

UserSchema.methods.setPassword = function(password){
  this.salt = bcrypt.genSaltSync(16);
  this.hash = bcrypt.hashSync(password, this.salt); 
};


//TODO: need additional validation on length and such?
UserSchema.methods.validPassword = function(password) {
  var hash = bcrypt.hashSync(password, this.salt);
  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {

  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, jwtsecret);
};

mongoose.model('User', UserSchema);
