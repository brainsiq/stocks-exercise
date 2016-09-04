'use strict'

const ObjectId = require('mongodb').ObjectId

module.exports = (testData, withError) => ({
  collection (name) {
    if (name !== 'company') {
      throw new Error('Expected MongoDb "company" collection to be accessed')
    }

    return {
      find (query) {
        const isFindById = query instanceof ObjectId
        if (!isFindById && Object.keys(query).length) {
          throw new Error('Expected db.find() to be called without an empty query to get all, or an ObjectId to get one.')
        }

        return {
          toArray (callback) {
            if (withError) {
              return callback(withError)
            }

            const results = isFindById
              ? testData.filter(c => c._id.equals(query))
              : testData

            callback(null, results)
          }
        }
      }
    }
  }
})
