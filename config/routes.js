
/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var users = require('../app/controllers/users')
  , auth = require('./middlewares/authorization')

/**
 * Expose routes
 */

module.exports = function (app, passport) {

  // user routes
  app.get('/login', users.login)
  app.get('/logout', users.logout)
  app.get('/users/:userId', users.profile)
  app.get('/auth/facebook', passport.authenticate('facebook'))
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login'
    }), users.authCallback)

  app.param('userId', users.user)


  // --- HOME
  app.get('/', function (req, res) {
    res.render('index')
  })

  // city routes
  var cities = require('../app/controllers/cities')
  app.get('/cities/search/:query', cities.search)

  app.param('cityId', cities.load)
  app.param('query', cities.find)

  app.get('/about', function (req, res) {
    res.render('about')
  })
  app.get('/terms', function (req, res) {
    res.render('terms')
  })
  app.get('/privacy', function (req, res) {
    res.render('privacy')
  })
  app.get('/support', function (req, res) {
    res.render('support')
  })
}
