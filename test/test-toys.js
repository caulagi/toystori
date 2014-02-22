var mongoose = require('mongoose')
  , should = require('should')
  , request = require('supertest')
  , app = require('../server')
  , context = describe
  , User = mongoose.model('User')
  , Toy = mongoose.model('Toy')
  , agent = request.agent(app)
  , util = require('util')

describe('Toys', function () {

  /*
  describe('GET /toys', function () {
    it('should respond with Content-Type text/html', function (done) {
      agent
      .get('/toys')
      .expect('Content-Type', "text/html; charset=utf-8")
      .expect(200)
      .end(done)
    })
  })
  */

  describe('GET /toys/new', function () {
    context('When not logged in', function () {
      it('should redirect to /login', function (done) {
        agent
        .get('/toys/new')
        .expect('Content-Type', /plain/)
        .expect(302)
        .expect('Location', '/login')
        .expect(/Moved Temporarily/)
        .end(done)
      })
    })
  })

  describe('POST /toys', function () {
    context('When not logged in', function () {
      it('should redirect to /login', function (done) {
        request(app)
        .get('/toys/new')
        .expect('Content-Type', /plain/)
        .expect(302)
        .expect('Location', '/login')
        .expect(/Moved Temporarily/)
        .end(done)
      })
    })
  })


  after(function (done) {
    require('./helper').clearDb(done)
  })
})
