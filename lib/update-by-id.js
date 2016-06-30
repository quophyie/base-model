'use strict'

const _ = require('lodash/string')
const Errors = require('@c8/errors')

/**
 * Updates an existing entry in the database.
 *
 * @param {number} id - The ID of the Campaign to update.
 * @param {object} data - The Campaign object to update.
 * @param {object} [opts] An optional options object
 * @param {boolean} [opts.includeRemoved] Find removed items as well
 * @returns {Promise.<Object>} A Promise resolving to the updated entry fields.
 * @throws {TypeError} `entry.id` must exist and be integer.
 * @throws {NotFoundError} An entry with the given `entry.id` must exist.
 */
module.exports = function (id, data, opts) {
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
    .then((entry) => {
      return entry
        .save(data, {
          method: 'update',
          require: true,
          patch: true
        })
        .then((entry) => entry.toJSON())
    })
    .catch(this.NotFoundError, () => Promise.reject(new Errors.NotFoundError('NotFoundError')))
    .catch(err => Promise.reject(Errors.utils.bookshelfToC8(err)))
}
