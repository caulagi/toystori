
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Imager = require('imager')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , imagerConfig = require(config.root + '/config/imager.js')
  , Schema = mongoose.Schema

/**
 * Toy Schema
 */

var ToySchema = new Schema({
  title: {type : String, default : '', trim : true},
  description: {type : String, default : '', trim : true},
  latitude: {type : Number, default : '', trim : true},
  longitude: {type : Number, default : '', trim : true},
  city: {type: Schema.ObjectId, ref : 'City'},
  user: {type : Schema.ObjectId, ref : 'User'},
  interest: [{
    user: { type : Schema.ObjectId, ref : 'User' },
  }],
  image: {
    cdnUri: String,
    files: []
  },
  is_available: {type : Boolean, default : true},
  createdAt  : {type : Date, default : Date.now}
})

/**
 * Validations
 */

ToySchema.path('title').validate(function (title) {
  return title.length > 0
}, 'Title cannot be blank')

ToySchema.path('description').validate(function (description) {
  return description && description.length > 0
}, 'Description cannot be blank')

ToySchema.path('latitude').validate(function (latitude) {
  return latitude && typeof latitude === 'number'
}, 'Latitude is required')

ToySchema.path('longitude').validate(function (longitude) {
  return longitude && typeof longitude === 'number'
}, 'Longitude is required')

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

  /**
   * Save article and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   */

  uploadAndSave: function (images, cb) {
    console.log(images)
    if (!images || !images.length) return this.save(cb)

    var imager = new Imager(imagerConfig, 'S3')
    var self = this

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

/**
 * Statics
 */

ToySchema.statics = {

  /**
   * Find meetup by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .populate('interest.user')
      .populate('city')
      .populate('city.country', 'name')
      .exec(cb)
  },

  /**
   * List meetups
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

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

mongoose.model('Toy', ToySchema)
