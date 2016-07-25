import { decide, Time } from '../src';
import fs from 'fs';
import path from 'path';

const EXPECTATIONS_DIR = path.join(__dirname, 'data/interpreter_test_suite/expectations');
const TREES_DIR = path.join(__dirname, 'data/interpreter_test_suite/trees');

// List the trees
const treeFiles = fs.readdirSync(TREES_DIR);

_.each(treeFiles, treeFile => {
  describe(`"${treeFile}"`, function() {
    // Load the tree
    const json = require(path.join(TREES_DIR, treeFile));

    // Load the expectations for this tree.
    const expectations = require(path.join(EXPECTATIONS_DIR, treeFile));

    _.each(expectations, expectation => {
      it(expectation.title, function() {
        if (expectation.error) {
          expect( () => decide(json, expectation.context, expectation.time ? new Time(expectation.time.t, expectation.time.tz) : {}) ).to.throw( expectation.error.message );
        }
        else {
          expect( decide(json, expectation.context, expectation.time ? new Time(expectation.time.t, expectation.time.tz) : {}) ).to.be.deep.equal( expectation.output );
        }
      });
    });
  });
});
