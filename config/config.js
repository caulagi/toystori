
var rootPath = require('path').normalize(__dirname + '/..')
  , _ = require('underscore')

var _base = {
  db: 'mongodb://localhost/toystori',
  root: rootPath,
  items_per_page: 30,
  app: {
    name: 'toystori: Share your toys'
  },
  facebook: {
    clientID: "573379242699875",
    clientSecret: "e1826c9857a0e58adb2a608ed516c1ad",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  aws: {
    accessKeyId: process.env.AWS_S3_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET,
    region: 'us-east-1'
  },
  fallbackCity: 'Bangalore',
  fallbackCityId: '51fe014e1f004ba72300522c',
  MIXPANEL_ID: process.env.MIXPANEL_ID || "86d6a0a2e95c442691e4dc5543dbc833",
  reverse_geocode: "http://maps.googleapis.com/maps/api/geocode/json?sensor=false&latlng=%s,%s"
}

var development = _.extend({}, _base, { db: _base.db+'_dev' })
  , test        = _.extend({}, _base, { db: _base.db+'_test' })
  , production  = _.extend({}, _base, {
      db: process.env.MONGOHQ_URL || _base.db+'_prod',
      facebook: {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "http://toystori.com/auth/facebook/callback"
      },
      fallbackCityId: '51fd5227920fc2020000522c'
    })

module.exports = {
  development: development,
  test: test,
  production: production
}
