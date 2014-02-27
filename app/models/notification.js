var mongoose = require('mongoose')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Schema = mongoose.Schema

var NotificationSchema = new Schema({
  user: {type : Schema.ObjectId, ref : 'User'},
  message: {type: String},
  seen: {type : Boolean, default : true},
  createdAt: {type : Date, default : Date.now}
})

NotificationSchema.statics = {

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
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb)
  }
}

mongoose.model('Notification', NotificationSchema)
