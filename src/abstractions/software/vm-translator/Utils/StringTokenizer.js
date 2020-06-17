/**
 * A simple tokenizer that splits a string using space as
 * a delimiter
 */
class StringTokenizer {
  /**
   * @param {string} line the line to tokenize
   */
  constructor (line) {
    // The current token object
    this.currentIndex = -1
    // current input
    this.input = ''
    // token array
    this.input = line.trim()
    this.tokenArray = this.input.split(' ')
  }

  /**
   * Get the next token in the input
   */
  nextToken () {
    this.currentIndex++
    if (this.currentIndex < this.tokenArray.length) {
      return this.tokenArray[this.currentIndex].trim()
    } else {
      return ''
    }
  }

  /**
   * Is there a token available in the input?
   */
  hasMoreTokens () {
    return this.currentIndex + 1 < this.tokenArray.length
  }

  /**
   * Counts the number of tokens
   */
  countTokens () {
    return this.tokenArray.length
  }
}
export default StringTokenizer
