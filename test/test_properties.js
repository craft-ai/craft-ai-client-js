import { formatDecisionRule, formatProperty, OPERATORS, reduceDecisionRule, TYPES } from '../src/properties';

describe('Properties', () => {
  describe('.formatProperty(<property_type>)', () => {
    describe(TYPES.time_of_day, () => {
      const formatter = formatProperty(TYPES.time_of_day);

      it('Works properly on property values', () => {
        expect(formatter(11.5)).to.be.equal('11:30');
        expect(formatter(11.008)).to.be.equal('11:00:29');
      });
    });

    describe(TYPES.enum, () => {
      const formatter = formatProperty(TYPES.enum);
      it('Works properly on property values', () => {
        expect(formatter('toto')).to.be.equal('toto');
      });
    });

    describe(TYPES.continuous, () => {
      const formatter = formatProperty(TYPES.continuous);
      it('Works properly on property values', () => {
        expect(formatter(12.4)).to.be.equal('12.4');
        expect(formatter(12.4234)).to.be.equal('12.42');
      });
    });

    describe(TYPES.month_of_year, () => {
      const formatter = formatProperty(TYPES.month_of_year);
      it('Works properly on property values', () => {
        expect(formatter(1)).to.be.equal('Jan');
        expect(formatter(6)).to.be.equal('Jun');
        expect(formatter(12)).to.be.equal('Dec');
      });
    });

    describe(TYPES.boolean, () => {
      const formatter = formatProperty(TYPES.boolean);
      it('Works properly on property values', () => {
        expect(formatter(false)).to.be.equal('false');
        expect(formatter(true)).to.be.equal('true');
      });
    });
  });

  describe('.formatDecisionRule(<decision_rule>)', () => {
    describe(OPERATORS.IN, () => {
      describe(TYPES.time_of_day, () => {
        it('Works properly', () => {
          expect(formatDecisionRule({
            type: TYPES.time_of_day,
            operator: OPERATORS.IN,
            operand: [11.5, 12.3]
          })).to.be.equal('[11:30, 12:18[');
        });
      });

      describe(TYPES.continuous, () => {
        it('Works properly', () => {
          expect(formatDecisionRule({
            type: TYPES.continuous,
            operator: OPERATORS.IN,
            operand: [11.5, 12.3]
          })).to.be.equal('[11.5, 12.3[');
        });
      });

      describe(TYPES.day_of_week, () => {
        it('Works properly, when the days are ordered', () => {
          expect(formatDecisionRule({
            type: TYPES.day_of_week,
            operator: OPERATORS.IN,
            operand: [3, 5]
          })).to.be.equal('Thu to Fri');
        });

        it('Works properly, when the days are out of order', () => {
          expect(formatDecisionRule({
            type: TYPES.day_of_week,
            operator: OPERATORS.IN,
            operand: [4, 0]
          })).to.be.equal('Fri to Sun');
        });
      });

      describe(TYPES.month_of_year, () => {
        it('Works properly, when the months are ordered', () => {
          expect(formatDecisionRule({
            type: TYPES.month_of_year,
            operator: OPERATORS.IN,
            operand: [1, 12]
          })).to.be.equal('Jan to Nov');
        });

        it('Works properly, when the months are out of order', () => {
          expect(formatDecisionRule({
            type: TYPES.month_of_year,
            operator: OPERATORS.IN,
            operand: [4, 2]
          })).to.be.equal('Apr to Jan');
          expect(formatDecisionRule({
            type: TYPES.month_of_year,
            operator: OPERATORS.IN,
            operand: [5, 1]
          })).to.be.equal('May to Dec');
        });
      });
    });

    describe(OPERATORS.GTE, () => {
      describe(TYPES.continuous, () => {
        it('Works properly', () => {
          expect(formatDecisionRule({
            type: TYPES.continuous,
            operator: OPERATORS.GTE,
            operand: 3.14
          })).to.be.equal('>= 3.14');
        });
      });

      describe(TYPES.enum, () => {
        it('Works properly', () => {
          expect(formatDecisionRule({
            type: TYPES.enum,
            operator: OPERATORS.GTE,
            operand: 'foo'
          })).to.be.equal('>= foo');
        });
      });
    });

    describe(OPERATORS.LT, () => {
      describe(TYPES.continuous, () => {
        it('Works properly', () => {
          expect(formatDecisionRule({
            type: TYPES.continuous,
            operator: OPERATORS.LT,
            operand: 666
          })).to.be.equal('< 666');
        });
      });

      describe(TYPES.timezone, () => {
        it('Works properly', () => {
          expect(formatDecisionRule({
            type: TYPES.timezone,
            operator: OPERATORS.LT,
            operand: '+02:00'
          })).to.be.equal('< +02:00');
        });
      });
    });

    describe(OPERATORS.IS, () => {
      describe(TYPES.continuous, () => {
        it('Works properly', () => {
          expect(formatDecisionRule({
            type: TYPES.continuous,
            operator: OPERATORS.IS,
            operand: 5637
          })).to.be.equal('is 5637');
        });
      });

      describe(TYPES.enum, () => {
        it('Works properly', () => {
          expect(formatDecisionRule({
            type: TYPES.enum,
            operator: OPERATORS.IS,
            operand: 'abracadabra'
          })).to.be.equal('is abracadabra');
        });
      });
    });
  });

  describe('.reduceDecisionRule(<decision_rules>)', () => {
    it('Reduce "is" properties, same operand', () => {
      const decisionRules = [
        { operator: 'is', operand: 'toto' },
        { operator: 'is', operand: 'toto' }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('is');
      expect(output.operand).to.be.equal('toto');
    });

    it('Reduce "is" properties, only one element', () => {
      const decisionRules = [
        { operator: 'is', operand: 'toto' }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('is');
      expect(output.operand).to.be.equal('toto');
    });

    it('Reduce "is" properties, different operator', () => {
      const decisionRules = [
        { operator: 'is', operand: 'toto' },
        { operator: '[in[', operand: 'titi' }
      ];
      expect(() => reduceDecisionRule(decisionRules)).to.throw('Unable to reduce decision rules \'is toto\' and \'[t, i[\': incompatible operators.');
    });

    it('Reduce "is" properties, different operand', () => {
      const decisionRules = [
        { operator: 'is', operand: 'toto' },
        { operator: 'is', operand: 'titi' }
      ];
      expect(() => reduceDecisionRule(decisionRules)).to.throw('Operator "is" can\'t have different value. Set to "toto" and receive "titi"');
    });

    it('Reduce "in" properties, equal last element', () => {
      const decisionRules = [
        { operator: '[in[', operand: [0, 13] },
        { operator: '[in[', operand: [2, 12] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([2, 12]);
    });

    it('Reduce "in" properties 2, update with last element lower limit', () => {
      const decisionRules = [
        { operator: '[in[', operand: [0, 13] },
        { operator: '[in[', operand: [2, 16] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([2, 13]);
    });

    it('Reduce "in" properties, update with last element upper limit', () => {
      const decisionRules = [
        { operator: '[in[', operand: [1, 13] },
        { operator: '[in[', operand: [0, 12] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([1, 12]);
    });

    it('Reduce "in" properties, days of week - Sat to Wed && Wed', () => {
      const decisionRules = [
        { operator: '[in[', operand: [5, 3] },
        { operator: '[in[', operand: [2, 3] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([2, 3]);
    });

    it('Reduce "in" properties, days of month - [5, 4[ && [12, 1[ && [12, 16[', () => {
      const decisionRules = [
        { operator: '[in[', operand: [5, 4] },
        { operator: '[in[', operand: [12, 1] },
        { operator: '[in[', operand: [12, 16] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([12, 16]);
    });

    it('Reduce "in" properties, with itself', () => {
      const decisionRules = [
        { operator: '[in[', operand: [3, 4] },
        { operator: '[in[', operand: [3, 4] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([3, 4]);
    });

    it('Reduce "in" properties, with itself, cyclic', () => {
      const decisionRules = [
        { operator: '[in[', operand: [4, 2] },
        { operator: '[in[', operand: [4, 2] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([4, 2]);
    });

    it('Reduce "in" properties, days of month - invalid set cyclic and non-cyclic', () => {
      const decisionRules = [
        { operator: '[in[', operand: [15, 20] },
        { operator: '[in[', operand: [22, 14] }
      ];
      expect(() => reduceDecisionRule(decisionRules)).to.throw('Unable to reduce decision rules \'[15, 20[\' and \'[22, 14[\': the resulting rule is not fulfillable.');
    });

    it('Reduce "in" properties, days of month - invalid set non-cyclic and non-cyclic', () => {
      const decisionRules = [
        { operator: '[in[', operand: [15, 20] },
        { operator: '[in[', operand: [22, 25] }
      ];
      expect(() => reduceDecisionRule(decisionRules)).to.throw('Unable to reduce decision rules \'[15, 20[\' and \'[22, 25[\': the resulting rule is not fulfillable.');
    });

    it('Reduce "in" properties, only one element', () => {
      const decisionRules = [
        { operator: '[in[', operand: [1, 13] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([1, 13]);
    });

    it('Reduce "in" properties, operator is', () => {
      const decisionRules = [
        { operator: '[in[', operand: [1, 13] },
        { operator: 'is', operand: 'toto' }
      ];
      expect(() => reduceDecisionRule(decisionRules)).to.throw('Unable to reduce decision rules \'[1, 13[\' and \'is toto\': incompatible operators.');
    });

    it('Reduce "in" properties, operator <', () => {
      const decisionRules = [
        { operator: '[in[', operand: [1, 13] },
        { operator: '<', operand: 2 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([1, 2]);
    });

    it('Reduce "in" properties, operator >=', () => {
      const decisionRules = [
        { operator: '[in[', operand: [1, 13] },
        { operator: '>=', operand: 12 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([12, 13]);
    });

    it('Reduce "in" properties, operator < and >=', () => {
      const decisionRules = [
        { operator: '[in[', operand: [1, 13] },
        { operator: '<', operand: 12 },
        { operator: '>=', operand: 2 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([2, 12]);
    });

    it('Reduce "in" properties, periodic time periods', () => {
      const decisionRules = [
        { operator: '[in[', operand: [23, 3] },
        { operator: '[in[', operand: [22, 2] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([23, 2]);
    });

    it('Reduce "<" properties', () => {
      const decisionRules = [
        { operator: '<', operand: 2 },
        { operator: '<', operand: 6 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('<');
      expect(output.operand).to.be.equal(2);
    });

    it('Reduce "<" properties, with itself', () => {
      const decisionRules = [
        { operator: '<', operand: 2 },
        { operator: '<', operand: 2 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('<');
      expect(output.operand).to.be.equal(2);
    });

    it('Reduce "<" properties, only one parameter', () => {
      const decisionRules = [
        { operator: '<', operand: 2 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('<');
      expect(output.operand).to.be.equal(2);
    });

    it('Reduce "<" properties, with [in[ operator', () => {
      const decisionRules = [
        { operator: '<', operand: 2 },
        { operator: '[in[', operand: [1, 13] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([1, 2]);
    });

    it('Reduce "<" properties, with >= operator', () => {
      const decisionRules = [
        { operator: '<', operand: 13 },
        { operator: '>=', operand: 2 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([2, 13]);
    });

    it('Reduce "<" and ">=" properties, <650 && >=232.82 && <251.99 && <345.22', () => {
      const decisionRules = [
        { operator: '<', operand: 650 },
        { operator: '>=', operand: 232.82 },
        { operator: '<', operand: 251.99 },
        { operator: '<', operand: 345.22 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([232.82, 251.99]);
    });

    it('Reduce ">=" properties', () => {
      const decisionRules = [
        { operator: '>=', operand: 4 },
        { operator: '>=', operand: 2 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('>=');
      expect(output.operand).to.be.equal(4);
    });

    it('Reduce ">=" properties, only one parameter', () => {
      const decisionRules = [
        { operator: '>=', operand: 2 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('>=');
      expect(output.operand).to.be.equal(2);
    });

    it('Reduce ">=" properties, with itself', () => {
      const decisionRules = [
        { operator: '>=', operand: 2 },
        { operator: '>=', operand: 2 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('>=');
      expect(output.operand).to.be.equal(2);
    });

    it('Reduce ">=" properties, with [in[ operator', () => {
      const decisionRules = [
        { operator: '>=', operand: 2 },
        { operator: '[in[', operand: [1, 13] }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([2, 13]);
    });

    it('Reduce ">=" properties, with < operator', () => {
      const decisionRules = [
        { operator: '>=', operand: 2 },
        { operator: '<', operand: 13 }
      ];
      const output = reduceDecisionRule(decisionRules);
      expect(output.operator).to.be.equal('[in[');
      expect(output.operand).to.be.deep.equal([2, 13]);
    });

    it('Reduce ">=" properties, with < operator, in a bad order', () => {
      const decisionRules = [
        { operator: '>=', operand: 13 },
        { operator: '<', operand: 2 }
      ];
      expect(() => reduceDecisionRule(decisionRules)).to.throw('Unable to reduce decision rules \'>= 13\' and \'< 2\': the resulting rule is not fulfillable.');
    });
  });
});
