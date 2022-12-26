import { RequestContext } from '../types/RequestContext';

import { resolveVar } from './resolver';

const ctx: RequestContext = {
  Principal: {
    Urn: 'mypal1',
    Tags: {
      key1: 'value1',
    },
  },
  Resource: {
    Urn: 'myresource1',
    Tags: {
      key2: 'value2',
    },
  },
  Action: 'myaction1',
  Vars: {
    key3: 'value3',
  },
};

describe('when using resolver', () => {
  it('should resolve vars', async () => {
    const varValue = resolveVar(ctx, 'ctx:key3');
    expect(varValue).toEqual('value3');
  });
  it('should resolve PrincipalTag', async () => {
    const varValue = resolveVar(ctx, 'ctx:PrincipalTag/key1');
    expect(varValue).toEqual('value1');
  });
  it('should resolve ResourceTag', async () => {
    const varValue = resolveVar(ctx, 'ctx:ResourceTag/key2');
    expect(varValue).toEqual('value2');
  });
  it('should resolve CurrentTime', async () => {
    const varValue = resolveVar(ctx, 'ctx:CurrentTime');
    expect(varValue).toBeDefined();
    if (!varValue) {
      throw new Error('return value should be defined');
    }
    const rd = Date.parse(varValue);
    expect(rd).toBeLessThanOrEqual(new Date().getTime());
  });
  it('should resolve EpochTime', async () => {
    const varValue = resolveVar(ctx, 'ctx:EpochTime');
    expect(varValue).not.toBeNull();
    if (!varValue) {
      throw new Error('return value should be defined');
    }
    expect(parseInt(varValue, 10)).toBeLessThanOrEqual(new Date().getTime());
  });
});
