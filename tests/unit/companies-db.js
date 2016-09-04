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

const CompaniesDatabase = require('../../lib/companies-db')

describe('Companies database', () => {
  describe('getAll', () => {
    it('retrieves all companies from the database', done => {
      const companiesDatabase = new CompaniesDatabase(stubMongoDatabase())

      companiesDatabase.getAll((err, companies) => {
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
    const companiesDatabase = new CompaniesDatabase(
      stubMongoDatabase(new Error('a test error')))

    companiesDatabase.getAll((err, companies) => {
      expect(err).to.be.an.instanceof(Error)
      expect(err.message).to.equal('Database error')
      expect(companies).to.be.undefined
      done()
    })
  })

  describe('getOne', () => {
    it('retrieves a single company', done => {
      const companiesDatabase = new CompaniesDatabase(stubMongoDatabase())
      const testCompanyId = testCompaniesData[1]._id.valueOf()

      companiesDatabase.getOne(testCompanyId, (err, company) => {
        expect(err).to.be.null
        expect(company).to.deep.equal({id: testCompanyId, name: 'two'})
        done()
      })
    })

    it('returns nothing for a company that does not exist', done => {
      const companiesDatabase = new CompaniesDatabase(stubMongoDatabase())

      companiesDatabase.getOne(new ObjectId().valueOf(), (err, company) => {
        expect(err).to.be.null
        expect(company).to.be.null
        done()
      })
    })

    it('handles mongoDb errors', done => {
      const companiesDatabase = new CompaniesDatabase(
        stubMongoDatabase(new Error('a test error')))

      companiesDatabase.getOne(new ObjectId().valueOf(), (err, companies) => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.equal('Database error')
        expect(companies).to.be.undefined
        done()
      })
    })
  })
})
