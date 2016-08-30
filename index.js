'use strict'

const createServer = require('./server')

createServer((err, server) => {
  if (err) {
    return console.error(err)
  }

  server.start(err => {
    if (err) {
      return console.log(err)
    }
  })
})
