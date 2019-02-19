import { computeMeanDistributions, computeMeanValues } from '../src/interpreter_v2';

describe('Interpreter.computeMean', function() {
  it('Probability distribution', function() {
    let distributions = [
      [0.1, 0.5, 0.4],
      [0.1, 0.5, 0.4]
    ];

    let sizes = [1, 1];

    let expectedSize = 2;
    let expectedDistribution = [0.1, 0.5, 0.4];
    let expectedResult = {
      value: expectedDistribution,
      size: expectedSize
    };
    expect(computeMeanDistributions(distributions, sizes)).to.be.deep.equal(expectedResult);

    distributions = [
      [0.1, 0.5, 0.4],
      [0.1, 0.1, 0.8]
    ];
    sizes = [0, 1000];

    expectedSize = 1000;
    expectedDistribution = [0.1, 0.1, 0.8];
    expectedResult = {
      value: expectedDistribution,
      size: expectedSize
    };
    expect(computeMeanDistributions(distributions, sizes)).to.be.deep.equal(expectedResult);

    distributions = [
      [1.0, 0.0, 0.0, 0.0],
      [0.0, 1.0, 0.0, 0.0],
      [0.0, 0.0, 1.0, 0.0],
      [0.0, 0.0, 0.0, 1.0]
    ];

    sizes = [20, 40, 30, 10];

    expectedSize = 100;
    expectedDistribution = [0.2, 0.4, 0.3, 0.1];
    expectedResult = {
      value: expectedDistribution,
      size: expectedSize
    };
    expect(computeMeanDistributions(distributions, sizes)).to.be.deep.equal(expectedResult);
  });

  it('Mean distribution', function() {
    let values = [10., 10.];
    let sizes = [1, 1];

    let expectedSize = 2;
    let expectedValue = 10;
    let expectedResult = {
      value: expectedValue,
      size: expectedSize
    };
    expect(computeMeanValues(values, sizes)).to.be.deep.equal(expectedResult);

    values = [80., 70.];
    sizes = [0, 1000];

    expectedSize = 1000;
    expectedValue = 70;
    expectedResult = {
      value: expectedValue,
      size: expectedSize
    };
    expect(computeMeanValues(values, sizes)).to.be.deep.equal(expectedResult);


    values = [1., 2., 3., 4.];
    sizes = [1, 1, 1, 1];

    expectedSize = 4;
    expectedValue = 2.5;
    expectedResult = {
      value: expectedValue,
      size: expectedSize
    };
    expect(computeMeanValues(values, sizes)).to.be.deep.equal(expectedResult);
  });
});
