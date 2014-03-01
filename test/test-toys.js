var mongoose = require('mongoose')
  , should = require('should')
  , supertest = require('supertest')
  , app = require('../server')
  , context = describe
  , User = mongoose.model('User')
  , Toy = mongoose.model('Toy')
  , agent = supertest(app)
  , util = require('util')

describe('Toys', function () {

  var user, toy
  
  before(function (done) {
    user = new User({
      email: 'foobar@example.com',
      name: 'Foo bar',
      username: 'foobar',
    })
    user.save()
    toy = new Toy({
      title: "Beach ball",
      description: "Beach ball board game",
      address: "Bilekahalli, Bangalore",
      loc: {"type" : "Point", "coordinates" : [
        77.60492180000006, 12.8970745
      ]},
      owner: user._id,
      agegroup: "2 years and above"
    })
    toy.save(done)
  })

  describe('GET /toys/:id', function () {
    context("Viewing toy details", function() {
      it("should work without login", function(done) {
        agent
          .get(util.format("/toys/%s", toy.id))
          .expect(200)
          .end(done)
      })
      it("should contain title and description", function(done) {
        agent
          .get(util.format("/toys/%s", toy.id))
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/<h2>Beach ball<\/h2>/)
            res.text.should.match(/Beach ball board game/)
            done()
          })
      })
    })
  })

  describe('GET /toys/empty', function () {
    context("Viewing empty toy list", function() {
      it("should work without login", function(done) {
        agent
          .get("/toys/empty")
          .expect(200)
          .end(done)
      })
      it("should show empty message", function(done) {
        agent
          .get("/toys/empty")
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/There are no toys near you yet./)
            res.text.should.match(/<a href=\"\/toys\/new\">share<\/a>/)
            done()
          })
      })
    })
  })

  describe('GET /toys/new', function () {
    context('When not logged in', function () {
      it('should redirect to /login', function (done) {
        agent
        .get('/toys/new')
        .expect(302)
        .end(done)
      })
    })
  })

  after(function (done) {
    require('./helper').clearDb(done)
  })
})
