'use strict'

const mongoDbUrl = 'mongodb://mm_recruitment_user_readonly:rebelMutualWhistle@ds037551.mongolab.com:37551/mm-recruitment'
const Hapi = require('hapi')
const vision = require('vision')
const inert = require('inert')
const MongoClient = require('mongodb').MongoClient
const Companies = require('./lib/companies')
const sentimentDictionaries = require('./lib/sentiment-dictionaries')
const sentimentAnalyser = require('./lib/sentiment-analyser')
  .bind(null, sentimentDictionaries.positiveWords, sentimentDictionaries.negativeWords)

const registerViews = server =>
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './templates',
    helpersPath: './templates/helpers',
    layoutPath: './templates/layouts',
    layout: 'default'
  })

const registerRoutes = (server, companies) => {
  // serve static assets
  // note this should ideally be done through a server like nginx rather
  // than serving through node
  server.route({
    method: 'GET',
    path: '/static/{param*}',
    handler: {
      directory: {
        path: 'static'
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: (req, reply) => {
      companies.list((err, companies) => {
        if (err) {
          throw err
        }

        reply.view('index', {companies})
      })
    }
  })

  server.route({
    method: 'GET',
    path: '/company/{id}',
    handler: (req, reply) => {
      companies.details(req.params.id, (err, company) => {
        if (err) {
          throw err
        }

        reply.view('company', company)
      })
    }
  })
}

module.exports = callback => {
  const server = new Hapi.Server()
  server.connection({port: 8080})

  server.register([vision, inert], err => {
    if (err) {
      return callback(err)
    }

    MongoClient.connect(mongoDbUrl, (err, database) => {
      if (err) {
        return callback(new Error('Database connection error'))
      }

      const companies = new Companies(database, sentimentAnalyser)

      registerViews(server)
      registerRoutes(server, companies)

      callback(null, server)
    })
  })
}
