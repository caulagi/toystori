var mongoose = require('mongoose')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , EmailConfirmation = mongoose.model("EmailConfirmation")
  , errors = require('../../lib/errors')
  , User = mongoose.model("User")
  , postmark = require("postmark")(process.env.POSTMARK_API_KEY)

/**
 * Send an email confirmation code to the user and store
 * it in DB so we can check later
 */
exports.resendCode = function(req, res, next) {
  if (!req.user) return res.render("emails/resend_code")

  var code = new EmailConfirmation({user: req.user._id})
  code.save(function (err) {
    if (err) { return next(err) }

    postmark.send({
      "From": config.from_address,
      "To": req.user.email,
      "Subject": "Confirm your email",
      "TextBody": "Please click this link to confirm your email - http://toystori.com/emails/verify/"+code.code,
    }, function(error, success) {
      if (error) {
        console.log(error)
        return res.render("emails/resend_code", {
          errors: errors.format(error)
        })
      }
      res.render("emails/resend_code", {
        title: "Email confirmation",
        user: req.user
      })
    })
  })
}

/**
 * Verify whether the code was something we had sent
 * and if yes, mark the user as verified
 */
exports.verifyCode = function(req, res) {
  var options = {criteria: {code: req.params.code}}
  EmailConfirmation.list(options, function (err, results) {
    if (err || !results.length) return res.render("emails/verify_code")

    User.load(results[0].user._id, function(err, user) {
      if (err || !user) return res.render("emails/verify_code")

      user.verified = true
      user.save(function (err) {
        if (err) return res.render("emails/verify_code")
        return res.render("emails/verify_code", {
          title: "User verified!",
          verified: true,
          user: user
        })
      })
    })
  })
}

exports.askEmail = function (req, res) {
  return res.render("emails/update", {user: req.user})
}

function isValidEmail(str) {

  // https://github.com/chriso/validator.js/blob/master/validator.js
  var email = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;
  return email.test(str);
}


exports.update = function (req, res) {
  var user = req.user
  user.email = req.body.email
  user.verified = false

  if (!isValidEmail(user.email)) {
    return res.render("emails/update", {
      user: user,
      errors: errors.format({error: {message: "This is not a valid email"}})
    })
  }

  user.save(function (err) {
    if (err) {
      messages.error("Unable to save email.  Please retry")
      return res.render("emails/update", {user: user})
    }

    return res.redirect("emails/resend-code")
  })
}
