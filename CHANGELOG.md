## v2.0.0
+ `updateById(id, data)` now takes 2 parameters, first is the entry `id` and the second is the entry payload which basically consists of fields that has to be updated  

## v1.1.0
+ Support for hard-delete and not having an `isDeleted` column by setting `delAttribute` to false;

## v1.0.0
+ `'createdDate'` and `'lastUpdatedDate'` timestamps;
+ `isDeleted` column for setting the entry as removed, instead of hard-deleting it (this can be changed by setting `delAttribute`);
+ CRUD methods (`findAll`, `findById`, `insert`, `removeById`, `updateById`);
