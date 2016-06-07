'use strict'

const _ = require('lodash')

/**
 * Gets all entries that match the given criteria
 *
 * @param {object} where - The criteria to be met.
 * @param {object} [opts] - An optional options object
 * @param {boolean} [opts.includeRemoved] - Find removed items as well
 * @returns {Promise.<Array>} - A promise resolving to the fetched entries array.
 */
module.exports = function (where, opts) {
  let delAttribute

  if (this.prototype.delAttribute) {
    // Soft-remove enabled, set where clause to only fetch non-removed items.
    delAttribute = _.snakeCase(this.prototype.delAttribute)
    where[delAttribute] = false
  }

  where = _.mapKeys(where, (v, k) => {
    return _.snakeCase(k)
  })

  if (opts && (this.prototype.delAttribute && opts.includeRemoved)) {
    // Show soft-removed items as well.
    delete where[delAttribute]
  }

  return this
    .where(where)
    .fetchAll()
    .then((entries) => entries.invokeThen('toJSON'))
}
