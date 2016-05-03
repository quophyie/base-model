'use strict'

const createError = require('create-error')

module.exports = function modelBase (bookshelf) {
  if (!bookshelf) {
    throw new Error('Must pass an initialized bookshelf instance')
  }
  const BaseModel = bookshelf.Model.extend({
    // It assumes the table has creation/update timestamp column. If it doesn't, the sub-Model needs to declare
    // `hasTimestamps: false`
    hasTimestamps: [ 'createdDate', 'lastUpdatedDate' ],
    delAttribute: 'isDeleted'
  }, {
    // General purpose functions. Please note that no function features where clauses.
    // Any other specific functions should be added to the sub-Model itself.
    findAll: require('./find-all'),
    findById: require('./find-by-id'),
    insert: require('./insert'),
    // It assumes the table has an `is_deleted` column (it doesn't hard-delete). If it doesn't, the sub-Model needs to
    // override this method.
    remove: require('./remove'),
    update: require('./update'),

    // Errors - properties can be overridden to throw custom exceptions.
    Errors: {
      NotFoundError: createError('NotFoundError'),
      NotUpdatedError: createError('NotUpdatedError'),
      NotRemovedError: createError('NotRemovedError')
    }
  })

  return BaseModel
}