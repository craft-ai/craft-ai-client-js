import fs from 'fs';
import path from 'path';
import { errors, interpreter, Time } from '../src';

const EXPECTATIONS_DIR = path.join(__dirname, 'data/interpreter-test-suite/decide/expectations');
const TREES_DIR = path.join(__dirname, 'data/interpreter-test-suite/decide/trees');

// List the trees
const versionFolder = fs.readdirSync(TREES_DIR);

describe('decide', () => {
  const firstVersion = versionFolder[0];
  const treeFiles = fs.readdirSync(path.join(TREES_DIR, firstVersion));
  const firstTreeFile = treeFiles[0];
  const firstTree = require(path.join(TREES_DIR, firstVersion, firstTreeFile));
  const firstExpectation = require(path.join(EXPECTATIONS_DIR, firstVersion, firstTreeFile))[0];

  describe(`"${firstTreeFile}"`, function() {
    it(firstExpectation.title, function() {
      if (firstExpectation.error) {
        expect(() => interpreter.decide(firstTree, firstExpectation.context, firstExpectation.time ? new Time(firstExpectation.time.t, firstExpectation.time.tz) : {})).to.throw();
      }
      else {
        expect(interpreter.decide(firstTree, firstExpectation.context, firstExpectation.time ? new Time(firstExpectation.time.t, firstExpectation.time.tz) : {})).to.be.deep.equal(firstExpectation.output);
      }
    });
  });
});

describe('interpreter.decide', () => {
  _.each(versionFolder, (version) => {
    const treeFiles = fs.readdirSync(path.join(TREES_DIR, version));
    _.each(treeFiles, (treeFile) => {
      describe(`"${treeFile}"`, function() {
        // Load the tree
        let json = require(path.join(TREES_DIR, version, treeFile));

        // Load the expectations for this tree.
        const expectations = require(path.join(EXPECTATIONS_DIR, version, treeFile));

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
            }
            else {
              if (!_.isUndefined(expectation.configuration)) {
                json.configuration = _.assign(json.configuration, expectation.configuration);
              }
              expect(interpreter.decide(json, expectation.context, expectation.time ? new Time(expectation.time.t, expectation.time.tz) : {})).to.be.deep.equal(expectation.output);
            }
          });
        });
      });
    });
  });
});
