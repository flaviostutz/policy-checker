import { compilePolicies } from './compile';
import { apolicy1, apolicy2 } from './__mocks__/arrayPolicies';
import { spolicy1 } from './__mocks__/simplePolicies';
import { wpolicy1, wpolicy2, wpolicy3 } from './__mocks__/wildcardPolicies';

describe('when using wildcard elements', () => {

  it('should fail if context Principal contains wildcard', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy1],
    }]);

    expect(() => {
      cp.evaluate({
        Principal: {
          Urn: 'my*pal',
        },
        Action: 'mywrite1',
        Resource: 'myresource1',
      });
    }).toThrow();
  });

  it('should fail if context Action contains wildcard', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy1],
    }]);

    expect(() => {
      cp.evaluate({
        Principal: {
          Urn: 'mypal',
        },
        Action: 'mywr*ite1',
        Resource: 'myresource1',
      });
    }).toThrow();
  });

  it('should fail if context Resource contains wildcard', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy1],
    }]);

    expect(() => {
      cp.evaluate({
        Principal: {
          Urn: 'mypal',
        },
        Action: 'mywrite1',
        Resource: 'myres*ource1',
      });
    }).toThrow();
  });

  it('should Allow when wildcard policy matches Action and Resource', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy1],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction1:anything',
      Resource: 'myresource1/something',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard policy matches Action', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy2],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction1:anything',
      Resource: 'myresource1',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard policy matches Resource', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy2],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2',
      Resource: 'myresource2/something',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard in the middle of Action', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy3],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2:something:test',
      Resource: 'myresource2',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard in the middle of Resource', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy3],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction1',
      Resource: 'myresource1/something/test',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard in the middle of both Action and Resource', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy3],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2:something:test',
      Resource: 'myresource1/something/test',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard with multiple policies', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy1, wpolicy2, wpolicy3],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2:something:test',
      Resource: 'myresource1/something/test',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Deny when Principal has wildcard Deny for everything', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy1, wpolicy2, wpolicy3, {
        Effect: 'Deny',
        Principal: '*',
        Action: ['*', 'myaction2'],
        Resource: ['*', 'myresource2/*'],
      }],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2:something:test',
      Resource: 'myresource1/something/test',
    });
    expect(allowed).toBeFalsy();
  });

  it('should Deny when Principal has wildcard Deny for specific Action even if part of the wildcard match for an Allow', async () => {
    const cp = compilePolicies([{
      Statement: [wpolicy1, {
        Effect: 'Deny',
        Principal: '*',
        Action: 'myaction2:denied',
        Resource: '*',
      }],
    }]);

    const allowed1 = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2:something',
      Resource: 'myresource1/something',
    });
    expect(allowed1).toBeTruthy();

    const allowed2 = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2:denied',
      Resource: 'myresource1/something',
    });
    expect(allowed2).toBeFalsy();
  });

  it('should Allow when Principal wildcard Allow for everything in an Resource', async () => {
    const cp = compilePolicies([{
      Statement: [{
        Effect: 'Allow',
        Principal: '*',
        Action: '*',
        Resource: 'mypublicresource',
      }],
    }]);

    const allowed1 = cp.evaluate({
      Principal: 'anyprincipal',
      Action: 'anyactionisallowed',
      Resource: 'mypublicresource',
    });
    expect(allowed1).toBeTruthy();
  });

});

describe('when using array elements', () => {

  it('should fail if context with invalid Principal', async () => {
    const cp = compilePolicies([{
      Statement: [spolicy1],
    }]);

    expect(() => {
      cp.evaluate({
        Principal: {
          Urn: '',
        },
        Action: 'mywrite1',
        Resource: 'myresource1',
      });
    }).toThrow();
  });

  it('should fail if context with invalid Principal 2', async () => {
    const cp = compilePolicies([{
      Statement: [spolicy1],
    }]);

    expect(() => {
      cp.evaluate({
        Principal: {
          // @ts-ignore
          Urn: ['mypal1'],
        },
        Action: 'mywrite1',
        Resource: 'myresource1',
      });
    }).toThrow();
  });

  it('should fail if context with invalid Action', async () => {
    const cp = compilePolicies([{
      Statement: [spolicy1],
    }]);

    expect(() => {
      cp.evaluate({
        Principal: 'mypal1',
        // @ts-ignore
        Action: ['mywrite1'],
        Resource: 'myresource1',
      });
    }).toThrow();
  });

  it('should fail if context with invalid Resource', async () => {
    const cp = compilePolicies([{
      Statement: [spolicy1],
    }]);

    expect(() => {
      cp.evaluate({
        Principal: 'mypal1',
        Action: 'mywrite1',
        // @ts-ignore
        Resource: ['myresource1'],
      });
    }).toThrow();
  });

  it('should Allow when policy matches context', async () => {
    const cp = compilePolicies([{
      Statement: [apolicy1],
    }]);
    const allowed = cp.evaluate({
      Principal: {
        Urn: { jwt: 'mypal1' },
      },
      Action: 'myaction1',
      Resource: 'myresource1',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when policy matches context 2', async () => {
    const cp = compilePolicies([{
      Statement: [apolicy1],
    }]);
    const allowed = cp.evaluate({
      Principal: {
        Urn: { jwt: 'mypal2' },
      },
      Action: 'myaction2',
      Resource: 'myresource2',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when multiple policies in place', async () => {
    const cp = compilePolicies([{
      Statement: [apolicy1, apolicy2],
    }]);
    const allowed = cp.evaluate({
      Principal: {
        Urn: { role: 'myrole1' },
      },
      Action: 'myaction2',
      Resource: 'myresource2',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Deny when one rule Deny and others Allow', async () => {
    const cp = compilePolicies([{
      Statement: [
        apolicy1, apolicy2, {
          Principal: {
            role: 'myrole1',
          },
          Effect: 'Deny',
          Action: 'myaction2',
          Resource: 'myresource2',
        },
      ],
    }]);
    const allowed = cp.evaluate({
      Principal: {
        Urn: { role: 'myrole1' },
      },
      Action: 'myaction2',
      Resource: 'myresource2',
    });
    expect(allowed).toBeFalsy();
  });

});

describe('when using simple elements', () => {

  it('should Deny when no resource match', async () => {
    const cp = compilePolicies([{
      Statement: [spolicy1],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal',
      Action: 'mywrite',
      Resource: 'my-random-resource',
    });
    expect(allowed).toBeFalsy();
  });

  it('should Deny when no policies', async () => {
    const cp = compilePolicies([{
      Statement: [],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal',
      Action: 'mywrite',
      Resource: 'my-random-resource',
    });
    expect(allowed).toBeFalsy();
  });

  it('should Allow when policy matches context', async () => {
    const cp = compilePolicies([{
      Statement: [spolicy1],
    }]);
    const allowed = cp.evaluate({
      Principal: 'mypal',
      Action: 'mywrite',
      Resource: 'myresource',
    });
    expect(allowed).toBeTruthy();
  });

  it('should fail if context without Principal', async () => {
    const cp = compilePolicies([{
      Statement: [spolicy1],
    }]);

    expect(() => {
      cp.evaluate({
        Principal: '',
        Action: 'action1',
        Resource: 'resource1',
      });
    }).toThrow();
  });

  it('should fail if context without Action', async () => {
    const cp = compilePolicies([{
      Statement: [spolicy1],
    }]);

    expect(() => {
      cp.evaluate({
        Principal: 'mypal1',
        Action: '',
        Resource: 'resource1',
      });
    }).toThrow();
  });

  it('should fail if context without Resource', async () => {
    const cp = compilePolicies([{
      Statement: [spolicy1],
    }]);

    expect(() => {
      cp.evaluate({
        Principal: 'mypal1',
        Action: 'action1',
        Resource: '',
      });
    }).toThrow();
  });

});
