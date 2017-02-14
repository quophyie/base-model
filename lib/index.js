const _ = require('lodash')
const Errors = require('@c8/errors')

module.exports = (bookshelf) => {
  if (!bookshelf) {
    throw new Error('Must pass an initialized bookshelf instance')
  }

  let BaseModel = bookshelf.Model.extend({
    // It assumes the table has creation/update timestamp column. If it doesn't, the sub-Model needs to declare
    // `hasTimestamps: false`
    hasTimestamps: [ 'createdDate', 'lastUpdatedDate' ],
    delAttribute: 'is_deleted',

    _transacting: null,
    _withRelated: [],
    _require: false,
    _debug: false,
    _includeRemoved: false,

    initialize: function () {
      this.on('created',   () => { BaseModel.__resetOptions() })
      this.on('destroyed', () => { BaseModel.__resetOptions() })
      this.on('fetched',   () => { BaseModel.__resetOptions() })
      this.on('saved',     () => { BaseModel.__resetOptions() })
      this.on('updated',   () => { BaseModel.__resetOptions() })
    }
  }, {
    __optionsBuilder: function () {
      let options = {}
      if (this.prototype._withRelated) {
        Object.assign(options, { withRelated: this.prototype._withRelated })
      }
      Object.assign(options, {
        require: this.prototype._require,
        debug: this.prototype._debug
      })
      return options
    },

    __whereClauseBuilder: function () {
      let clause = {}
      if (this.prototype.delAttribute) {
        Object.assign(clause, { [this.prototype.delAttribute]: false })
      }
      if (this.prototype.delAttribute && this.prototype._includeRemoved) {
        _.unset(clause, this.prototype.delAttribute)
      }
      return clause
    },

    __resetOptions: function () {
      this.prototype._transacting = null
      this.prototype._withRelated = []
      this.prototype._require = false
      this.prototype._debug = false
      this.prototype._includeRemoved = false
    },

    transacting: function (t) {
      this.prototype._transacting = t
      return this
    },

    withRelated: function (...args) {
      this.prototype._withRelated = [...args]
      return this
    },

    withRelatedQuery: function (...args) {
      this.prototype._withRelated.push(...args)
      return this
    },

    require: function (require = true) {
      this.prototype._require = require
      return this
    },

    debug: function (debug = true) {
      this.prototype._debug = debug
      return this
    },

    includeRemoved: function (include = true) {
      this.prototype._includeRemoved = include
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
        .then(newEntry => {
          this.__resetOptions()
          return newEntry.toJSON()
        })
        .catch(err => Promise.reject(Errors.utils.bookshelfToC8(err)))
    },

    /**
     *
     * @param opts
     * @returns {Promise.<Object>}
     */
    findAll: function (opts) {
      let clause = this.__whereClauseBuilder()
      let options = this.__optionsBuilder()

      return this
        .where(clause)
        .fetchAll(options)
        .then((entries) => {
          this.__resetOptions()
          return entries.invokeThen('toJSON')
        })
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
      let options = this.__optionsBuilder()
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
        .fetch(options)
        .then((campaign) => {
          this.__resetOptions()
          return campaign ? campaign.toJSON() : {}
        })
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
        .then((entries) => {
          this.__resetOptions()
          return entries.invokeThen('toJSON')
        })
        .catch(this.EmptyError, () => Promise.reject(new Errors.NotFoundError('NotFoundError')))
        .catch(err => Promise.reject(Errors.utils.bookshelfToC8(err)))
    },

    /**
     *
     * @param id
     * @returns {Promise.<T>}
     */
    removeById: function (id) {
      let options = this.__optionsBuilder()

      return Promise
        .all([])
        .then(() => this.prototype.delAttribute
          ? new this({ [this.prototype.idAttribute]: id })
            .where({ [this.prototype.delAttribute]: false })
            .save({ [this.prototype.delAttribute]: true }, _.assign(options, { patch: true }))
            .catch(this.NoRowsUpdatedError, () => Promise.reject(new this.NoRowsDeletedError(`Entry with id:${id} not deleted`)))
          : new this({ [this.prototype.idAttribute]: id })
            .destroy(options)
            .catch(this.NoRowsDeletedError, () => Promise.reject(new this.NoRowsDeletedError(`Entry with id:${id} not deleted`)))
        )
        .then(removedEntry => removedEntry.toJSON())
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
            .then((entry) => {
              this.__resetOptions()
              return entry.toJSON()
            })
        })
        .catch(this.NotFoundError, () => Promise.reject(new Errors.NotFoundError('NotFoundError')))
        .catch(err => Promise.reject(Errors.utils.bookshelfToC8(err)))
    },

    EmptyError: bookshelf.Collection.EmptyError
  })

  return BaseModel
}
