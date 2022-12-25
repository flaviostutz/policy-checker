import { Statement } from '../types/Statement';

const spolicy1:Statement = {
  Effect: 'Allow',
  Principal: 'mypal',
  Action: 'mywrite',
  Resource: 'myresource',
};

const spolicy2:Statement = {
  Effect: 'Allow',
  Principal: 'mypal2',
  Action: 'mywrite2',
  Resource: 'myresource2',
};

export { spolicy1, spolicy2 };
