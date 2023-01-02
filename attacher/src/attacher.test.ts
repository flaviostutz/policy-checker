import { PolicyDocument } from '@policyval/core';

import { newAttacher } from './attacher';

const global1: PolicyDocument = {
  Statement: [
    {
      Effect: 'Allow',
      Principal: { jwt: 'mypal0' },
      Action: 'myaction0',
      Resource: 'myresource0',
    },
  ],
};

const resource1: PolicyDocument = {
  Statement: [
    {
      Effect: 'Allow',
      Principal: { jwt: 'mypal1' },
      Action: 'myaction1',
    },
  ],
};

const principal3: PolicyDocument = {
  Statement: [
    {
      Effect: 'Allow',
      Action: 'myaction3',
      Resource: 'myresource3',
    },
  ],
};

const principal4: PolicyDocument = {
  Statement: [
    {
      Effect: 'Allow',
      Action: 'myaction4',
      Resource: 'myresource4',
    },
  ],
};

const principal5: PolicyDocument = {
  Statement: [
    {
      Effect: 'Allow',
      Action: 'myaction5',
      Resource: 'myresource5',
    },
  ],
};

const boundary1: PolicyDocument = {
  Statement: [
    {
      Effect: 'Allow',
      Action: 'myaction1',
      Resource: 'myresource1',
    },
  ],
};

describe('when attaching principal elements', () => {
  it('should validate required/invalid', async () => {
    const attacher = newAttacher();

    expect(() => {
      attacher.setPrincipalPolicies('mypal1', [
        {
          Statement: [
            {
              Effect: 'Allow',
              Action: 'myaction0',
              // Resource: 'myresource0', // should cause error
            },
          ],
        },
      ]);
    }).toThrow();

    expect(() => {
      attacher.setPrincipalPolicies('mypal1', [
        {
          Statement: [
            {
              Effect: 'Allow',
              Principal: 'mypal3', // should cause error
              Action: 'myaction0',
              Resource: 'myresource0',
            },
          ],
        },
      ]);
    }).toThrow();
  });

  it('should return only principal policies', async () => {
    const attacher = newAttacher();

    attacher.setPrincipalPolicies('mypal3', [principal3]);
    attacher.setPrincipalPolicies('mypal4', [principal4]);

    const r1 = attacher.compute({
      Action: 'myaction1',
      Principal: 'mypal3',
      Resource: 'myresource1',
    });
    expect(r1.policies.length).toEqual(1);
    expect(r1.policies[0].Statement[0]).toStrictEqual({
      ...principal3.Statement[0],
      Principal: 'mypal3',
    });
  });

  it('should reject invalid group policies', async () => {
    const attacher = newAttacher();
    expect(() => {
      attacher.setGroupPolicies('group1', [
        {
          Statement: [
            {
              Effect: 'Allow',
              Action: 'myaction0',
              // Resource: 'myresource0', // should cause error
            },
          ],
        },
      ]);
    }).toThrow();
    expect(() => {
      attacher.setGroupPolicies('group1', [
        {
          Statement: [
            {
              Principal: 'mypal1', // should cause error
              Effect: 'Allow',
              Action: 'myaction0',
              Resource: 'myresource0',
            },
          ],
        },
      ]);
    }).toThrow();
  });

  it('should copy all group policies', async () => {
    const attacher = newAttacher();

    attacher.setGroupPolicies('group1', [principal3]);
    attacher.setGroupPolicies('group2', [principal4]);
    attacher.setGroupPolicies('group3', [principal5]);

    attacher.setPrincipalGroups('mypal1', ['group1', 'group2']);

    const r1 = attacher.compute({
      Action: 'myaction1',
      Principal: 'mypal3',
      Resource: 'myresource1',
    });
    expect(r1.policies.length).toEqual(0);

    const r2 = attacher.compute({
      Action: 'myaction1',
      Principal: 'mypal1',
      Resource: 'myresource1',
    });
    expect(r2.policies.length).toEqual(2);

    expect(r2.policies[0].Statement[0]).toStrictEqual({
      ...principal3.Statement[0],
      Principal: 'mypal1',
    });
    expect(r2.policies[1].Statement[0]).toStrictEqual({
      ...principal4.Statement[0],
      Principal: 'mypal1',
    });
  });
});

describe('when attaching resource elements', () => {
  it('should return global along with resource specific policies', async () => {
    const attacher = newAttacher();
    attacher.setGlobalPolicies([global1]);
    attacher.setGlobalBoundaries([boundary1]);
    attacher.setResourcePolicies('myresource1', [resource1]);

    const r1 = attacher.compute({
      Action: 'myaction1',
      Principal: { Urn: { jwt: 'mypal1' } },
      Resource: 'myresource1',
    });
    expect(r1.policies.length).toEqual(2);
    expect(r1.boundaries).toStrictEqual([boundary1]);

    const r2 = attacher.compute({
      Action: 'myaction1',
      Principal: { Urn: { jwt: 'mypal1' } },
      Resource: 'myresourceANYTHING',
    });
    expect(r2.policies.length).toEqual(1);
    expect(r2.boundaries).toStrictEqual([boundary1]);
  });
});

describe('when attaching global elements', () => {
  it('should return same global regardless of context', async () => {
    const attacher = newAttacher();
    attacher.setGlobalPolicies([global1]);
    attacher.setGlobalBoundaries([boundary1]);

    const r1 = attacher.compute({
      Action: 'myaction1',
      Principal: { Urn: { jwt: 'mypal1' } },
      Resource: 'myresource1',
    });
    expect(r1.policies).toStrictEqual([global1]);
    expect(r1.boundaries).toStrictEqual([boundary1]);

    const r2 = attacher.compute({
      Action: 'myaction2',
      Principal: { Urn: { jwt: 'mypal2' } },
      Resource: 'myresource2',
    });
    expect(r2.policies).toStrictEqual([global1]);
    expect(r2.boundaries).toStrictEqual([boundary1]);
  });
});
