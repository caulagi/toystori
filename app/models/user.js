var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , authTypes = ['twitter']

/**
 * User Schema
 */

var UserSchema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  username: { type: String, default: '' },
  provider: { type: String, default: '' },
  authToken: { type: String, default: '' },
  facebook: {},
  verified: { type: Boolean, default: false},
  createdAt: {type : Date, default : Date.now}
})

var validatePresenceOf = function (value) {
  return value && value.length
}

UserSchema.path('username').validate(function (username) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true
  return username.length
}, 'Username cannot be blank')

UserSchema.statics = {

  load: function (id, cb) {
    this.findOne({ _id : id })
      .exec(cb)
  }
}

mongoose.model('User', UserSchema)
