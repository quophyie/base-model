/* eslint-env mocha */
'use strict'

const Code = require('code')
const expect = Code.expect
const bookshelf = require('./bookshelf')
const BaseModel = require('../lib/index')(bookshelf)
const knex = bookshelf.knex

const Errors = require('@c8/errors')

let TestModel = BaseModel.extend({
  tableName: 'test_table',

  related: function () {
    return this.hasOne(TestRelated, 'test_id')
  }
})

let TestRelated = BaseModel.extend({
  tableName: 'test_related'
})

let EmptyModel = BaseModel.extend({
  tableName: 'empty_table'
})

describe('BaseModel', function () {
  let entry
  let removedEntry

  before(function () {
    return bookshelf
      .knex
      .migrate
      .latest()
      .then(() => knex.raw('DELETE FROM "test_related";'))
      .then(() => knex.raw('DELETE FROM "test_table";'))
  })

  beforeEach(function () {
    entry = new TestModel({
      id: 1000,
      name: 'Marvel',
      isDeleted: false
    })

    removedEntry = new TestModel({
      id: 1001,
      name: 'Deleted',
      isDeleted: true
    })

    return entry
      .save(null, {method: 'insert'})
      .then(() => removedEntry.save(null, {method: 'insert'}))
  })

  afterEach(function () {
    return knex.raw('DELETE FROM "test_related";')
      .then(() => knex.raw('DELETE FROM "test_table";'))
  })

  it('should insert a new entry', function () {
    return TestModel
      .insert({
        name: 'DC Comics'
      })
      .then((entry) => {
        expect(entry).to.be.an.object()
        expect(entry.id).to.exist()
        expect(entry.name).to.equal('DC Comics')
        expect(entry.createdDate).to.exist()
        expect(entry.lastUpdatedDate).to.exist()
      })
  })

  it('should find all entries', function () {
    return TestModel
      .findAll()
      .then((entries) => {
        expect(entries).to.be.an.array()
        expect(entries.length).to.equal(1)
      })
  })

  it('find all entries from the empty_table', function () {
    return EmptyModel
      .findAll()
      .then((entries) => {
        expect(entries).to.be.an.array()
        expect(entries.length).to.equal(0)
      })
  })

  it('should find all entries including deleted', function () {
    return TestModel
      .includeRemoved()
      .findAll()
      .then((entries) => {
        expect(entries).to.be.an.array()
        expect(entries.length).to.equal(2)
      })
  })

  it('should throw if entry.id does not exist in findById', function () {
    return TestModel
      .require()
      .findById(1000000)
      .then(() => Code.fail())
      .catch(Errors.NotFoundError, (err) => {
        expect(err).to.be.an.instanceof(Errors.NotFoundError)
      })
  })

  it('should throw if entry.id is a soft-deleted entry in findById', function () {
    return TestModel
      .require()
      .findById(1001)
      .then(() => Code.fail())
      .catch(Errors.NotFoundError, (err) => {
        expect(err).to.be.an.instanceof(Errors.NotFoundError)
      })
  })

  it('should find a soft-deleted entry by id', function () {
    return TestModel
      .findById(1001, {includeRemoved: true})
      .then((entry) => {
        expect(entry).to.be.an.object()
      })
  })

  it('should find an entry by id', function () {
    return TestModel
      .findById(1000)
      .then((entry) => {
        expect(entry).to.be.an.object()
      })
  })

  it('findWhere should find all entries that match the criteria', function () {
    return TestModel
      .findWhere({name: 'Marvel'})
      .then((entries) => {
        expect(entries).to.be.an.array()
        expect(entries.length).to.equal(1)
      })
  })

  it('findWhere should find all entries that match the criteria, including deleted ones', function () {
    return TestModel
      .findWhere({name: 'Deleted'}, {includeRemoved: true})
      .then((entries) => {
        expect(entries).to.be.an.array()
        expect(entries.length).to.equal(1)
      })
  })

  it('should throw if entry.id does not exist in update', function () {
    return TestModel
      .updateById(1000000, {name: 'some other name'})
      .then(() => Code.fail())
      .catch(Errors.NotFoundError, (err) => {
        expect(err).to.be.an.instanceof(Errors.NotFoundError)
      })
  })

  it('should throw if entry.id is a soft-deleted entry in update', function () {
    return TestModel
      .updateById(1001, {name: 'some other name'})
      .then(() => Code.fail())
      .catch(Errors.NotFoundError, (err) => {
        expect(err).to.be.an.instanceof(Errors.NotFoundError)
      })
  })

  it('should update a soft-deleted entry', function () {
    return TestModel
      .updateById(1001, {name: 'some other name'}, {includeRemoved: true})
      .then((entry) => {
        expect(entry).to.be.an.object()
      })
  })

  it('should update an entry', function () {
    return TestModel
      .updateById(1000, {name: 'some other name'})
      .then((entry) => {
        expect(entry).to.be.an.object()
      })
  })

  it('should throw if entry.id does not exist in remove', function () {
    return TestModel
      .require()
      .removeById(1000000)
      .then(() => Code.fail())
      .catch(err => {
        expect(err).to.be.an.instanceof(TestModel.NoRowsDeletedError)
      })
  })

  it('should throw if entry.id is a soft-deleted entry in remove', function () {
    return TestModel
      .require()
      .removeById(1001)
      .then(() => Code.fail())
      .catch(err => {
        expect(err).to.be.an.instanceof(TestModel.NoRowsDeletedError)
      })
  })

  it('should soft-remove an entry by default', function () {
    return TestModel.removeById(1000)
  })

  it('should throw if entry.id does not exist in a hard-remove', function () {
    TestModel.prototype.delAttribute = false // This should be the same as declaring it in the Model definition
    return TestModel
      .require()
      .removeById(1000000)
      .then(() => Code.fail())
      .catch(err => {
        expect(err).to.be.an.instanceof(TestModel.NoRowsDeletedError)
      })
  })

  it('should hard-remove an entry if delAttribute is set to false', function () {
    TestModel.prototype.delAttribute = false // This should be the same as declaring it in the Model definition
    return TestModel
      .removeById(1000)
      .then((entry) => {
        expect(entry).to.be.an.object()
        return TestModel.require().findById(1000)
      })
      .then((_) => Code.fail('entry should not exist'))
      .catch(err => {
        expect(err).to.be.an.instanceof(Errors.NotFoundError)
      })
  })

  describe('Transactions', () => {
    it('- should create a related entry using transactions', function () {
      return bookshelf.transaction(t => {
        return TestModel
          .transacting(t)
          .insert({name: 'Transaction Test'})
          .then(test => TestRelated
            .transacting(t)
            .insert({testId: test.id})
          )
      })
    })

    it('- should rollback the transaction', function () {
      return bookshelf.transaction(t => {
        return TestModel
          .transacting(t)
          .insert({name: 'Transaction Test'})
          .then(test => TestRelated
            .transacting(t)
            .insert({testId: null})
          )
      })
        .then(() => Code.fail())
        .catch(() => {
        })
    })
  })

  describe('Relationships', () => {
    it('- should return related model using .withRelated() method', () => {
      return TestModel
        .transacting(null)
        .insert({name: 'Relationships'})
        .then(test => TestRelated.insert({testId: test.id}).then(() => test))
        .then(test => TestModel
          .withRelated('related')
          .findById(test.id))
    })
  })
})
