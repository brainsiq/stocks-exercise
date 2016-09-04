'use strict'

const ObjectId = require('mongodb').ObjectId

module.exports = mongoDatabase => ({
  getCompanies (callback) {
    return mongoDatabase
      .collection('company')
      .find({})
      .toArray((err, documents) => {
        if (err) {
          return callback(new Error('Database error'))
        }

        return callback(null, documents)
      })
  },
  getCompany (id, callback) {
    return mongoDatabase
      .collection('company')
      .find(ObjectId(id))
      .toArray((err, documents) => {
        if (err) {
          return callback(new Error('Database error'))
        }

        return callback(null, documents.length ? documents[0] : null)
      })
  }
})
