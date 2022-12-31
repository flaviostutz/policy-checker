/**
 * Principal statement
 */

import { ConditionInput } from './ConditionInput';

export type ResourceActionStatement = {
  Id?: string;
  Resource: string[];
  Action: string[];
  Effect: string;
  Condition?: Record<string, ConditionInput>;
};
