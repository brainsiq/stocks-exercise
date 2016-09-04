'use strict'

const expect = require('chai').expect

const positiveWords = ['positive', 'success', 'grow', 'gains', 'happy', 'healthy']
const negativeWords = ['disappointing', 'concerns', 'decline', 'drag', 'slump', 'feared']
const sentimentAnalyser = require('../../lib/sentiment-analyser').bind(null, positiveWords, negativeWords)

describe('Sentiment analyser', () => {
  it('is neutral when there is a single positive word', () => {
    expect(sentimentAnalyser('success')).to.equal('neutral')
  })

  it('is neutral when there are only two positive words', () => {
    expect(sentimentAnalyser('success grow')).to.equal('neutral')
  })

  it('is positive when there are more than two words which are positive', () => {
    expect(sentimentAnalyser('success grow gains')).to.equal('positive')
  })

  it('is negative when there are only negative words', () => {
    expect(sentimentAnalyser('concerns drag slump')).to.equal('negative')
  })

  it('is negative when there are more negative words than positive words', () => {
    expect(sentimentAnalyser('concerns positive decline')).to.equal('negative')
  })

  it('is neutral when there are the same number of positive and negative words', () => {
    expect(sentimentAnalyser('concerns positive decline grow')).to.equal('neutral')
  })

  it('is neutral when there is only one more positive than negative words', () => {
    expect(sentimentAnalyser('concerns positive grow')).to.equal('neutral')
  })

  it('is positive when there are more than two positive than negative words', () => {
    expect(sentimentAnalyser('converns positive grow success')).to.equal('positive')
  })
})
