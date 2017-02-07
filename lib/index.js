const _ = require('lodash')
const Errors = require('@c8/errors')

module.exports = (bookshelf) => {
  if (!bookshelf) {
    throw new Error('Must pass an initialized bookshelf instance')
  }

  return bookshelf.Model.extend({
    // It assumes the table has creation/update timestamp column. If it doesn't, the sub-Model needs to declare
    // `hasTimestamps: false`
    hasTimestamps: [ 'createdDate', 'lastUpdatedDate' ],
    delAttribute: 'isDeleted',

    _transacting: null,
    _withRelated: null
  }, {

    transacting: function (t) {
      this._transacting = t
      return this
    },

    withRelated: function (r) {
      this._withRelated = r
      return this
    },

    /**
     * Insert new entry
     * @param {Object} data - Entry object
     * @returns {Promise.<Object>}
     */
    insert: function (data) {
      let options = {
        method: 'insert',
        require: true
      }

      if (this._transacting) {
        Object.assign(options, { transacting: this._transacting })
      }

      return new this(data)
        .save(null, options)
        .then(newEntry => newEntry.toJSON())
        .catch(err => Promise.reject(Errors.utils.bookshelfToC8(err)))
    },

    /**
     *
     * @param opts
     * @returns {Promise.<TResult>}
     */
    findAll: function (opts) {
      let delAttribute
      const where = {}

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
        .fetchAll()
        .then((entries) => entries.invokeThen('toJSON'))
        .catch(this.EmptyError, () => Promise.reject(new Errors.NotFoundError('NotFoundError')))
        .catch(err => Promise.reject(Errors.utils.bookshelfToC8(err)))
    },

    /**
     *
     * @param id
     * @param opts
     * @returns {Promise.<TResult>}
     */
    findById: function (id, opts) {
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
        .catch(this.NotFoundError, err => Promise.reject(new Errors.NotFoundError(err)))
        .catch(err => Promise.reject(Errors.utils.bookshelfToC8(err)))
    },

    /**
     *
     * @param where
     * @param opts
     * @returns {Promise.<TResult>}
     */
    findWhere: function (where, opts) {
      if (this.prototype.delAttribute) {
        // Soft-remove enabled, set where clause to only fetch non-removed items.
        where[this.prototype.delAttribute] = false
      }

      if (opts && (this.prototype.delAttribute && opts.includeRemoved)) {
        // Show soft-removed items as well.
        delete where[this.prototype.delAttribute]
      }

      where = _.mapKeys(where, (v, k) => {
        return _.snakeCase(k)
      })

      return this
        .where(where)
        .fetchAll({ require: true })
        .then((entries) => entries.invokeThen('toJSON'))
        .catch(this.EmptyError, () => Promise.reject(new Errors.NotFoundError('NotFoundError')))
        .catch(err => Promise.reject(Errors.utils.bookshelfToC8(err)))
    },

    /**
     *
     * @param id
     * @returns {Promise.<T>}
     */
    removeById: function (id) {
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
    },

    /**
     *
     * @param id
     * @param data
     * @param opts
     * @returns {Promise.<TResult>}
     */
    updateById: function (id, data, opts) {
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
    },

    EmptyError: bookshelf.Collection.EmptyError
  })
}
