const onDateFilter = require('../src/utils/onDateFilter')
const {expect} = require('chai')

describe('#onDateFiler', () => {
  it('should return filter for a whole day', () => {
    const date = new Date('2018-01-01T00:12:00.000')
    const actual = onDateFilter(date)
    const expected = {
      $and: {
        $gt: new Date('2018-01-01T00:00:00.000'),
        $lt: new Date('2018-01-01T23:59:59.999')
      }
    }
    expect(actual).to.eql(expected)
  })
})
