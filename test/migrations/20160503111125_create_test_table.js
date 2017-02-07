'use strict'

exports.up = function (knex, Promise) {
  return Promise
    .all([])
    .then(() => knex
      .schema
      .createTable('test_table', function (table) {
        table.increments('id')
        table.string('name').notNullable()
        table.timestamp('created_date')
        table.timestamp('last_updated_date')
        table.boolean('is_deleted')
      })
    )
    .then(() => knex
      .schema
      .createTable('test_related', function (table) {
        table.increments('id')
        table.integer('test_id').references('test_table.id').notNullable()
        table.timestamp('created_date')
        table.timestamp('last_updated_date')
        table.boolean('is_deleted')
      })
    )
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('test_related')
    .then(() => knex.schema.dropTable('test_table'))
}
