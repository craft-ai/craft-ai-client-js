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

    values = [4., 5.];
    let stds = [1.0, 2.0];
    sizes = [3, 5];

    expectedSize = 8;
    expectedValue = 37.0 / 8.0;
    let expectedStd = Math.sqrt((18.0 + 15.0 / 8.0) / 7.0);
    expectedResult = {
      value: expectedValue,
      standard_deviation: expectedStd,
      size: expectedSize
    };
    let result = computeMeanValues(values, sizes, stds);
    expect(result.value).to.be.equal(expectedValue);
    expect(result.size).to.be.equal(expectedSize);
    expect(result.standard_deviation).to.be.closeTo(expectedStd, 0.00001);

    values = [0.0, 5.];
    stds = [0.0, 2.0];
    sizes = [0, 5];

    expectedSize = 5.0;
    expectedValue = 5.0;
    expectedStd = 2.0;
    expectedResult = {
      value: expectedValue,
      standard_deviation: expectedStd,
      size: expectedSize
    };
    result = computeMeanValues(values, sizes, stds);
    expect(result.value).to.be.equal(expectedValue);
    expect(result.size).to.be.equal(expectedSize);
    expect(result.standard_deviation).to.be.closeTo(expectedStd, 0.00001);

    values = [5.0, 0.0];
    stds = [2.0, 0.0];
    sizes = [5, 0];
    result = computeMeanValues(values, sizes, stds);
    expect(result.value).to.be.equal(expectedValue);
    expect(result.size).to.be.equal(expectedSize);
    expect(result.standard_deviation).to.be.closeTo(expectedStd, 0.00001);

    values = [1.0, 5.];
    stds = [15.0, 2.0];
    sizes = [1, 5];

    expectedSize = 6.0;
    expectedValue = 26.0 / 6.0;
    expectedStd = Math.sqrt((16.0 + 80.0 / 6.0) / 5.0);
    expectedResult = {
      value: expectedValue,
      standard_deviation: expectedStd,
      size: expectedSize
    };
    result = computeMeanValues(values, sizes, stds);
    expect(result.value).to.be.equal(expectedValue);
    expect(result.size).to.be.equal(expectedSize);
    expect(result.standard_deviation).to.be.closeTo(expectedStd, 0.00001);
  });
});
