import {
  NumericEquals,
  NumericGreaterThan,
  NumericGreaterThanEquals,
  NumericLessThan,
  NumericLessThanEquals,
  NumericNotEquals,
} from './number';

describe('when using NumericEquals', () => {
  it('should match if number equals', async () => {
    const result = NumericEquals.evaluate('123', '123');
    expect(result).toBeTruthy();
  });
  it('should not match if number different', async () => {
    const result = NumericEquals.evaluate('123', '456');
    expect(result).toBeFalsy();
  });
  it('should not match if number invalid', async () => {
    const result = NumericEquals.evaluate('ABC', '456');
    expect(result).toBeFalsy();
  });
});

describe('when using NumericNotEquals', () => {
  it('should not match if number equals', async () => {
    const result = NumericNotEquals.evaluate('123', '123');
    expect(result).toBeFalsy();
  });
  it('should not match if number different', async () => {
    const result = NumericNotEquals.evaluate('123', '456');
    expect(result).toBeTruthy();
  });
});

describe('when using NumericLessThan', () => {
  it('should not match if number less', async () => {
    const result = NumericLessThan.evaluate('123', '124');
    expect(result).toBeTruthy();
  });
  it('should not match if number greater', async () => {
    const result = NumericLessThan.evaluate('123', '122');
    expect(result).toBeFalsy();
  });
  it('should not match if number invalid', async () => {
    const result = NumericLessThan.evaluate('ABC', '122');
    expect(result).toBeFalsy();
  });
});

describe('when using NumericLessThanEquals', () => {
  it('should not match if number equal', async () => {
    const result = NumericLessThanEquals.evaluate('123', '123');
    expect(result).toBeTruthy();
  });
  it('should not match if number less', async () => {
    const result = NumericLessThanEquals.evaluate('123', '124');
    expect(result).toBeTruthy();
  });
  it('should not match if number greater', async () => {
    const result = NumericLessThanEquals.evaluate('123', '122');
    expect(result).toBeFalsy();
  });
  it('should not match if number invalid', async () => {
    const result = NumericLessThanEquals.evaluate('ABC', '122');
    expect(result).toBeFalsy();
  });
});

describe('when using NumericGreaterThan', () => {
  it('should not match if number greater', async () => {
    const result = NumericGreaterThan.evaluate('123', '122');
    expect(result).toBeTruthy();
  });
  it('should not match if number less', async () => {
    const result = NumericGreaterThan.evaluate('123', '124');
    expect(result).toBeFalsy();
  });
  it('should not match if number invalid', async () => {
    const result = NumericGreaterThan.evaluate('ABC', '122');
    expect(result).toBeFalsy();
  });
});

describe('when using NumericGreaterThanEquals', () => {
  it('should not match if number equal', async () => {
    const result = NumericGreaterThanEquals.evaluate('123', '123');
    expect(result).toBeTruthy();
  });
  it('should not match if number greater', async () => {
    const result = NumericGreaterThanEquals.evaluate('123', '122');
    expect(result).toBeTruthy();
  });
  it('should not match if number less', async () => {
    const result = NumericGreaterThanEquals.evaluate('123', '124');
    expect(result).toBeFalsy();
  });
  it('should not match if number invalid', async () => {
    const result = NumericGreaterThanEquals.evaluate('ABC', '122');
    expect(result).toBeFalsy();
  });
});
