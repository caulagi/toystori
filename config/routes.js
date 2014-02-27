var users = require('../app/controllers/users')
  , toys = require('../app/controllers/toys')
  , emails = require("../app/controllers/emails")
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

  app.param('userId', users.load)

  app.get('/', toys.index)
  app.param('id', toys.load)
  app.get('/toys/by-location', toys.byLocation)
  app.get('/toys/no-coords', toys.findLocationByIp)
  app.get('/toys/empty', toys.empty)
  app.get('/toys/new', auth.requiresLogin, toys.new)
  app.post('/toys/new', auth.requiresLogin, toys.create)
  app.get('/toys/:id', toys.show)
  app.put('/toys/:id', toyAuth, toys.update)
  app.del('/toys/:id', toyAuth, toys.destroy)


  // Email confirmation
  app.get('/emails/resend-code', emails.resendCode)
  app.get('/emails/verify/:code', emails.verifyCode)
  app.get('/emails/update', emails.askEmail)
  app.post('/emails/update', auth.requiresLogin, users.load, emails.update)

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
