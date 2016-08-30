'use strict'

const Hapi = require('hapi')
const vision = require('vision')

const registerViews = server =>
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'templates'
  })

const registerRoutes = server => {
  server.route({
    method: 'GET',
    path: '/',
    handler: (req, reply) => reply.view('index')
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

    registerViews(server)
    registerRoutes(server)

    callback(null, server)
  })
}
