import { compilePolicies } from './compile';
import { apolicy1, apolicy2 } from './__mocks__/arrayPolicies';
import { cstringpolicy1 } from './__mocks__/conditionPolicies';
import { spolicy1, spolicy2 } from './__mocks__/simplePolicies';
import { wpolicy1 } from './__mocks__/wildcardPolicies';

describe('when using condition element', () => {
  it('should compile if condition well formed', async () => {
    compilePolicies([
      {
        Statement: [cstringpolicy1],
      },
    ]);
  });

  it('should fail if using wildcard in Principal name', async () => {
    expect(() => {
      compilePolicies([
        {
          Statement: [
            {
              Effect: 'Allow',
              Principal: 'my*pal',
              Action: 'mywrite',
              Resource: 'myresource',
            },
          ],
        },
      ]);
    }).toThrow();
  });
});

describe('when using wildcard elements', () => {
  it('should compile when using valid wildcard elements', async () => {
    compilePolicies([
      {
        Statement: [wpolicy1],
      },
    ]);
  });

  it('should fail if using wildcard in Principal name', async () => {
    expect(() => {
      compilePolicies([
        {
          Statement: [
            {
              Effect: 'Allow',
              Principal: 'my*pal',
              Action: 'mywrite',
              Resource: 'myresource',
            },
          ],
        },
      ]);
    }).toThrow();
  });
});

describe('when using array elements', () => {
  it('should compile when using valid array elements', async () => {
    compilePolicies([
      {
        Statement: [apolicy1],
      },
    ]);
  });

  it('should compile when using valid array elements 2', async () => {
    compilePolicies([
      {
        Statement: [apolicy1, apolicy2],
      },
    ]);
  });

  it('should fail if empty array element in Principal', async () => {
    expect(() => {
      compilePolicies([
        {
          Statement: [
            {
              Effect: 'Allow',
              Principal: { jwt: ['mypal', ''] },
              Action: 'mywrite',
              Resource: 'myresource',
            },
          ],
        },
      ]);
    }).toThrow();
  });

  it('should fail if Action has empty array element', async () => {
    expect(() => {
      compilePolicies([
        {
          Statement: [
            {
              Effect: 'Allow',
              Principal: 'mypal',
              Action: ['mywrite', '', 'another'],
              Resource: 'myresource',
            },
          ],
        },
      ]);
    }).toThrow();
  });
});

describe('when using non-array (simple) elements', () => {
  it('should compile for simple case', async () => {
    compilePolicies([
      {
        Statement: [spolicy1],
      },
    ]);
  });

  it('should compile for simple case 2', async () => {
    compilePolicies([
      {
        Statement: [spolicy1, spolicy2],
      },
    ]);
  });

  it('should fail if without Allow', async () => {
    expect(() => {
      compilePolicies([
        {
          Statement: [
            {
              Effect: '',
              Principal: 'mypal',
              Action: 'mywrite',
              Resource: 'myresource',
            },
          ],
        },
      ]);
    }).toThrow();
  });

  it('should fail if invalid Effect', async () => {
    expect(() => {
      compilePolicies([
        {
          Statement: [
            {
              Effect: 'Allow1',
              Principal: 'mypal',
              Action: 'mywrite',
              Resource: 'myresource',
            },
          ],
        },
      ]);
    }).toThrow();
  });

  it('should fail if invalid Principal', async () => {
    expect(() => {
      compilePolicies([
        {
          Statement: [
            {
              Effect: 'Allow',
              Principal: 'mypal*',
              Action: 'mywrite',
              Resource: 'myresource',
            },
          ],
        },
      ]);
    }).toThrow();
  });

  it('should fail if empty Principal', async () => {
    expect(() => {
      compilePolicies([
        {
          Statement: [
            {
              Effect: 'Allow',
              Principal: '',
              Action: 'mywrite',
              Resource: 'myresource',
            },
          ],
        },
      ]);
    }).toThrow();
  });

  it('should fail if empty Action', async () => {
    expect(() => {
      compilePolicies([
        {
          Statement: [
            {
              Effect: 'Allow',
              Principal: 'mypal',
              Action: '',
              Resource: 'myresource',
            },
          ],
        },
      ]);
    }).toThrow();
  });

  it('should fail if empty Resource', async () => {
    expect(() => {
      compilePolicies([
        {
          Statement: [
            {
              Effect: 'Allow',
              Principal: 'mypal',
              Action: 'mywrite',
              Resource: '',
            },
          ],
        },
      ]);
    }).toThrow();
  });
});
