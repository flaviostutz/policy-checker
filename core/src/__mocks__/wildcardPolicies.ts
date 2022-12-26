import { Statement } from '../types/Statement';

const wpolicy1: Statement = {
  Effect: 'Allow',
  Principal: 'mypal1',
  Action: ['myaction1:*', 'myaction2:*'],
  Resource: ['myresource1/*', 'myresource2/*'],
};

const wpolicy2: Statement = {
  Effect: 'Allow',
  Principal: 'mypal1',
  Action: ['myaction1:*', 'myaction2'],
  Resource: ['myresource1', 'myresource2/*'],
};

const wpolicy3: Statement = {
  Effect: 'Allow',
  Principal: 'mypal1',
  Action: ['myaction1', 'myaction2:*:test'],
  Resource: ['myresource1/*/test', 'myresource2'],
};

export { wpolicy1, wpolicy2, wpolicy3 };
