/* eslint-env mocha */
'use strict'

const Code = require('code')
const expect = Code.expect
const bookshelf = require('./bookshelf')
const BaseModel = require('../lib/index')(bookshelf)

describe('BaseModel', function () {
  let TestModel
  let entry

  before(function () {
    return bookshelf
      .knex
      .migrate
      .latest()
  })

  beforeEach(function () {
    TestModel = BaseModel.extend({
      tableName: 'test_table'
    })

    entry = new TestModel({
      id: 1000,
      name: 'Marvel'
    })

    return entry.save(null, { method: 'insert' })
  })

  afterEach(function () {
    return entry.destroy()
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
        expect(entries.length).to.be.above(0)
      })
  })

  it('should throw if entry.id does not exist in findById', function () {
    return TestModel
      .findById(1000000)
      .then(() => Code.fail())
      .catch(TestModel.Errors.NotFoundError, () => {
        expect(true).to.be.true()
      })
  })

  it('should find an entry by id', function () {
    return TestModel
      .findById(1000)
      .then((entry) => {
        expect(entry).to.be.an.object()
      })
  })

  it('should throw if entry.id does not exist in update', function () {
    return TestModel
      .update({ id: 1000000, name: 'some other name' })
      .then(() => Code.fail())
      .catch(TestModel.Errors.NotUpdatedError, () => {
        expect(true).to.be.true()
      })
  })

  it('should update an entry', function () {
    return TestModel
      .update({ id: 1000, name: 'some other name' })
      .then((entry) => {
        expect(entry).to.be.an.object()
      })
  })

  it('should throw if entry.id does not exist in remove', function () {
    return TestModel
      .remove(1000000)
      .then(() => Code.fail())
      .catch(TestModel.Errors.NotRemovedError, () => {
        expect(true).to.be.true()
      })
  })

  it('should remove an entry', function () {
    return TestModel
      .remove(1000)
      .then((entry) => {
        expect(entry).to.be.an.object()
        expect(entry.isDeleted).to.be.true()
      })
  })
})
