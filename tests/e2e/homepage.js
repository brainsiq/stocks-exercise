'use strict'

const webdriver = require('selenium-webdriver')
const expect = require('chai').expect

describe('Homepage', () => {
  let driver

  beforeEach(() => {
    driver = new webdriver.Builder()
      .forBrowser('phantomjs')
      .build()
  })

  afterEach(() => driver.quit())

  it('displays a list of companies', done => {
    driver.get('http://app:8080')
      .then(() => driver.findElements(webdriver.By.css('.container a')))
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
})
