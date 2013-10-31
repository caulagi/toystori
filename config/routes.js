
/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var users = require('../app/controllers/users')
  , toys = require('../app/controllers/toys')
  , auth = require('./middlewares/authorization')

var toyAuth = [auth.requiresLogin, auth.toy.hasAuthorization]

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

  app.get('/', toys.index)
  app.get('/toys/by-city/:cityId', toys.byCity)
  app.get('/toys/new', auth.requiresLogin, toys.new)
  app.post('/toys/new', auth.requiresLogin, toys.create)
  app.get('/toys/:id', toys.show)
  app.put('/toys/:id/attending', auth.requiresLogin, toys.attending)
  app.put('/toys/:id', toyAuth, toys.update)
  app.del('/toys/:id', toyAuth, toys.destroy)

  app.param('id', toys.load)

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
  app.get('/contact', function (req, res) {
    res.render('contact')
  })
  app.get('/support', function (req, res) {
    res.redirect('/contact')
  })
}
