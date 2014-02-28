var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , errors = require('../../lib/errors')
  , Toy = mongoose.model("Toy")

function renderProfile(res, options) {
  options["title"] = options.user.name
  return res.render('users/profile', options)
}

exports.authCallback = function (req, res, next) {
  res.redirect('/')
}

exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login',
    message: req.flash('error')
  })
}

exports.logout = function (req, res) {
  req.logout()
  res.redirect('/login')
}

exports.session = function (req, res) {
  res.redirect('/')
}

exports.profile = function (req, res) {
  var user = req.profile
    , options = {criteria: {owner: user._id}}

  Toy.list(options, function(err, toys) {
    if (err) return renderProfile(res, {user: user})

    Toy.count().exec(function (err, count) {
      return renderProfile(res, {user: user, toys: toys})
    })
  })
}

/**
 * Find user by id
 */

exports.load = function (req, res, next, id) {
  User
    .findOne({ _id : id })
    .exec(function (err, user) {
      if (err) return next(err)
      if (!user) return next({message: 'User not found: '+id})
      req.profile = user
      next()
    })
}
