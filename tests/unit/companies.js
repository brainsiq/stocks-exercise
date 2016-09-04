'use strict'

const ObjectId = require('mongodb').ObjectId
const expect = require('chai').expect

const testCompaniesData = [
  {_id: new ObjectId(), name: 'one', tickerCode: 'A'},
  {_id: new ObjectId(), name: 'two', tickerCode: 'B'},
  {_id: new ObjectId(), name: 'three', tickerCode: 'C'}
]

const stubMongoDatabase = withError => ({
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
              ? testCompaniesData.filter(c => c._id.equals(query))
              : testCompaniesData

            callback(null, results)
          }
        }
      }
    }
  }
})

const Companies = require('../../lib/companies')

describe('Companies', () => {
  describe('list', () => {
    it('retrieves all companies from the database', done => {
      const companies = new Companies(stubMongoDatabase())

      companies.list((err, companies) => {
        expect(err).to.be.null
        expect(companies).to.deep.equal([
          {id: testCompaniesData[0]._id.valueOf(), name: 'one'},
          {id: testCompaniesData[1]._id.valueOf(), name: 'two'},
          {id: testCompaniesData[2]._id.valueOf(), name: 'three'}
        ])
        done()
      })
    })
  })

  it('handles mongoDb errors', done => {
    const companies = new Companies(
      stubMongoDatabase(new Error('a test error')))

    companies.list((err, companies) => {
      expect(err).to.be.an.instanceof(Error)
      expect(err.message).to.equal('Database error')
      expect(companies).to.be.undefined
      done()
    })
  })

  describe('details', () => {
    it('retrieves a single company', done => {
      const companies = new Companies(stubMongoDatabase())
      const testCompanyId = testCompaniesData[1]._id.valueOf()

      companies.details(testCompanyId, (err, company) => {
        expect(err).to.be.null
        expect(company).to.deep.equal({
          id: testCompanyId,
          name: 'two',
          tickerCode: 'B'
        })
        done()
      })
    })

    it('returns nothing for a company that does not exist', done => {
      const companies = new Companies(stubMongoDatabase())

      companies.details(new ObjectId().valueOf(), (err, company) => {
        expect(err).to.be.null
        expect(company).to.be.null
        done()
      })
    })

    it('handles mongoDb errors', done => {
      const companies = new Companies(
        stubMongoDatabase(new Error('a test error')))

      companies.details(new ObjectId().valueOf(), (err, companies) => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.equal('Database error')
        expect(companies).to.be.undefined
        done()
      })
    })
  })
})
