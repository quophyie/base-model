'use strict'

const _ = require('lodash/string')

/**
 * Gets all entries from the database.
 *
 * @param {object} [opts] An optional options object
 * @param {boolean} [opts.includeRemoved] Find removed items as well
 * @returns {Promise.<Array>} A Promise resolving to the fetched entries array.
 */
module.exports = function (opts) {
  let delAttribute
  const where = {}

  if (this.prototype.delAttribute) {
    // Soft-remove enabled, set where clause to only fetch non-removed items.
    delAttribute = _.snakeCase(this.prototype.delAttribute)
    where[delAttribute] = false
  }

  if (opts && (this.prototype.delAttribute && opts.includeRemoved)) {
    // Show soft-removed items as well.
    delete where[delAttribute]
  }

  return this
    .where(where)
    .fetchAll()
    .then((entries) => entries.invokeThen('toJSON'))
}
