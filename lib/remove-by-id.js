'use strict'

const _ = require('lodash/string')
const Errors = require('@c8/errors')

/**
 * Removes the given entry from the database.
 *
 * @param {number} id - The entry ID.
 * @returns {Promise.<Object>} A Promise resolving to the destroyed entry.
 * @throws {NotFoundError} A Campaign with the given `id` must exist.
 */
module.exports = function (id) {
  let delAttribute
  const where = {
    [this.prototype.idAttribute]: id
  }

  if (this.prototype.delAttribute) {
    // Soft-remove enabled, set where clause to only fetch non-removed items.
    delAttribute = _.snakeCase(this.prototype.delAttribute)
    where[delAttribute] = false
  }

  let promise = this.forge(where)

  if (this.prototype.delAttribute) {
    // Soft-remove - there's a delete attribute defined, set it to true.
    promise = promise
      .where(where)
      .fetch({ require: true })
      .then((entry) => {
        return entry
          .save({ [this.prototype.delAttribute]: true }, { require: true })
      })
      .catch(this.NotFoundError, () => Promise.reject(new Errors.NotFoundError('NotFoundError')))
  } else {
    // Hard-remove, destroy the item.
    promise = promise.destroy({ require: true })
  }

  return promise
    .then((removedEntry) => removedEntry.toJSON())
    .catch(this.NoRowsDeletedError, () => Promise.reject(new Errors.NotFoundError('NotFoundError')))
    .catch(err => Promise.reject(Errors.utils.bookshelfToC8(err)))
}
