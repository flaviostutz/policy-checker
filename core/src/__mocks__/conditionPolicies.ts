import { Statement } from '../types/Statement';

const cstringpolicy1: Statement = {
  Effect: 'Allow',
  Principal: 'mypal1',
  Action: 'myaction1',
  Resource: 'myresource1',
  Condition: {
    StringEquals: {
      'ctx:test1': ['value1', 'value2'],
    },
    StringNotEquals: {
      'ctx:test2': ['value1', 'value2'],
    },
    StringEqualsIgnoreCase: {
      'ctx:test3': 'value1',
    },
    StringNotEqualsIgnoreCase: {
      'ctx:test4': 'value1',
    },
    StringLike: {
      'ctx:test5': 'value1*value2',
    },
    StringNotLike: {
      'ctx:test6': 'value1*value2',
    },
    StringEqualsIfExists: {
      'ctx:test7': 'value1',
    },
  },
};

const cstringpolicy2: Statement = {
  Effect: 'Allow',
  Principal: 'mypal1',
  Action: 'myaction1',
  Resource: 'myresource1',
  Condition: {
    StringEquals: {
      'ctx:ResourceTag/tag1': 'value1',
    },
  },
};

const cstringpolicy3: Statement = {
  Effect: 'Allow',
  Principal: 'mypal1',
  Action: 'myaction1',
  Resource: 'myresource1',
  Condition: {
    StringEquals: {
      'ctx:PrincipalTag/tag1': 'value1',
    },
  },
};

export { cstringpolicy1, cstringpolicy2, cstringpolicy3 };
