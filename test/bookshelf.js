const knexFile = require('./knexfile')
const knex = require('knex')(knexFile['test'])
const bookshelf = require('bookshelf')(knex)

bookshelf.plugin('bookshelf-camelcase')
module.exports = bookshelf
