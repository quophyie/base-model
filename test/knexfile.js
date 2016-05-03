'use strict'

const path = require('path')

// Update with your config settings.

module.exports = {
  test: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '/test.sqlite3')
    },
    migrations: {
      directory: path.join(__dirname, '/migrations')
    }
  }
}
