# base-model
A base model for all bookshelf-based models on our database layer.

## What it does
+ Adds `'createdDate'` and `'lastUpdatedDate'` timestamps to the Model (this can be changed by setting `hasTimestamps` to `false`);
+ Adds an 'isDeleted' column for setting the entry as removed, instead of hard-deleting it (this can be changed by setting `delAttribute`);
+ Provides CRUD methods (`findAll`, `findById`, `insert`, `removeById`, `updateById`);
  + Returns plain javascript objects and exceptions, which creates a clear separation between bookshelf and your business
  logic code;
  + `remove` does not hard-delete, instead it sets the `is_deleted` column to `true` (this behaviour can be changed by
  overriding the function or by setting `delAttribute` to false);

**NOTE:** BaseMode assumes you're using the awesome [`bookshelf-camelcase`](https://www.npmjs.com/package/bookshelf-camelcase)
plugin. If you're not, just set `hasTimestamps: ['created_date', 'last_updated_date']` and `delAttribute: 'is_deleted'`

## Install
```
npm install @c8/base-model
```

## Usage
`BaseModel` requires you to pass in an initialized instance of bookshelf, like in the example below:

```
const bookshelf = require('bookshelf')(db)
const BaseModel = require('../lib/index')(bookshelf)

const MyModel = BaseModel.extend({
  tableName: 'my_table' // needs to have created_date, last_updated_date and is_deleted columns
})

module.exports = bookshelf.model('MyModel', MyModel)
```

## API
### `findAll(opts)`
 * Gets all entries from the database.
 * `@param {object} [opts]` An optional options object
 * `@param {boolean} [opts.includeRemoved]` Find removed items as well
 * `@returns {Promise.<Array>}` A Promise resolving to the fetched entries array.

### `findById(id, opts)`
 * Gets an entry object by it's ID.
 * `@param {number} id` - The ID of the entry to get.
 * `@param {object} [opts]` An optional options object
 * `@param {boolean} [opts.includeRemoved]` Find removed items as well
 * `@returns {Promise.<Object>}` A promise resolving to the fetched entry.
 * `@throws {NotFoundError}` An entry with the given `id` must exist.

### `findWhere(where, opts)`
 * Gets all entries that match the given criteria
 * `@param {number} where` - The criteria to be met.
 * `@param {object} [opts]` - An optional options object.
 * `@param {boolean} [opts.includeRemoved]` - Find removed items as well.
 * `@returns {Promise.<Array>}` - A promise resolving to the fetched entries array.

### `insert(obj)`
 * Creates a new entry.
 * `@param {object} obj` - The object to be created.
 * `@returns {Promise.<Object>}` A Promise resolving to the newly created entry.

### `removeById(id)`
 * Removes the given entry from the database.
 * `@param {number} id` - The entry ID.
 * `@returns {Promise.<Object>}` A Promise resolving to the destroyed entry.
 * `@throws {NotFoundError}` A Campaign with the given `id` must exist.

### `updateById(id, entry, opts)`
 * Updates an existing entry in the database.
 * `@param {number} id` - The ID of the Campaign to update.
 * `@param {object} entry` - The Campaign object to update.
 * `@param {object} [opts]` An optional options object
 * `@param {boolean} [opts.includeRemoved]` Find removed items as well
 * `@returns {Promise.<Object>}` A Promise resolving to the updated entry fields.
 * `@throws {TypeError}` `entry.id` must exist and be integer.
 * `@throws {NotFoundError}` An entry with the given `entry.id` must exist.
