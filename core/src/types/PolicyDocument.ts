import { Statement } from './Statement';

/**
 * Policy Document with a collection of policy statements
 */
export type PolicyDocument = {
  Statement: Statement[];
};
