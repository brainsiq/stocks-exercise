'use strict'

const webdriver = require('selenium-webdriver')
const expect = require('chai').expect

const siteUrl = 'http://app:8080'
const getRandomIntInRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const selectRandomLink = links =>
  links[getRandomIntInRange(0, links.length - 1)]

describe('Homepage', () => {
  let driver

  beforeEach(() => {
    driver = new webdriver.Builder()
      .forBrowser('phantomjs')
      .build()
  })

  afterEach(() => driver.quit())

  it('displays a list of companies', done => {
    driver.get(siteUrl)
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

  it('navigates to a company details page', done => {
    driver.get(siteUrl)
      .then(() => driver.findElements(webdriver.By.css('.container a')))
      .then(links => selectRandomLink(links))
      .then(link => Promise.all([link.getText(), link.click()]))
      .then(previous => {
        const companyName = previous[0]

        return driver.findElement(webdriver.By.css('.panel-heading'))
          .then(companyDetailsHeading => companyDetailsHeading.getText())
          .then(text => expect(text).to.equal(companyName))
      })
      .then(() => done(), done)
  })
})
