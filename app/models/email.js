var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , uuid = require("node-uuid")

var EmailConfirmationSchema = new Schema({
  user: {type : Schema.ObjectId, ref : 'User', index: true},
  code: {type: String, default: uuid.v4, index: true}
})

EmailConfirmationSchema.statics = {

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .exec(cb)
  },

  list: function (options, cb) {
    var criteria = options.criteria || {}

    this.find(criteria)
      .populate('user', 'name username')
      .sort({'createdAt': -1}) // sort by date
      .exec(cb)
  }
}

mongoose.model('EmailConfirmation', EmailConfirmationSchema)
