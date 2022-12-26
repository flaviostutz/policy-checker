import { Bool, IpAddress } from './misc';

describe('when using Bool', () => {
  it('should match if bool equal true', async () => {
    const result = Bool.evaluate('true', 'true');
    expect(result).toBeTruthy();
  });
  it('should match if bool equal false', async () => {
    const result = Bool.evaluate('false', 'false');
    expect(result).toBeTruthy();
  });
  it('shouldnt match if bool different', async () => {
    const result = Bool.evaluate('true', 'false');
    expect(result).toBeFalsy();
  });
  it('shouldnt match if bool invalid', async () => {
    const result = Bool.evaluate('ABC', 'false');
    expect(result).toBeFalsy();
  });
  it('shouldnt match if bool invalid', async () => {
    const result = Bool.evaluate('true', 'ABC');
    expect(result).toBeFalsy();
  });
});

describe('when using IpAddress', () => {
  it('should match if ip matches mask', async () => {
    const result = IpAddress.evaluate('200.200.200.100', '200.200.200.0/24');
    expect(result).toBeTruthy();
  });
  it('should match if ip matches mask', async () => {
    const result = IpAddress.evaluate('1.1.1.1', '1.1.1.1/32');
    expect(result).toBeTruthy();
  });
  it('should match if ip matches mask', async () => {
    const result = IpAddress.evaluate('1.1.1.1', '1.0.0.0/8');
    expect(result).toBeTruthy();
  });
  it('shouldnt match if ip doesnt match mask', async () => {
    const result = IpAddress.evaluate('1.1.1.1', '10.1.1.1/32');
    expect(result).toBeFalsy();
  });
  it('shouldnt match if ip doesnt match mask', async () => {
    const result = IpAddress.evaluate('11.1.1.1', '10.0.0.0/8');
    expect(result).toBeFalsy();
  });
});
