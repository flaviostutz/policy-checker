import {
  DateEquals,
  DateGreaterThan,
  DateGreaterThanEquals,
  DateLessThan,
  DateLessThanEquals,
  DateNotEquals,
} from './date';

describe('when using DateEquals', () => {
  it('should match if date equals', async () => {
    const result = DateEquals.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:58Z');
    expect(result).toBeTruthy();
  });
  it('should not match if date different', async () => {
    const result = DateEquals.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:59Z');
    expect(result).toBeFalsy();
  });
});

describe('when using DateNotEquals', () => {
  it('should match if date different', async () => {
    const result = DateNotEquals.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:59Z');
    expect(result).toBeTruthy();
  });
  it('should not match if date equals', async () => {
    const result = DateNotEquals.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:58Z');
    expect(result).toBeFalsy();
  });
});

describe('when using DateLessThan', () => {
  it('should match if date less', async () => {
    const result = DateLessThan.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:59Z');
    expect(result).toBeTruthy();
  });
  it('should not match if date equal', async () => {
    const result = DateLessThan.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:58Z');
    expect(result).toBeFalsy();
  });
  it('should not match if date greater', async () => {
    const result = DateLessThan.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:57Z');
    expect(result).toBeFalsy();
  });
});

describe('when using DateLessThanEquals', () => {
  it('should match if date less', async () => {
    const result = DateLessThanEquals.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:59Z');
    expect(result).toBeTruthy();
  });
  it('should not match if date equal', async () => {
    const result = DateLessThanEquals.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:58Z');
    expect(result).toBeTruthy();
  });
  it('should not match if date greater', async () => {
    const result = DateLessThanEquals.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:57Z');
    expect(result).toBeFalsy();
  });
});

describe('when using DateGreaterThan', () => {
  it('should match if date less', async () => {
    const result = DateGreaterThan.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:57Z');
    expect(result).toBeTruthy();
  });
  it('should not match if date equal', async () => {
    const result = DateGreaterThan.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:58Z');
    expect(result).toBeFalsy();
  });
  it('should not match if date greater', async () => {
    const result = DateGreaterThan.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:59Z');
    expect(result).toBeFalsy();
  });
});

describe('when using DateGreaterThanEquals', () => {
  it('should match if date less', async () => {
    const result = DateGreaterThanEquals.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:57Z');
    expect(result).toBeTruthy();
  });
  it('should not match if date equal', async () => {
    const result = DateGreaterThanEquals.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:58Z');
    expect(result).toBeTruthy();
  });
  it('should not match if date greater', async () => {
    const result = DateGreaterThanEquals.evaluate('2022-12-26T18:17:58Z', '2022-12-26T18:17:59Z');
    expect(result).toBeFalsy();
  });
});
