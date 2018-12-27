import fs from 'fs';
import path from 'path';
import { interpreter, Time } from '../src';

const EXPECTATIONS_DIR = path.join(__dirname, 'data/interpreter-test-suite/format_decision_rules');

// List the expectations file
const expectationsFiles = fs.readdirSync(EXPECTATIONS_DIR);

describe('interpreter.formatDecisionRules', () => {
  _.each(expectationsFiles, (expectationsFile) => {
    describe(`"${expectationsFile}"`, function() {
      // Load the tree
      const expectations = require(path.join(EXPECTATIONS_DIR, expectationsFile));

      _.each(expectations, ({ title, expectation, rules }) => {
        it(title, function() {
          if (expectation.error) {
            expect(() => interpreter.formatDecisionRules(rules)).to.throw();
          }
          else {
            expect(interpreter.formatDecisionRules(rules)).to.be.deep.equal(expectation.string);
          }
        });
      });
    });
  });
});
describe('interpreter.formatProperty', () => {
  describe('on generated date types, works from a Time instance', () => {
    it('From \'2018-08-07T16:06:06+0200\'', () => {
      const date = new Time('2018-08-07T16:06:06+0200');
      expect(interpreter.formatProperty('month_of_year', date)).to.be.equal('Aug');
      expect(interpreter.formatProperty('day_of_month', date)).to.be.equal('07');
      expect(interpreter.formatProperty('day_of_week', date)).to.be.equal('Tue');
      expect(interpreter.formatProperty('time_of_day', date)).to.be.equal('16:06:06');
    });
    it('From \'2018-08-06T08:32:58.000Z\'', () => {
      const date = new Time('2018-08-06T08:32:58.000Z');
      expect(interpreter.formatProperty('month_of_year', date)).to.be.equal('Aug');
      expect(interpreter.formatProperty('day_of_month', date)).to.be.equal('06');
      expect(interpreter.formatProperty('day_of_week', date)).to.be.equal('Mon');
      expect(interpreter.formatProperty('time_of_day', date)).to.be.equal('08:32:58');
    });
    it('From \'2017-10-03T09:13-0800\'', () => {
      const date = new Time('2017-10-03T09:13-0800');
      expect(interpreter.formatProperty('month_of_year', date)).to.be.equal('Oct');
      expect(interpreter.formatProperty('day_of_month', date)).to.be.equal('03');
      expect(interpreter.formatProperty('day_of_week', date)).to.be.equal('Tue');
      expect(interpreter.formatProperty('time_of_day', date)).to.be.equal('09:13');
    });
    it('From \'2017-12-03T02:03+0500\' on tz \'-02:00\'', () => {
      const date = new Time('2017-12-03T02:03+0500', '-02:00');
      expect(interpreter.formatProperty('month_of_year', date)).to.be.equal('Dec');
      expect(interpreter.formatProperty('day_of_month', date)).to.be.equal('02');
      expect(interpreter.formatProperty('day_of_week', date)).to.be.equal('Sat');
      expect(interpreter.formatProperty('time_of_day', date)).to.be.equal('19:03');
    });
    it('From \'2017-07-01T04:20:00.000Z\' on tz \'+02:00\'', () => {
      const date = new Time('2017-07-01T04:20:00.000Z', '+02:00');
      expect(interpreter.formatProperty('month_of_year', date)).to.be.equal('Jul');
      expect(interpreter.formatProperty('day_of_month', date)).to.be.equal('01');
      expect(interpreter.formatProperty('day_of_week', date)).to.be.equal('Sat');
      expect(interpreter.formatProperty('time_of_day', date)).to.be.equal('06:20');
    });
    it('From \'2007-12-01T17:23:00.000Z\' on tz \'+01:00\'', () => {
      const date = new Time('2007-12-01T17:23:00.000Z', '+01:00');
      expect(interpreter.formatProperty('month_of_year', date)).to.be.equal('Dec');
      expect(interpreter.formatProperty('day_of_month', date)).to.be.equal('01');
      expect(interpreter.formatProperty('day_of_week', date)).to.be.equal('Sat');
      expect(interpreter.formatProperty('time_of_day', date)).to.be.equal('18:23');
    });
  });
});
