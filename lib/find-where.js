'use strict'

const _ = require('lodash/string')

/**
 * Gets all entries that match the given criteria
 *
 * @param {number} where - The criteria to be met.
 * @param {object} [opts] - An optional options object
 * @param {boolean} [opts.includeRemoved] - Find removed items as well
 * @returns {Promise.<Array>} - A promise resolving to the fetched entries array.
 * @throws {NotFoundError} - No entries with the given criteria were found.
 */
module.exports = function (where, opts) {
  let delAttribute

  where = where || {}

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
    .fetchAll({ require: true })
    .then((objs) => objs.toJSON())
    .catch(this.collection().constructor.EmptyError, (err) => {
      throw new this.Errors.NotFoundError(err)
    })
}