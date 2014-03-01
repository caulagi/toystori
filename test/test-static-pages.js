var mongoose = require('mongoose')
  , should = require('should')
  , supertest = require('supertest')
  , app = require('../server')
  , context = describe
  , agent = supertest(app)
  , util = require('util')

describe('Static pages', function () {

  describe('GET /about', function () {
    context("Viewing about page", function() {
      it("should give 200", function(done) {
        agent
          .get("/about")
          .expect(200)
          .end(done)
      })
      it("should contain author info", function(done) {
        agent
          .get("/about")
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/<a href=\"http:\/\/twitter.com\/caulagi" target="_blank">Pradip P Caulagi<\/a>/)
            done()
          })
      })
    })
  })

  describe('GET /terms', function () {
    context("Viewing terms page", function() {
      it("should give 200", function(done) {
        agent
          .get("/terms")
          .expect(200)
          .end(done)
      })
      it("should contain terms", function(done) {
        agent
          .get("/terms")
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/Terms of service/)
            done()
          })
      })
    })
  })

  describe('GET /privacy', function () {
    context("Viewing privacy page", function() {
      it("should give 200", function(done) {
        agent
          .get("/privacy")
          .expect(200)
          .end(done)
      })
      it("should contain privacy policy", function(done) {
        agent
          .get("/privacy")
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/We are serious about it/)
            done()
          })
      })
    })
  })

  describe('GET /contact', function () {
    context("Viewing contact page", function() {
      it("should give 200", function(done) {
        agent
          .get("/contact")
          .expect(200)
          .end(done)
      })
      it("should contain contact info", function(done) {
        agent
          .get("/contact")
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/We would love to know how we are doing - info AT toystori DOT com/)
            done()
          })
      })
    })
  })

  describe('GET /login', function () {
    context("Viewing login page", function() {
      it("should give 200", function(done) {
        agent
          .get("/login")
          .expect(200)
          .end(done)
      })
      it("should show facebook button", function(done) {
        agent
          .get("/login")
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/div class=\"vspace-two align-center\"><a href=\"\/auth\/facebook\" class=\"btn btn-auth btn-facebook large\">Login with Facebook<\/a><\/div>/)
            done()
          })
      })
    })
  })

  describe('GET /', function () {
    context("Viewing landing page", function() {
      it("should give 200", function(done) {
        agent
          .get("/")
          .expect(200)
          .end(done)
      })
      it("should ask user to share location", function(done) {
        agent
          .get("/")
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/Please allow the website to use your location/)
            done()
          })
      })
      it("should have branding markup", function(done) {
        agent
          .get("/")
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/<div class=\"branding\"><a href=\"\/\" class=\"navbar-brand\">toystori<\/a><div class=\"navbar-subheading orange slant hidden-xs\">Share your toys<\/div><\/div>/)
            done()
          })
      })
      it("should have link to Facebook in footer", function(done) {
        agent
          .get("/")
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/<li><a href=\"https:\/\/www.facebook.com\/pages\/Toystori\/761940260497219\"><i class=\"fa fa-facebook\"><\/i><\/a><\/li>/)
            done()
          })
       })
      it("should have link to Twitter in footer", function(done) {
        agent
          .get("/")
          .end(function (err, res) {
            res.should.be.html
            res.text.should.match(/<li><a href=\"https:\/\/twitter.com\/iamtoystori\"><i class=\"fa fa-twitter\"><\/i><\/a><\/li>/)
            done()
          })
       })
    })
  })
})
