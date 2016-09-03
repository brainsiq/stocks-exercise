'use strict'

const expect = require('chai').expect

const testCompaniesData = [
  {_id: '1', name: 'one', tickerCode: 'A'},
  {_id: '2', name: 'two', tickerCode: 'B'},
  {_id: '3', name: 'three', tickerCode: 'C'}
]

const stubMongoDatabase = withError => ({
  collection (name) {
    if (name !== 'company') {
      throw new Error('Expected MongoDb "company" collection to be accessed')
    }

    return {
      find (query) {
        if (Object.keys(query).length) {
          throw new Error('MongoDb find should be called with an empty query to get all records.')
        }

        return {
          toArray (callback) {
            if (withError) {
              return callback(withError)
            }

            callback(null, testCompaniesData)
          }
        }
      }
    }
  }
})

const CompaniesDatabase = require('../../lib/companies-db')

describe('Companies database', () => {
  describe('get', () => {
    it('retrieves all companies from the database', done => {
      const companiesDatabase = new CompaniesDatabase(stubMongoDatabase())

      companiesDatabase.get((err, companies) => {
        if (err) {
          return done(err)
        }

        expect(companies).to.deep.equal([
          {id: '1', name: 'one'},
          {id: '2', name: 'two'},
          {id: '3', name: 'three'}
        ])
        done()
      })
    })
  })

  it('handles mongoDb errors', done => {
    const companiesDatabase = new CompaniesDatabase(
      stubMongoDatabase(new Error('a test error')))

    companiesDatabase.get((err, companies) => {
      expect(err).to.be.an.instanceof(Error)
      expect(err.message).to.equal('Database error')
      expect(companies).to.be.undefined
      done()
    })
  })
})
