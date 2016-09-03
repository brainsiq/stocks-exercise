'use strict'

const mongoDbUrl = 'mongodb://mm_recruitment_user_readonly:rebelMutualWhistle@ds037551.mongolab.com:37551/mm-recruitment'
const Hapi = require('hapi')
const vision = require('vision')
const MongoClient = require('mongodb').MongoClient
const CompaniesDatabase = require('./lib/companies-db')

const registerViews = server =>
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'templates'
  })

const registerRoutes = (server, companiesDatabase) => {
  server.route({
    method: 'GET',
    path: '/',
    handler: (req, reply) => {
      companiesDatabase.get((err, companies) => {
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
    handler: (req, reply) => reply.view('company')
  })
}

module.exports = callback => {
  const server = new Hapi.Server()
  server.connection({port: 8080})

  server.register(vision, err => {
    if (err) {
      return callback(err)
    }

    MongoClient.connect(mongoDbUrl, (err, database) => {
      if (err) {
        return callback(new Error('Database connection error'))
      }

      const companiesDatabase = new CompaniesDatabase(database)

      registerViews(server)
      registerRoutes(server, companiesDatabase)

      callback(null, server)
    })
  })
}
