
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Toy = mongoose.model('Toy')
  , errors = require('../../lib/errors')
  , markdown = require( "markdown" ).markdown
  , _ = require('underscore')

exports.load = function(req, res, next, id){
  Toy.load(id, function (err, toy) {
    if (err) return next(err)
    if (!toy) return next(new Error('not found'))
    req.toy = toy
    next()
  })
}

exports.index = function(req, res) {
  return res.render("toys/landing", {
    title: 'Toys near you',
  })
}

exports.renderToys= function(req, res, results) {
  var toys = []

  _.each(results, function(result, index) {
    toy = result.obj;
    toy.distance = result.dis
    toys.push(toy)
  })

  _.each(toys, function(toy, index) {
    toy.description = markdown.toHTML(toy.description.slice(0,250)+'...')
  })

  return res.render('toys/index', {
    title: 'Events around you',
    toys: toys,
    coords: req.session['loc'].coordinates
  })
}

exports.byLocation = function(req, res, next){

  var coords = { type: 'Point', coordinates: [
    parseFloat(req.query.lon), parseFloat(req.query.lat)
  ]}
  req.session['loc'] = coords
  console.log(coords)

  var options = Toy.searchOptions()
  Toy.geoNear(coords, options, function(err, results, stats) {
    if (err) {
      console.log(err)
      return res.render('toys/empty')
    }

    return module.exports.renderToys(req, res, results)
  })
}

/**
 * New toy
 */

exports.new = function(req, res){
  res.render('toys/new', {
    title: 'New Toy',
    toy: new Toy({})
  })
}

/**
 * Create an toy
 */

exports.create = function (req, res, next) {
  console.log(req.body)
  var toy = new Toy(req.body)
  toy.user = req.user
  toy.loc = { type: 'Point', coordinates: [
    parseFloat(req.body.longitude), parseFloat(req.body.latitude)
  ]}

  toy.uploadAndSave(req.files.image, function (err, doc, count) {
    console.log(err)
    if (!err) {
      req.flash('success', 'Successfully created toy!')
      return res.redirect('/toys/'+doc._id)
    }

    return res.render('toys/new', {
      title: 'New Toy',
      toy: toy,
      errors: errors.format(err.errors || err)
    })
  })
}

/**
 * Edit an toy
 */

exports.edit = function (req, res) {
  res.render('toys/edit', {
    title: 'Edit ' + req.toy.title,
    toy: req.toy
  })
}

/**
 * Update toy
 */

exports.update = function(req, res){
  var toy = req.toy
  toy = _.extend(toy, req.body)

  toy.save(function(err, doc) {
    if (!err) {
      return res.redirect('/toys/' + toy._id)
    }

    res.render('toys/edit', {
      title: 'Edit Toy',
      toy: toy,
      errors: errors.format(err.errors || err)
    })
  })
}

/**
 * Show
 */

exports.show = function(req, res, next){
  var allowEdit = false
    , toy = req.toy
    , user = req.user

  if (user && user.id && (toy.user.id == toy.id)) {
    allowEdit = true
  }

  toy.description = markdown.toHTML(toy.description)
  res.render('toys/show', {
    title: req.toy.title,
    toy: req.toy,
    allowEdit: allowEdit
  })
}

/**
 * Delete the toy
 */

exports.destroy = function(req, res){
  var toy = req.toy
  toy.remove(function(err){
    req.flash('info', 'Deleted successfully')
    res.redirect('/toys')
  })
}
