import fs from 'fs';
import path from 'path';
import { interpreter } from '../src';

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
          } else {
            expect(interpreter.formatDecisionRules(rules)).to.be.deep.equal(expectation.string);
          }
        });
      });
    });
  });
});
