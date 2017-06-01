import { expect } from 'chai';
import Time from '../src/time';
import moment from 'moment';
import { CraftAiTimeError } from '../src/errors';

describe('Time(...)', function() {
  it('works with no parameters', function() {
    expect(Time()).to.have.property('timestamp');
    expect(Time()).to.have.property('day_of_week');
    expect(Time()).to.have.property('time_of_day');
    expect(Time()).to.have.property('day_of_month');
    expect(Time()).to.have.property('month_of_year');
    expect(Time()).to.have.property('timezone');

    expect(new Time()).to.have.property('timestamp');
    expect(new Time()).to.have.property('day_of_week');
    expect(new Time()).to.have.property('time_of_day');
    expect(new Time()).to.have.property('day_of_month');
    expect(new Time()).to.have.property('month_of_year');
    expect(new Time()).to.have.property('timezone');
  });

  it('creates instances of Time', function() {
    expect(Time(5623879)).to.be.an.instanceof(Time);

    expect(new Time('2016-06-30 05:30')).to.be.an.instanceof(Time);
  });

  describe('from unix timestamps', function() {
    it('works with a plain timestamp', function() {
      if (moment.unix(1465496929).utcOffset() === 120) {
        // Test depends on locale
        expect(Time(1465496929)).to.be.deep.equal({
          utc: '2016-06-09T18:28:49.000Z',
          timestamp: 1465496929,
          day_of_week: 3,
          day_of_month: 9,
          month_of_year: 6,
          time_of_day: 20.480277777777776,
          timezone: '+02:00'
        });
      }
      expect(Time(1465496929).timestamp).to.be.equal(1465496929);
      expect(Time(230536800).timestamp).to.be.equal(230536800);
    });

    it('works with a timestamp and specified positive timezone', function() {
      expect(Time(1465496929, '+02:00')).to.be.deep.equal({
        utc: '2016-06-09T18:28:49.000Z',
        timestamp: 1465496929,
        day_of_week: 3,
        day_of_month: 9,
        month_of_year: 6,
        time_of_day: 20.480277777777776,
        timezone: '+02:00'
      });
    });

    it('works with a timestamp and specified negative timezone', function() {
      expect(Time(1465496929, '+10:00')).to.be.deep.equal({
        utc: '2016-06-09T18:28:49.000Z',
        timestamp: 1465496929,
        day_of_week: 4,
        day_of_month: 10,
        month_of_year: 6,
        time_of_day: 4.480277777777778,
        timezone: '+10:00'
      });
    });
  });

  describe('from ISO 8601 strings', function() {
    if (moment('2010-01-01T05:06:30').utcOffset() === 60) {
      // Test depends on locale
      it('works with a date having no specified timezone', function() {
        expect(Time('2010-01-01T05:06:30')).to.be.deep.equal({
          utc: '2010-01-01T05:06:30.000Z',
          timestamp: 1262322390,
          day_of_week: 4,
          day_of_month: 1,
          month_of_year: 1,
          time_of_day: 6.108333333333333,
          timezone: '+01:00'
        });
      });
    }

    if (moment('2010-01-01T05:06:30').utcOffset() === 60) {
      // Test depends on locale
      it('works with a date having no specified timezone and an explicit timezone', function() {
        expect(Time('2010-01-01T05:06:30', '-10:00')).to.be.deep.equal({
          utc: '2010-01-01T05:06:30.000Z',
          timestamp: 1262322390,
          day_of_week: 3,
          day_of_month: 31,
          month_of_year: 12,
          time_of_day: 19.108333333333334,
          timezone: '-10:00'
        });
      });
    }

    it('works with a date having a specified timezone', function() {
      expect(Time('1977-04-22T01:00:00-05:00')).to.be.deep.equal({
        utc: '1977-04-22T06:00:00.000Z',
        timestamp: 230536800,
        day_of_week: 4,
        time_of_day: 1,
        day_of_month: 22,
        month_of_year: 4,
        timezone: '-05:00'
      });
    });

    it('works with a date having a specified UTC timezone', function() {
      expect(Time('1977-04-22T01:00:00+00:00')).to.be.deep.equal({
        utc: '1977-04-22T01:00:00.000Z',
        timestamp: 230518800,
        day_of_week: 4,
        time_of_day: 1,
        day_of_month: 22,
        month_of_year: 4,
        timezone: '+00:00'
      });
    });

    it('works with a date having a specified timezone and an explicit timezone', function() {
      expect(Time('1977-04-22T01:00:00-05:00', '+02:00')).to.be.deep.equal({
        utc: '1977-04-22T06:00:00.000Z',
        timestamp: 230536800,
        day_of_week: 4,
        time_of_day: 8,
        day_of_month: 22,
        month_of_year: 4,
        timezone: '+02:00'
      });
    });
  });

  describe('from new Date(...)', function() {
    if (moment(new Date('Wed Mar 25 2015 09:50:00 CDT')).utcOffset() === 60) {
      // Test depends on locale
      it('works with a date having a specified timezone', function() {
        expect(Time(new Date('Wed Mar 25 2015 09:50:00 CDT'))).to.be.deep.equal({
          utc: '2015-03-25T14:50:00.000Z',
          timestamp: 1427295000,
          day_of_week: 2,
          time_of_day: 15.833333333333334,
          day_of_month: 25,
          month_of_year: 3,
          timezone: '+01:00'
        });
      });
    }

    if (moment(new Date('Wed Mar 25 2015 09:50:00 CDT')).utcOffset() === 60) {
      // Test depends on locale
      it('works with a date having a specified timezone and a given timezone', function() {
        expect(Time(new Date('Wed Mar 25 2015 09:50:00 CDT'), '+05:30')).to.be.deep.equal({
          utc: '2015-03-25T14:50:00.000Z',
          timestamp: 1427295000,
          day_of_week: 2,
          time_of_day: 20.333333333333332,
          day_of_month: 25,
          month_of_year: 3,
          timezone: '+05:30'
        });
      });
    }

    if (moment('2015-03-29T09:15:30.000Z').utcOffset() === 120) {
      // Test depends on locale
      it('considers sunday to be the sixth day', function() {
        expect(Time(new Date('Sun Mar 29 2015 10:15:30 GMT+0100 (W. Europe Standard Time)'))).to.be.deep.equal({
          utc: '2015-03-29T09:15:30.000Z',
          timestamp: 1427620530,
          day_of_week: 6,
          time_of_day: 11.258333333333333,
          day_of_month: 29,
          month_of_year: 3,
          timezone: '+02:00'
        });
      });
    }
  });

  describe('from a moment(...)', function() {
    if (moment('2013-07-23').utcOffset() === 120) {
      // Test depends on locale
      it('works with a date having no specified timezone', function() {
        expect(new Time(moment('2013-07-23'))).to.be.deep.equal({
          utc: '2013-07-22T22:00:00.000Z',
          timestamp: 1374530400,
          day_of_week: 1,
          day_of_month: 23,
          month_of_year: 7,
          time_of_day: 0,
          timezone: '+02:00'
        });
      });
    }

    if (moment('2016-06-13 08:59').utcOffset() === 120) {
      // Test depends on locale
      it('works with a date having a given timezone', function() {
        expect(new Time(moment('2016-06-13 08:59'), '+02:00')).to.be.deep.equal({
          utc: '2016-06-13T06:59:00.000Z',
          timestamp: 1465801140,
          day_of_week: 0,
          time_of_day: 8.983333333333333,
          day_of_month: 13,
          month_of_year: 6,
          timezone: '+02:00'
        });
      });
    }

    it('works with a date having a specified timezone', function() {
      expect(new Time(moment.parseZone('1977-04-22T01:00:00-05:00'))).to.be.deep.equal({
        utc: '1977-04-22T06:00:00.000Z',
        timestamp: 230536800,
        day_of_week: 4,
        day_of_month: 22,
        month_of_year: 4,
        time_of_day: 1,
        timezone: '-05:00'
      });
    });

    it('works with a date having a specified timezone and a given timezone', function() {
      expect(new Time(moment.parseZone('2017-05-31T08:30:00+08:00'), '-08:00')).to.be.deep.equal({
        utc: '2017-05-31T00:30:00.000Z',
        timestamp: 1496190600,
        day_of_week: 1,
        day_of_month: 30,
        month_of_year: 5,
        time_of_day: 16.5,
        timezone: '-08:00'
      });
    });
  });

  describe('from a Time(...)', function() {
    it('works with a Time having a specified timezone', function() {
      expect(new Time(Time('1977-04-22T01:00:00-05:00'))).to.be.deep.equal({
        utc: '1977-04-22T06:00:00.000Z',
        timestamp: 230536800,
        day_of_week: 4,
        time_of_day: 1,
        day_of_month: 22,
        month_of_year: 4,
        timezone: '-05:00'
      });
    });

    it('works with a Time having a specified timezone and a given timezone', function() {
      expect(new Time(Time('1977-04-22T01:00:00-05:00'), '+02:30')).to.be.deep.equal({
        utc: '1977-04-22T06:00:00.000Z',
        timestamp: 230536800,
        day_of_week: 4,
        time_of_day: 8.5,
        day_of_month: 22,
        month_of_year: 4,
        timezone: '+02:30'
      });
    });
  });

  describe('from anythings(...)', function() {
    it('don\'t works with non time string', function() {
      expect(() => Time('toto')).to.throw(CraftAiTimeError);
    });

    it('don\'t works with object', function() {
      expect(() => Time({ toto: 'toto' })).to.throw(CraftAiTimeError);
    });

    it('don\'t works with array containing alphabetical string', function() {
      expect(() => Time(['aaa152'])).to.throw(CraftAiTimeError);
    });
  });
});
