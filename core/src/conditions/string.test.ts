import {
  StringEquals,
  StringEqualsIgnoreCase,
  StringLike,
  StringNotEquals,
  StringNotEqualsIgnoreCase,
} from './string';

describe('when using StringEquals', () => {
  it('should match if string equals', async () => {
    const result = StringEquals.evaluate('value1', 'value1');
    expect(result).toBeTruthy();
  });
  it('should not match if string different', async () => {
    const result = StringEquals.evaluate('value2', 'value1');
    expect(result).toBeFalsy();
  });
  it('should not match if var doesnt exist in context', async () => {
    const result = StringEquals.evaluate('anything', 'value1');
    expect(result).toBeFalsy();
  });
});

describe('when using StringNotEquals', () => {
  it('should be true if string different', async () => {
    const result = StringNotEquals.evaluate('value2', 'value1');
    expect(result).toBeTruthy();
  });
  it('should be false if string equals', async () => {
    const result = StringNotEquals.evaluate('value1', 'value1');
    expect(result).toBeFalsy();
  });
});

describe('when using StringEqualsIgnoreCase', () => {
  it('should be true if string different', async () => {
    const result = StringEqualsIgnoreCase.evaluate('value1', 'VALUE1');
    expect(result).toBeTruthy();
  });
  it('should be false if string equals', async () => {
    const result = StringEqualsIgnoreCase.evaluate('value2', 'VALUE1');
    expect(result).toBeFalsy();
  });
  it('should not match if var doesnt exist in context', async () => {
    const result = StringEqualsIgnoreCase.evaluate('anything', 'value1');
    expect(result).toBeFalsy();
  });
});

describe('when using StringNotEqualsIgnoreCase', () => {
  it('should be true if string different', async () => {
    const result = StringNotEqualsIgnoreCase.evaluate('value2', 'VALUE1');
    expect(result).toBeTruthy();
  });
  it('should be false if string equals', async () => {
    const result = StringNotEqualsIgnoreCase.evaluate('value1', 'VALUE1');
    expect(result).toBeFalsy();
  });
});

describe('when using StringLike', () => {
  it('should be true if string matches', async () => {
    const result = StringLike.evaluate('value1ANYTHINGvalue2', 'value1*value2');
    expect(result).toBeTruthy();
  });
  it('should be false if string doesnt match', async () => {
    const result = StringLike.evaluate('value1', 'value1*value2');
    expect(result).toBeFalsy();
  });
  it('should not match if var doesnt exist in context', async () => {
    const result = StringLike.evaluate('anything', 'value1');
    expect(result).toBeFalsy();
  });
});
