'use strict'

/**
 * Removes the given entry from the database.
 *
 * @param {number} id - The entry ID.
 * @returns {Promise.<Object>} A Promise resolving to the destroyed entry.
 * @throws {NotFoundError} A Campaign with the given `id` must exist.
 */
module.exports = function (id) {
  return new this({ [this.prototype.idAttribute]: id })
    .save({ [this.prototype.delAttribute]: true }, { require: true })
    .then((removedEntry) => removedEntry.toJSON())
    .catch(this.NoRowsUpdatedError, (err) => {
      throw new this.Errors.NotRemovedError(err)
    })
}
