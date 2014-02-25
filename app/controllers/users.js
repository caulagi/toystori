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
    , options = {criteria: {user: user._id}}

  Toy.list(options, function(err, toys) {
    if (err) return renderProfile(res, {user: user})

    Toy.count().exec(function (err, count) {
      return renderProfile(res, {user: user, toys: toys})
    })
  })
}

exports.askEmail = function (req, res) {
  res.render('users/email', {
    user: reg.profile
  })
}

exports.updateEmail = function (req, res) {
  var user = reg.profile;
  res.render('users/reg_complete', {
    user: reg.profile
  })
}

/**
 * Find user by id
 */

exports.user = function (req, res, next, id) {
  User
    .findOne({ _id : id })
    .exec(function (err, user) {
      if (err) return next(err)
      if (!user) return next(new Error('Failed to load User ' + id))
      req.profile = user
      next()
    })
}
