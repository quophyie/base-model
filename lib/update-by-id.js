'use strict'

/**
 * Updates an existing entry in the database.
 *
 * @param {object} entry - The Campaign object to update.
 * @param {number} entry.id - The ID of the Campaign to update.
 * @returns {Promise.<Object>} A Promise resolving to the updated entry fields.
 * @throws {TypeError} `entry.id` must exist and be integer.
 * @throws {NotFoundError} An entry with the given `entry.id` must exist.
 */
module.exports = function (entry) {
  if (!entry[this.prototype.idAttribute]) {
    return Promise.reject(new TypeError(`Invalid entry.${this.prototype.idAttribute} value: must be an integer`))
  }
  return new this(entry)
    .save(null, { method: 'update', require: true })
    .then((updatedEntry) => updatedEntry.toJSON())
    .catch(this.NoRowsUpdatedError, (err) => {
      throw new this.Errors.NotUpdatedError(err)
    })
}
