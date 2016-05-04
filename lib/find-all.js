'use strict'

/**
 * Gets all entries from the database.
 *
 * @returns {Promise.<Array>} A Promise resolving to the fetched entries array.
 */
module.exports = function () {
  return this
    .fetchAll()
    .then((entries) => entries.invokeThen('toJSON'))
}
