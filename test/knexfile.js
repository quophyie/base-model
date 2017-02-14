'use strict'

const path = require('path')

// Update with your config settings.

module.exports = {
  test: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: process.env.PG_PORT || 5432, // if theres a process.env.PG_USER, we're in Codeship
      database: process.env.PG_DB || 'test',
      user: process.env.PG_USER || 'docker',
      password: process.env.PG_PASSWORD || 'docker'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, '/migrations')
    }
  }
}
