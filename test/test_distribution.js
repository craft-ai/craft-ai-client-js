import { computeMean } from '../src/interpreter';

describe('Interpreter.computeMean', function() {
  it('Probability distribution', function() {
    let dist_sizes = {
      distributions: 
      [
        [0.1, 0.5, 0.4],
        [0.1, 0.5, 0.4]
      ],
      sizes: [1, 1]
    };
    let expected_size = 2;
    let expected_distribution = [0.1, 0.5, 0.4];
    let expected_result = {
      distribution: expected_distribution,
      size: expected_size
    };
    expect(computeMean(dist_sizes)).to.be.deep.equal(expected_result);

    dist_sizes = {
      distributions: 
      [
        [0.1, 0.5, 0.4],
        [0.1, 0.1, 0.8]
      ],
      sizes: [0, 1000]
    };
    expected_size = 1000;
    expected_distribution = [0.1, 0.1, 0.8];
    expected_result = {
      distribution: expected_distribution,
      size: expected_size
    };
    expect(computeMean(dist_sizes)).to.be.deep.equal(expected_result);

    dist_sizes = {
      distributions: 
      [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
      ],
      sizes: [20, 40, 30, 10]
    };
    expected_size = 100;
    expected_distribution = [0.2, 0.4, 0.3, 0.1];
    expected_result = {
      distribution: expected_distribution,
      size: expected_size
    };
    expect(computeMean(dist_sizes)).to.be.deep.equal(expected_result);
  });

  it('Mean distribution', function() {
    let dist_sizes = {
      distributions: 
      [
        [10],
        [10]
      ],
      sizes: [1, 1]
    };
    let expected_size = 2;
    let expected_distribution = [10];
    let expected_result = {
      distribution: expected_distribution,
      size: expected_size
    };
    expect(computeMean(dist_sizes)).to.be.deep.equal(expected_result);

    dist_sizes = {
      distributions: 
      [
        [80],
        [70]
      ],
      sizes: [0, 1000]
    };
    expected_size = 1000;
    expected_distribution = [70];
    expected_result = {
      distribution: expected_distribution,
      size: expected_size
    };
    expect(computeMean(dist_sizes)).to.be.deep.equal(expected_result);

    dist_sizes = {
      distributions: 
      [
        [1],
        [2],
        [3],
        [4]
      ],
      sizes: [1, 1, 1, 1]
    };
    expected_size = 4;
    expected_distribution = [2.5];
    expected_result = {
      distribution: expected_distribution,
      size: expected_size
    };
    expect(computeMean(dist_sizes)).to.be.deep.equal(expected_result);
  });
});
