/**
 * Principal statement
 */

import { ConditionInput } from './ConditionInput';

export type PrincipalStatement = {
  Id?: string;
  Resource: string[];
  Action: string[];
  Effect: string;
  Condition?: Record<string, ConditionInput>;
};
