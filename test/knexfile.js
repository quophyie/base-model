'use strict'

// Update with your config settings.

module.exports = {
  test: {
    client: 'sqlite3',
    connection: {
      filename: __dirname + '/test.sqlite3'
    },
    migrations: {
      directory: __dirname + '/migrations'
    }
  }
}