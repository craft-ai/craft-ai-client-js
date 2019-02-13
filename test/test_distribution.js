import { computeMean } from '../src/interpreter_v2';

describe('Interpreter.computeMean', function() {
  it('Probability distribution', function() {
    let distSizes = {
      distributions: 
      [
        [0.1, 0.5, 0.4],
        [0.1, 0.5, 0.4]
      ],
      sizes: [1, 1]
    };
    let expectedSize = 2;
    let expectedDistribution = [0.1, 0.5, 0.4];
    let expectedResult = {
      distribution: expectedDistribution,
      size: expectedSize
    };
    expect(computeMean(distSizes)).to.be.deep.equal(expectedResult);

    distSizes = {
      distributions: 
      [
        [0.1, 0.5, 0.4],
        [0.1, 0.1, 0.8]
      ],
      sizes: [0, 1000]
    };
    expectedSize = 1000;
    expectedDistribution = [0.1, 0.1, 0.8];
    expectedResult = {
      distribution: expectedDistribution,
      size: expectedSize
    };
    expect(computeMean(distSizes)).to.be.deep.equal(expectedResult);

    distSizes = {
      distributions: 
      [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
      ],
      sizes: [20, 40, 30, 10]
    };
    expectedSize = 100;
    expectedDistribution = [0.2, 0.4, 0.3, 0.1];
    expectedResult = {
      distribution: expectedDistribution,
      size: expectedSize
    };
    expect(computeMean(distSizes)).to.be.deep.equal(expectedResult);
  });

  it('Mean distribution', function() {
    let distSizes = {
      distributions: 
      [
        [10],
        [10]
      ],
      sizes: [1, 1]
    };
    let expectedSize = 2;
    let expectedDistribution = [10];
    let expectedResult = {
      distribution: expectedDistribution,
      size: expectedSize
    };
    expect(computeMean(distSizes)).to.be.deep.equal(expectedResult);

    distSizes = {
      distributions: 
      [
        [80],
        [70]
      ],
      sizes: [0, 1000]
    };
    expectedSize = 1000;
    expectedDistribution = [70];
    expectedResult = {
      distribution: expectedDistribution,
      size: expectedSize
    };
    expect(computeMean(distSizes)).to.be.deep.equal(expectedResult);

    distSizes = {
      distributions: 
      [
        [1],
        [2],
        [3],
        [4]
      ],
      sizes: [1, 1, 1, 1]
    };
    expectedSize = 4;
    expectedDistribution = [2.5];
    expectedResult = {
      distribution: expectedDistribution,
      size: expectedSize
    };
    expect(computeMean(distSizes)).to.be.deep.equal(expectedResult);
  });
});
