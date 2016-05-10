'use strict'

const _ = require('lodash/string')

/**
 * Gets an entry object by it's ID.
 *
 * @param {number} id - The ID of the entry to get.
 * @param {object} [opts] An optional options object
 * @param {boolean} [opts.includeRemoved] Find removed items as well
 * @returns {Promise.<Object>} A promise resolving to the fetched entry.
 * @throws {NotFoundError} An entry with the given `id` must exist.
 */
module.exports = function (id, opts) {
  let delAttribute
  const where = {
    [this.prototype.idAttribute]: id
  }

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
    .fetch({ require: true })
    .then((campaign) => campaign.toJSON())
    .catch(this.NotFoundError, (err) => {
      throw new this.Errors.NotFoundError(err)
    })
}
