var mongoose = require('mongoose')
  , Imager = require('imager')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , imagerConfig = require(config.root + '/config/imager.js')
  , Schema = mongoose.Schema

var radToKilometers = function (rad) {
  return rad/6371
}

var ToySchema = new Schema({
  title: {type : String},
  description: {type : String},
  address: {type : String},
  user: {type : Schema.ObjectId, ref : 'User'},
  agegroup: {type: String},
  loc: {
    type: { type: String }, 
    coordinates: []
  },
  interest: [{
    user: { type : Schema.ObjectId, ref : 'User' },
  }],
  image: {
    cdnUri: String,
    files: []
  },
  available: {type : Boolean, default : true},
  createdAt: {type : Date, default : Date.now}
})

ToySchema.index({ loc : '2dsphere' });


ToySchema.path('title').validate(function (title) {
  return title.length > 0
}, 'Title cannot be blank')

ToySchema.path('description').validate(function (description) {
  return description && description.length > 0
}, 'Description cannot be blank')

ToySchema.path('address').validate(function (address) {
  return address && address.length > 0
}, 'Address cannot be blank')

ToySchema.path('agegroup').validate(function (agegroup) {
  return agegroup && agegroup.length > 0
}, 'Age group cannot be blank')


ToySchema.pre('remove', function (next) {
  var imager = new Imager(imagerConfig, 'S3')
  var files = this.image.files

  // if there are files associated with the item, remove from the cloud too
  imager.remove(files, function (err) {
    if (err) return next(err)
  }, 'toy')

  next()
})

ToySchema.methods = {

  uploadAndSave: function (images, cb) {
    console.log(images)
    if (!images || !images.length) return this.save(cb)

    var imager = new Imager(imagerConfig, 'S3')
    var self = this

    console.log('imager upload')
    imager.upload(images, function (err, cdnUri, files) {
      if (err) return cb(err)
      if (files.length) {
        self.image = { cdnUri : cdnUri, files : files }
      }
      self.save(cb)
    }, 'toy')
  },

  addInterest: function (user, cb) {
    this.interest.push({
      user: user._id
    })
  }

}

ToySchema.statics = {

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .populate('interest.user')
      .populate('city')
      .populate('city.country', 'name')
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
  },

  searchOptions: function() {
    return options = {
      maxDistance: radToKilometers(config.NEARBY_RADIUS),
      spherical: true,
      limit: config.RESULTS_PER_PAGE
    }
  }
}

mongoose.model('Toy', ToySchema)
