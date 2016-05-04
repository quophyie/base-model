'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.createTable('test_table', function (table) {
    table.increments('id')
    table.string('name').notNullable()
    table.timestamp('created_date')
    table.timestamp('last_updated_date')
    table.boolean('is_deleted')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('test_table')
}
