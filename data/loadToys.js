/*!
 * toystori - share your toys
 * Copyright(c) 2013 Pradip Caulagi <caulagi@gmail.com>
 * MIT Licensed
 */

var fs = require('fs')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config/config')[env]
  , mongoose = require('mongoose')
  , async = require('async')

// Bootstrap db connection
mongoose.connect(config.db)

// Bootstrap models
var models_path = __dirname + '/../app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

// Load models after we have read them
var Toy= mongoose.model('Toy') 
  , City = mongoose.model('City')
  , User = mongoose.model('User')
  , bangalore
  , me

async.series([
  
  function(cb) {
    City.find({name: 'Bangalore'}, function(err, doc) {
      if (err) return cb(err)
      bangalore = doc[0].id
      return cb(null, doc)
    })
  },

  function(cb) {
    User.find({username: 'pradip.caulagi'}, function(err, doc) {
      if (err) return cb(err)
      me = doc[0].id
      return cb(null, doc)
    })
  },

  function(cb) {
    new Toy({
      title: "A horse that rocks",
      description: "The simplest way to make my daughter spend some quite time, or eat her fruits.  Built to last, unlink those plastic toys you have.",
      user: me,
      city: bangalore,
      latitude: '12.969800',
      longitude: '77.749947',
      image: {
        cdnUri: "http://images01.olx.in/ui/18/18/39/1377923469_541240939_1-Pictures-of--Channapatna-wooden-horse-for-sale.jpg"
      }
    }).save(function (err, doc, count) {
      console.log(doc)
      if (err) return cb(err)
      return cb(null, doc)
    })
  },

  function(cb) {
    new Toy({
      title: "What Mozart used",
      description: "A classical toy that never goes out of style. The piano I has 4 built in tunes and 15 keys. The tunes feature classical Mozart and Beethoven",
      user: me,
      city: bangalore,
      latitude: '12.969800',
      longitude: '77.749947',
      image: {
        cdnUri: "http://i01.i.aliimg.com/wsphoto/v0/749350811/Tiger-violin-child-orgatron-educational-toys-violin-cartoon-music-piano-infant-electronic-piano-toy.jpg"
      }
    }).save(function (err, doc, count) {
      console.log(doc)
      if (err) return cb(err)
      return cb(null, doc)
    })
  },

  function(cb) {
    new Toy({
      title: "Jimi Hendrix used",
      description: "Another toy that is a must have?! The guitar has 4 built in tunes and 3 press and play buttons.",
      user: me,
      city: bangalore,
      latitude: '12.969800',
      longitude: '77.749947',
      image: {
        cdnUri: "http://p.globalsources.com/IMAGES/PDT/B1061402935/Guitar-Toy.jpg"
      }
    }).save(function (err, doc, count) {
      console.log(doc)
      if (err) return cb(err)
      return cb(null, doc)
    })
  },

  function(cb) {
    new Toy({
      title: "Walk with me",
      description: "Drag it around with you and the tiger will make shaking noises for you.  Encourages your infant to explore the world, on her own legs.",
      user: me,
      city: bangalore,
      latitude: '12.969800',
      longitude: '77.749947',
      image: {
        cdnUri: "http://www.tigermuseum.com/zenphoto/albums/toys/indian-toy-tiger1.jpg"
      }
    }).save(function (err, doc, count) {
      console.log(doc)
      if (err) return cb(err)
      return cb(null, doc)
    })
  },

  // dummy function
  function(cb) {cb(null)}
],
// Done loading, exit now
function(err, result) {
  if (err) process.exit(err)
  process.exit(0)
})
