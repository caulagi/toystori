
var rootPath = require('path').normalize(__dirname + '/..')
  , _ = require('underscore')

var _base = {
  db: 'mongodb://localhost/toystori',
  root: rootPath,
  app: {
    name: 'toystori: Share your toys'
  },
  facebook: {
    clientID: "573379242699875",
    clientSecret: "e1826c9857a0e58adb2a608ed516c1ad",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  fallbackLatitude: 12.972558,
  fallbackLongitude: 77.594911,
  fallbackCity: "Bangalore",
  from_address: "jeeves@toystori.com",
  NEARBY_RADIUS: 40, // distance in kms
  RESULTS_PER_PAGE: 20,
  MIXPANEL_ID: process.env.MIXPANEL_ID || "86d6a0a2e95c442691e4dc5543dbc833"
}

var development = _.extend({}, _base, { db: _base.db+'_dev' })
  , test        = _.extend({}, _base, { db: _base.db+'_test' })
  , production  = _.extend({}, _base, {
      db: process.env.MONGOHQ_URL || _base.db+'_prod',
      facebook: {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "http://fathomless-forest-3647.herokuapp.com/auth/facebook/callback"
      },
      fallbackCityId: '51fd5227920fc2020000522c'
    })

module.exports = {
  development: development,
  test: test,
  production: production
}
