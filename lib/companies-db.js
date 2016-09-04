'use strict'

const ObjectId = require('mongodb').ObjectId

const toCompany = document => ({
  id: document._id.valueOf(),
  name: document.name
})

class CompaniesDatabase {
  constructor (db) {
    this._db = db
  }

  getAll (callback) {
    return this._db
      .collection('company')
      .find({})
      .toArray((err, documents) => {
        if (err) {
          return callback(new Error('Database error'))
        }

        callback(null, documents.map(toCompany))
      })
  }

  getOne (id, callback) {
    return this._db
      .collection('company')
      .find(ObjectId(id))
      .toArray((err, documents) => {
        if (err) {
          return callback(new Error('Database error'))
        }

        callback(null, documents.length ? documents.map(toCompany)[0] : null)
      })
  }
}

module.exports = CompaniesDatabase
