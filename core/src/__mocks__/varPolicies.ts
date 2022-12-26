import { Statement } from '../types/Statement';

const vpolicy1: Statement = {
  Effect: 'Allow',
  Principal: 'mypal1',
  Action: ['myaction1', 'myaction2'],
  // eslint-disable-next-line no-template-curly-in-string
  Resource: ["myresource1/${ctx:var1, 'mydefault1'}"],
};

export { vpolicy1 };
