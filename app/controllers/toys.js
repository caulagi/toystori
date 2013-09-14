
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Toy = mongoose.model('Toy')
  , City = mongoose.model('City')
  , async = require('async')
  , util = require('util')
  , errors = require('../../lib/errors')
  , request = require('request')
  , markdown = require( "markdown" ).markdown
  , _ = require('underscore')

// https://gist.github.com/qiao/1626318
function getClientIp(req) {
  var ipAddress;
  var forwardedIpsStr = req.header('x-forwarded-for'); 
  if (forwardedIpsStr) {
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  }

  return ipAddress
}

/**
 * Load
 */

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

  var ip = getClientIp(req)
    , url = util.format("http://freegeoip.net/json/%s", ip)

  request(url, function(err, response, body) {
    if (err || response.statusCode != 200) {
      return res.redirect(util.format('/toys/by-city/%s', config.fallbackCityId))
    }

    var freegeo = JSON.parse(body)
      , city = freegeo.city || config.fallbackCity
      , fp = City.getFingerprint(city)
      , options = { criteria: { fingerprint: fp } }


    //TODO: Handle the case where lookup by fingerprint fails
    City.list(options, function(err, cities) {
      if (err) {
        console.log('Failed to lookup city with fp:', fp)
        return res.render('404')
      }

      City.count().exec(function (err, count) {
        var cityId = config.fallbackCityId
        if (cities.length > 0) {
          cityId = cities[0].id
        }
        return res.redirect(util.format('/toys/by-city/%s', cityId))
      })
    })
  })
}

/**
 * List by city
 */

exports.byCity = function(req, res, next){

  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
    , tags = []
    , options = { perPage: config.items_per_page, page: page }

  options.criteria = {city: req.city.id}
  Toy.list(options, function(err, toys) {
    if (err) return next(err)
    Toy.count().exec(function (err, count) {
      _.each(toys, function(toy, index) {
        toy.description = markdown.toHTML(toy.description.slice(0,250)+'...')
        _.each(toy.tags.split(','), function (tag, index) {
          tag = tag.trim()
          if (tag && !tags[tag]) {
            tags.push(tag)
          }
        })
      })
      res.render('toys/index', {
        title: 'Upcoming events',
        toys: toys,
        tags: _.first(tags, 20),
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
  var url = util.format(config.reverse_geocode, req.body.latitude, req.body.longitude)
    , options = {}
    , cityInformation
    , city
    , state

  request(url, function(err, response, body) {
    if (err || response.statusCode != 200) {
      console.log(err, response.statusCode)
      return res.render('toys/new', {
        title: 'New Toy',
        toy: new Toy(req.body),
        errors: ["Unable to retrieve city information at the moment.  Please try again after some time"]
      })
    }
    cityInformation = JSON.parse(body)['results'][0]['address_components']

    _.each(cityInformation, function(item, index) {
      if (item.types[0] && item.types[0] === "locality") {
        city = item.long_name
      } else if (item.types[0] && item.types[0] === "administrative_area_level_1") {
        state = item.long_name
      }
    })

    options.criteria = {name: city, state: state}
    City.list(options, function (err, cities) {
      if (err) return next(err)

      City.count().exec(function (err, count) {
        if ( !cities.length ) {
          return res.render('toys/new', {
            title: 'New Toy',
            toy: new Toy(req.body),
            errors: ["Unable to find city with that name"]
          })
        }
        
        // something weird.  We need to set the city before
        // doing new Toy
        req.body.city = cities[0].id
        var toy = new Toy(req.body)
        toy.user = req.user
        toy.save(function (err, doc, count) {
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
      })
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
    , showAttending = true
    , toy = req.toy
    , user = req.user

  if (user && user.id && (toy.user.id == user.id)) {
    allowEdit = true
  }

  toy.interest.forEach(function (attendee, index) {
    if (user && user.id && (user.id === attendee.user.id)) {
      showAttending = false
    }
  })

  toy.description = markdown.toHTML(toy.description)
  _.each(toy.comments, function(comment, index) {
    toy.comments[index].body = markdown.toHTML(comment.body)
  })

  res.render('toys/show', {
    title: req.toy.title,
    toy: req.toy,
    allowEdit: allowEdit,
    showAttending: showAttending
  })
}

/**
 * Attending
 */

exports.attending = function(req, res) {
  var includeUser = true
    , toy = req.toy
  
  toy.attending.forEach(function (user, index) {
    if (req.user.id == user.id) {
      includeUser = false
    }
  })

  if (!includeUser) {
    req.flash('error', 'Nothing to do!  You are already attending')
    res.redirect('/toys/'+toy.id)
  }

  toy.attending.push({
    user: req.user
  })
  toy.save(function (err, doc, count) {
    req.flash('info', 'Marked as attending!')
    res.redirect('/toys/'+toy.id)
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
