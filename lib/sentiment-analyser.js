'use strict'

const countWordsFromDictionary = (dictionary, text) =>
  text.split(' ').reduce((count, word) =>
      dictionary.indexOf(word) !== -1 ? count + 1 : count, 0)

module.exports = (positiveWordDictionary, negativeWordDictionary, text) => {
  const numberOfPositiveWords = countWordsFromDictionary(positiveWordDictionary, text)
  const numberOfNegativeWords = countWordsFromDictionary(negativeWordDictionary, text)

  const positivity = numberOfPositiveWords - numberOfNegativeWords

  if (positivity > 2) {
    return 'positive'
  }

  return positivity < 0 ? 'negative' : 'neutral'
}
