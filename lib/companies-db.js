'use strict'

const toCompany = document => ({
  id: document._id,
  name: document.name
})

class CompaniesDatabase {
  constructor (db) {
    this._db = db
  }

  get (callback) {
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
}

module.exports = CompaniesDatabase
