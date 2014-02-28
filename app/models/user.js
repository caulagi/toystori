var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , authTypes = ['twitter']

var UserSchema = new Schema({
  name: { type: String },
  email: { type: String },
  username: { type: String },
  provider: { type: String },
  authToken: { type: String },
  facebook: {},
  verified: { type: Boolean, default: false},
  createdAt: {type : Date, default : Date.now}
})

UserSchema.statics = {

  load: function (id, cb) {
    this.findOne({ _id : id })
      .exec(cb)
  }
}

mongoose.model('User', UserSchema)
