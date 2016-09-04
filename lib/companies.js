'use strict'

const ObjectId = require('mongodb').ObjectId

const forCompanyList = document => ({
  id: document._id.valueOf(),
  name: document.name
})

const forCompanyDetails = document =>
  Object.assign(forCompanyList(document), {
    tickerCode: document.tickerCode,
    stockPrice: 1234
  })

class Companies {
  constructor (db) {
    this._db = db
  }

  list (callback) {
    return this._db
      .collection('company')
      .find({})
      .toArray((err, documents) => {
        if (err) {
          return callback(new Error('Database error'))
        }

        callback(null, documents.map(forCompanyList))
      })
  }

  details (id, callback) {
    return this._db
      .collection('company')
      .find(ObjectId(id))
      .toArray((err, documents) => {
        if (err) {
          return callback(new Error('Database error'))
        }

        callback(null, documents.length ? forCompanyDetails(documents[0]) : null)
      })
  }
}

module.exports = Companies
