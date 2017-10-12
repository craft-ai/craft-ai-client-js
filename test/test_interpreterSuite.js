import fs from 'fs';
import path from 'path';
import { errors, interpreter, Time } from '../src';

const EXPECTATIONS_DIR = path.join(__dirname, 'data/interpreter-test-suite/expectations');
const TREES_DIR = path.join(__dirname, 'data/interpreter-test-suite/trees');

// List the trees
const treeFiles = fs.readdirSync(TREES_DIR);

describe('decide', () => {
  const firstTreeFile = treeFiles[0];
  const firstTree = require(path.join(TREES_DIR, firstTreeFile));
  const firstExpectation = require(path.join(EXPECTATIONS_DIR, firstTreeFile))[0];

  describe(`"${firstTreeFile}"`, function() {
    it(firstExpectation.title, function() {
      if (firstExpectation.error) {
        expect(() => interpreter.decide(firstTree, firstExpectation.context, firstExpectation.time ? new Time(firstExpectation.time.t, firstExpectation.time.tz) : {})).to.throw();
      } else {
        expect(interpreter.decide(firstTree, firstExpectation.context, firstExpectation.time ? new Time(firstExpectation.time.t, firstExpectation.time.tz) : {})).to.be.deep.equal(firstExpectation.output);
      }
    });
  });
});

describe('interpreter.decide', () => {
  _.each(treeFiles, (treeFile) => {
    describe(`"${treeFile}"`, function() {
      // Load the tree
      const json = require(path.join(TREES_DIR, treeFile));

      // Load the expectations for this tree.
      const expectations = require(path.join(EXPECTATIONS_DIR, treeFile));

      _.each(expectations, (expectation) => {
        it(expectation.title, function() {
          if (expectation.error) {
            try {
              interpreter.decide(json, expectation.context, expectation.time ? new Time(expectation.time.t, expectation.time.tz) : {});
              throw new Error('\'interpreter.decide\' should throw a \'CraftAiError\'.');
            }
            catch (e) {
              if (e instanceof errors.CraftAiError) {
                expect(e.message).to.equal(expectation.error.message);
                expect(e.metadata).to.deep.equal(expectation.error.metadata);
              }
              else {
                throw e;
              }
            }
          } else {
            expect(interpreter.decide(json, expectation.context, expectation.time ? new Time(expectation.time.t, expectation.time.tz) : {})).to.be.deep.equal(expectation.output);
          }
        });
      });
    });
  });
});
