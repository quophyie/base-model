'use strict'

/**
 * Updates an existing entry in the database.
 *
 * @param {number} id - The ID of the Campaign to update.
 * @param {object} data - The Campaign object to update.
 * @returns {Promise.<Object>} A Promise resolving to the updated entry fields.
 * @throws {TypeError} `entry.id` must exist and be integer.
 * @throws {NotFoundError} An entry with the given `entry.id` must exist.
 */
module.exports = function (id, data) {
  let forge = {}
  forge[this.prototype.idAttribute] = id

  return this
      .forge(forge)
      .save(data, {method: 'update', require: true})
      .then((entry) => entry.toJSON())
      .catch(this.NoRowsUpdatedError, (err) => {
        throw new this.Errors.NotUpdatedError(err)
      })
}
