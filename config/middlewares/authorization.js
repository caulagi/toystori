
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  next()
}

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization : function (req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized')
      return res.redirect('/users/'+req.profile.id)
    }
    next()
  }
}

/*
 *  meetup authorization routing middleware
 */

exports.meetup = {
  hasAuthorization : function (req, res, next) {
    if (req.meetup.user.id != req.user.id) {
      req.flash('info', 'You are not authorized')
      return res.redirect('/meetup/'+req.meetup.id)
    }
    next()
  }
}
