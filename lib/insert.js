'use strict'

/**
 * Creates a new entry.
 *
 * @param {object} obj - The object to be created.
 * @returns {Promise.<Object>} A Promise resolving to the newly created entry.
 */
module.exports = function (obj) {
  return new this(obj)
    .save(null, { method: 'insert', require: true })
    .then((newEntry) => newEntry.toJSON())
}
