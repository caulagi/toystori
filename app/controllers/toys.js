
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Toy = mongoose.model('Toy')
  , async = require('async')
  , util = require('util')
  , errors = require('../../lib/errors')
  , request = require('request')
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

/**
 * List
 */

exports.index = function(req, res){
  Toy.list({}, function(err, toys) {
    if (err) {
      return res.render('404')
    }

    Toy.count().exec(function (err, count) {
      res.render('toys/index', {
        title: 'Toys near you',
        toys: toys,
      })
    })
  })
}

/**
 * List by city
 */

exports.byCity = function(req, res, next){

  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
    , options = { perPage: config.items_per_page, page: page }

  options.criteria = {city: req.city.id}
  Toy.list(options, function(err, toys) {
    if (err) return next(err)
    Toy.count().exec(function (err, count) {
      _.each(toys, function(toy, index) {
        toy.description = markdown.toHTML(toy.description.slice(0,250)+'...')
      })
      res.render('toys/index', {
        title: 'Upcoming events',
        toys: toys,
        page: page + 1,
        pages: Math.ceil(count / config.items_per_page),
        fallbackCityId: config.fallbackCityId
      })
    })
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

  toy.save(function (err, doc, count) {
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
