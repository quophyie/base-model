## v3.1.0
+ Added `findWhere(where, opts)` function for conditional queries;
+ Replaced error dependency for `@c8/errors`;

## v3.0.0
+ `find*` functions return non-soft-removed items by default (`isDeleted: true`);
+ `updateById` and `removeById` functions modify non-soft-removed items by default;
+ `find*` and `updateById` functions accept an options object with `includeRemoved` boolean value that allows to query
soft-removed items;

## v2.0.1
+ `removeById` now throws `NotRemovedError` if no rows are deleted in hard-deletes. Closes [#9](https://github.com/c8management/base-model/issues/9);

## v2.0.0
+ `updateById(id, data)` now takes 2 parameters, first is the entry `id` and the second is the entry payload which basically consists of fields that has to be updated;

## v1.1.0
+ Support for hard-delete and not having an `isDeleted` column by setting `delAttribute` to false;

## v1.0.0
+ `'createdDate'` and `'lastUpdatedDate'` timestamps;
+ `isDeleted` column for setting the entry as removed, instead of hard-deleting it (this can be changed by setting `delAttribute`);
+ CRUD methods (`findAll`, `findById`, `insert`, `removeById`, `updateById`);
