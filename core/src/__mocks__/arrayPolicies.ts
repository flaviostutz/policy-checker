import { Statement } from '../types/Statement';

const apolicy1: Statement = {
  Effect: 'Allow',
  Principal: {
    jwt: ['mypal1', 'mypal2'],
  },
  Action: ['myaction1', 'myaction2'],
  Resource: ['myresource1', 'myresource2'],
};

const apolicy2: Statement = {
  Effect: 'Allow',
  Principal: {
    jwt: 'mypal2',
    role: 'myrole1',
  },
  Action: ['myaction1', 'myaction2'],
  Resource: ['myresource1', 'myresource2'],
};

export { apolicy1, apolicy2 };
