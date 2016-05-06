'use strict'

/**
 * Removes the given entry from the database.
 *
 * @param {number} id - The entry ID.
 * @returns {Promise.<Object>} A Promise resolving to the destroyed entry.
 * @throws {NotFoundError} A Campaign with the given `id` must exist.
 */
module.exports = function (id) {
  let promise = new this({ [this.prototype.idAttribute]: id })
  if (this.prototype.delAttribute) {
    // Soft-remove - there's a delete attribute defined, set it to true.
    promise = promise.save({ [this.prototype.delAttribute]: true }, { require: true })
  } else {
    // Hard-remove.
    promise = promise.destroy({ require: true })
  }
  return promise
    .then((removedEntry) => removedEntry.toJSON())
    .catch(this.NoRowsUpdatedError, this.NoRowsDeletedError, (err) => {
      throw new this.Errors.NotRemovedError(err)
    })
}
