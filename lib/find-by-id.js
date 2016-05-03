'use strict'

/**
 * Gets an entry object by it's ID.
 *
 * @param {number} id - The ID of the entry to get.
 * @returns {Promise.<Object>} A promise resolving to the fetched entry.
 * @throws {NotFoundError} An entry with the given `id` must exist.
 */
module.exports = function (id) {
  return this
    .where({ [this.prototype.idAttribute]: id })
    .fetch({ require: true })
    .then((campaign) => campaign.toJSON())
    .catch(this.NotFoundError, (err) => {
      throw new this.Errors.NotFoundError(err)
    })
}
