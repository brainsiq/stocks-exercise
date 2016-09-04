'use strict'

const expect = require('chai').expect
const common = require('./common')

describe('Homepage', function () {
  this.timeout(5000)

  let driver

  beforeEach(() => {
    driver = common.initialiseWebDriver()
  })

  afterEach(() => driver.quit())

  it('displays a list of companies', done => {
    driver.findElements({css: '.container a'})
      .then(links => {
        expect(links).to.have.length(5)

        return Promise.all([
          links[0].getText().then(text => expect(text).to.equal('Microsoft Inc')),
          links[1].getText().then(text => expect(text).to.equal('Google Inc')),
          links[2].getText().then(text => expect(text).to.equal('Apple Inc')),
          links[3].getText().then(text => expect(text).to.equal('Facebook Inc')),
          links[4].getText().then(text => expect(text).to.equal('Pearson Plc'))
        ])
      })
      .then(() => done(), done)
  })

  it('navigates to a company details page', done => {
    driver.findElement({partialLinkText: 'Microsoft'})
      .then(link => link.click())
      .then(() => driver.findElement({id: 'company-name'}))
      .then(element => element.getText())
      .then(companyName => expect(companyName).to.equal('Microsoft Inc'))
      .then(() => done(), done)
  })
})
