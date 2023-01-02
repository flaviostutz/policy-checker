import { compilePolicies } from './compile';
import { matches } from './evaluate';
import { apolicy1, apolicy2 } from './__mocks__/arrayPolicies';
import { cstringpolicy1, cstringpolicy2, cstringpolicy3 } from './__mocks__/conditionPolicies';
import { spolicy1 } from './__mocks__/simplePolicies';
import { vpolicy1 } from './__mocks__/varPolicies';
import { wpolicy1, wpolicy2, wpolicy3 } from './__mocks__/wildcardPolicies';

describe('when using permission boundaries', () => {
  it('should deny if boundaries deny', async () => {
    const cp = compilePolicies(
      [
        {
          Statement: [spolicy1],
        },
      ],
      [
        {
          Statement: [
            {
              Action: '*',
              Effect: 'Deny',
              Resource: '*',
            },
          ],
        },
      ],
    );
    const allowed = cp.evaluate({
      Principal: 'mypal',
      Action: 'mywrite',
      Resource: 'myresource',
    });
    expect(allowed).toBeFalsy();
  });
  it('should deny if boundaries doesnt explicitly allow', async () => {
    const cp = compilePolicies(
      [
        {
          Statement: [spolicy1],
        },
      ],
      [
        {
          Statement: [
            {
              Action: '*',
              Effect: 'Allow',
              Resource: 'anotherresource',
            },
          ],
        },
      ],
    );
    const allowed = cp.evaluate({
      Principal: 'mypal',
      Action: 'mywrite',
      Resource: 'myresource',
    });
    expect(allowed).toBeFalsy();
  });
  it('should deny if boundaries var doesnt match', async () => {
    const cp = compilePolicies(
      [
        {
          Statement: [spolicy1],
        },
      ],
      [
        {
          Statement: [
            {
              Action: 'mywrite',
              Effect: 'Allow',
              Resource: 'myresource',
              Condition: {
                // eslint-disable-next-line no-template-curly-in-string
                StringEquals: { 'ctx:ResourceTag/tag1': '${ctx:tag2}' },
              },
            },
          ],
        },
      ],
    );
    const allowed = cp.evaluate({
      Principal: 'mypal',
      Action: 'mywrite',
      Resource: {
        Urn: 'myresource',
        Tags: {
          tag1: 'content1',
        },
      },
      Vars: {
        tag2: 'contentANOTHER',
      },
    });
    expect(allowed).toBeFalsy();
  });
  it('should allow if boundaries vars matches', async () => {
    const cp = compilePolicies(
      [
        {
          Statement: [spolicy1],
        },
      ],
      [
        {
          Statement: [
            {
              Action: 'mywrite',
              Effect: 'Allow',
              Resource: 'myresource',
              Condition: {
                // eslint-disable-next-line no-template-curly-in-string
                StringEquals: { 'ctx:ResourceTag/tag1': '${ctx:tag2}' },
              },
            },
          ],
        },
      ],
    );
    const allowed = cp.evaluate({
      Principal: 'mypal',
      Action: 'mywrite',
      Resource: {
        Urn: 'myresource',
        Tags: {
          tag1: 'content1',
        },
      },
      Vars: {
        tag2: 'content1',
      },
    });
    expect(allowed).toBeTruthy();
  });
});

describe('when using var replacement', () => {
  it('should match replaced element', async () => {
    // eslint-disable-next-line no-template-curly-in-string
    const result = matches('anything-value1-anything', 'anything-${ctx:var1}-anything', {
      Principal: 'mypal1',
      Action: 'myaction1',
      Resource: 'myresource1/value1',
      Vars: {
        var1: 'value1',
      },
    });
    expect(result).toBeTruthy();
  });
  it('should match replaced element (ResourceTag)', async () => {
    // eslint-disable-next-line no-template-curly-in-string
    const result = matches('anything-tagValue1', 'anything-${ctx:ResourceTag/tag1}', {
      Principal: 'mypal1',
      Action: 'myaction1',
      Resource: {
        Urn: 'myresource1/value1',
        Tags: {
          tag1: 'tagValue1',
        },
      },
      Vars: {
        var1: 'value1',
      },
    });
    expect(result).toBeTruthy();
  });
  it('should match replaced multiple elements with ResourceTag', async () => {
    const result = matches(
      'anything-value1-anythingtagValue1',
      // eslint-disable-next-line no-template-curly-in-string
      "anything-${ctx:var1}-anything${ctx:ResourceTag/tag1, 'bbbb'}",
      {
        Principal: 'mypal1',
        Action: 'myaction1',
        Resource: {
          Urn: 'myresource1/value1',
          Tags: {
            tag1: 'tagValue1',
          },
        },
        Vars: {
          var1: 'value1',
        },
      },
    );
    expect(result).toBeTruthy();
  });
  it('should match replaced element with default', async () => {
    // eslint-disable-next-line no-template-curly-in-string
    const result = matches('anything-mydefault1', "anything-${ctx:var1, 'mydefault1'}", {
      Principal: 'mypal1',
      Action: 'myaction1',
      Resource: 'myresource1/value1',
    });
    expect(result).toBeTruthy();
  });
});

describe('when using var replacement in resource name', () => {
  it('should success if resource name has tag value', async () => {
    const cp = compilePolicies([
      {
        Statement: [vpolicy1],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction1',
      Resource: 'myresource1/value1',
      Vars: {
        var1: 'value1',
      },
    });
    expect(allowed).toBeTruthy();
  });

  it('should success if resource name with default value when ctx var not found', async () => {
    const cp = compilePolicies([
      {
        Statement: [vpolicy1],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction1',
      Resource: 'myresource1/mydefault1',
    });
    expect(allowed).toBeTruthy();
  });

  it('should fail if resource name different from var', async () => {
    const cp = compilePolicies([
      {
        Statement: [vpolicy1],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction1',
      Resource: 'myresource1/anything',
      Vars: {
        var1: 'value2',
      },
    });
    expect(allowed).toBeFalsy();
  });
});

describe('when using Condition elements', () => {
  it('should allow if Null condition matches', async () => {
    const cp = compilePolicies([
      {
        Statement: [
          {
            Action: 'myaction1',
            Effect: 'Allow',
            Principal: 'mypal1',
            Resource: 'myresource1',
            Condition: {
              Null: {
                'ctx:test1': 'true',
                'ctx:test2': 'false',
              },
            },
          },
        ],
      },
    ]);

    const allowed = cp.evaluate({
      Principal: {
        Urn: 'mypal1',
      },
      Action: 'myaction1',
      Resource: 'myresource1',
      Vars: {
        test2: 'value2',
      },
    });
    expect(allowed).toBeTruthy();

    const allowed2 = cp.evaluate({
      Principal: {
        Urn: 'mypal1',
      },
      Action: 'myaction1',
      Resource: 'myresource1',
      Vars: {
        test1: 'value2',
      },
    });
    expect(allowed2).toBeFalsy();
  });
  it('should allow if string condition with var on key and value equals', async () => {
    const cp = compilePolicies([
      {
        Statement: [
          {
            Action: 'myaction1',
            Effect: 'Allow',
            Principal: '*',
            Resource: 'myresource1',
            Condition: {
              StringEquals: {
                // eslint-disable-next-line no-template-curly-in-string
                'ctx:test1': '${ctx:test2}',
              },
            },
          },
        ],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: {
        Urn: 'mypal1',
      },
      Action: 'myaction1',
      Resource: 'myresource1',
      Vars: {
        test1: 'value1',
        test2: 'value1',
      },
    });
    expect(allowed).toBeTruthy();
  });
  it('should allow if string conditions matches', async () => {
    const cp = compilePolicies([
      {
        Statement: [cstringpolicy1],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: {
        Urn: 'mypal1',
      },
      Action: 'myaction1',
      Resource: 'myresource1',
      Vars: {
        test1: 'value1',
        test2: 'anything',
        test3: 'VALUE1',
        test4: 'ANYTHING',
        test5: 'value1ANYTHINGvalue2',
        test6: 'ANYTHING',
      },
    });
    expect(allowed).toBeTruthy();

    // testing OR condition in StringEquals
    const allowed2 = cp.evaluate({
      Principal: {
        Urn: 'mypal1',
      },
      Action: 'myaction1',
      Resource: 'myresource1',
      Vars: {
        test1: 'value2',
        test2: 'anything',
        test3: 'VALUE1',
        test4: 'ANYTHING',
        test5: 'value1value2',
        test6: '',
      },
    });
    expect(allowed2).toBeTruthy();
  });

  it('should deny if missing var, even if for testing for different value', async () => {
    const cp = compilePolicies([
      {
        Statement: [cstringpolicy1],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: {
        Urn: 'mypal1',
      },
      Action: 'myaction1',
      Resource: 'myresource1',
      Vars: {
        test1: 'value1',
        // test2: 'anything',
        test3: 'VALUE1',
        test4: 'ANYTHING',
        test5: 'value1ANYTHINGvalue2',
      },
    });
    expect(allowed).toBeFalsy();
  });

  it('should allow on missing var if using StringEqualsIfExists', async () => {
    const cp = compilePolicies([
      {
        Statement: [cstringpolicy1],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: {
        Urn: 'mypal1',
      },
      Action: 'myaction1',
      Resource: 'myresource1',
      Vars: {
        test1: 'value1',
        test2: 'anything',
        test3: 'VALUE1',
        test4: 'ANYTHING',
        test5: 'value1ANYTHINGvalue2',
        test6: 'ANYTHING',
        test7: 'value1',
      },
    });
    expect(allowed).toBeTruthy();

    // now without test7 var
    const allowed2 = cp.evaluate({
      Principal: {
        Urn: 'mypal1',
      },
      Action: 'myaction1',
      Resource: 'myresource1',
      Vars: {
        test1: 'value1',
        test2: 'anything',
        test3: 'VALUE1',
        test4: 'ANYTHING',
        test5: 'value1ANYTHINGvalue2',
        test6: 'ANYTHING',
        // test7: 'value1',
      },
    });
    expect(allowed2).toBeTruthy();
  });

  it('should allow if ResourceTag matches', async () => {
    const cp = compilePolicies([
      {
        Statement: [cstringpolicy2],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: {
        Urn: 'mypal1',
      },
      Action: 'myaction1',
      Resource: {
        Urn: 'myresource1',
        Tags: {
          tag1: 'value1',
        },
      },
    });
    expect(allowed).toBeTruthy();
  });

  it('should allow if PrincipalTag matches', async () => {
    const cp = compilePolicies([
      {
        Statement: [cstringpolicy3],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: {
        Urn: 'mypal1',
        Tags: {
          tag1: 'value1',
        },
      },
      Action: 'myaction1',
      Resource: 'myresource1',
    });
    expect(allowed).toBeTruthy();
  });
});

describe('when using wildcard elements', () => {
  it('should fail if context Principal contains wildcard', async () => {
    const cp = compilePolicies([
      {
        Statement: [wpolicy1],
      },
    ]);

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
    const cp = compilePolicies([
      {
        Statement: [wpolicy1],
      },
    ]);

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
    const cp = compilePolicies([
      {
        Statement: [wpolicy1],
      },
    ]);

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
    const cp = compilePolicies([
      {
        Statement: [wpolicy1],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction1:anything',
      Resource: 'myresource1/something',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard policy matches Action', async () => {
    const cp = compilePolicies([
      {
        Statement: [wpolicy2],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction1:anything',
      Resource: 'myresource1',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard policy matches Resource', async () => {
    const cp = compilePolicies([
      {
        Statement: [wpolicy2],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2',
      Resource: 'myresource2/something',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard in the middle of Action', async () => {
    const cp = compilePolicies([
      {
        Statement: [wpolicy3],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2:A:test',
      Resource: 'myresource2',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard in the middle of Resource', async () => {
    const cp = compilePolicies([
      {
        Statement: [wpolicy3],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction1',
      Resource: 'myresource1/something/test',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard in the middle of both Action and Resource', async () => {
    const cp = compilePolicies([
      {
        Statement: [wpolicy3],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2:B:test',
      Resource: 'myresource1/something/test',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Allow when wildcard with multiple policies', async () => {
    const cp = compilePolicies([
      {
        Statement: [wpolicy1, wpolicy2, wpolicy3],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2:something:test',
      Resource: 'myresource1/something/test',
    });
    expect(allowed).toBeTruthy();
  });

  it('should Deny when Principal has wildcard Deny for everything', async () => {
    const cp = compilePolicies([
      {
        Statement: [
          wpolicy1,
          wpolicy2,
          wpolicy3,
          {
            Effect: 'Deny',
            Principal: '*',
            Action: ['*', 'myaction2'],
            Resource: ['*', 'myresource2/*'],
          },
        ],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal1',
      Action: 'myaction2:something:test',
      Resource: 'myresource1/something/test',
    });
    expect(allowed).toBeFalsy();
  });

  it('should Deny when Principal has wildcard Deny for specific Action even if part of the wildcard match for an Allow', async () => {
    const cp = compilePolicies([
      {
        Statement: [
          wpolicy1,
          {
            Effect: 'Deny',
            Principal: '*',
            Action: 'myaction2:denied',
            Resource: '*',
          },
        ],
      },
    ]);

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
    const cp = compilePolicies([
      {
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: '*',
            Resource: 'mypublicresource',
          },
        ],
      },
    ]);

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
    const cp = compilePolicies([
      {
        Statement: [spolicy1],
      },
    ]);

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
    const cp = compilePolicies([
      {
        Statement: [spolicy1],
      },
    ]);

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
    const cp = compilePolicies([
      {
        Statement: [spolicy1],
      },
    ]);

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
    const cp = compilePolicies([
      {
        Statement: [spolicy1],
      },
    ]);

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
    const cp = compilePolicies([
      {
        Statement: [apolicy1],
      },
    ]);
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
    const cp = compilePolicies([
      {
        Statement: [apolicy1],
      },
    ]);
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
    const cp = compilePolicies([
      {
        Statement: [apolicy1, apolicy2],
      },
    ]);
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
    const cp = compilePolicies([
      {
        Statement: [
          apolicy1,
          apolicy2,
          {
            Principal: {
              role: 'myrole1',
            },
            Effect: 'Deny',
            Action: 'myaction2',
            Resource: 'myresource2',
          },
        ],
      },
    ]);
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
    const cp = compilePolicies([
      {
        Statement: [spolicy1],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal',
      Action: 'mywrite',
      Resource: 'my-random-resource',
    });
    expect(allowed).toBeFalsy();
  });

  it('should Deny when no policies', async () => {
    const cp = compilePolicies([
      {
        Statement: [],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal',
      Action: 'mywrite',
      Resource: 'my-random-resource',
    });
    expect(allowed).toBeFalsy();
  });

  it('should Allow when policy matches context', async () => {
    const cp = compilePolicies([
      {
        Statement: [spolicy1],
      },
    ]);
    const allowed = cp.evaluate({
      Principal: 'mypal',
      Action: 'mywrite',
      Resource: 'myresource',
    });
    expect(allowed).toBeTruthy();
  });

  it('should fail if context without Principal', async () => {
    const cp = compilePolicies([
      {
        Statement: [spolicy1],
      },
    ]);

    expect(() => {
      cp.evaluate({
        Principal: '',
        Action: 'action1',
        Resource: 'resource1',
      });
    }).toThrow();
  });

  it('should fail if context without Action', async () => {
    const cp = compilePolicies([
      {
        Statement: [spolicy1],
      },
    ]);

    expect(() => {
      cp.evaluate({
        Principal: 'mypal1',
        Action: '',
        Resource: 'resource1',
      });
    }).toThrow();
  });

  it('should fail if context without Resource', async () => {
    const cp = compilePolicies([
      {
        Statement: [spolicy1],
      },
    ]);

    expect(() => {
      cp.evaluate({
        Principal: 'mypal1',
        Action: 'action1',
        Resource: '',
      });
    }).toThrow();
  });
});
