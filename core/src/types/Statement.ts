/**
 * Policy statement
 */

import { ConditionInput } from './ConditionInput';

export type Statement = {
  Id?: string;
  Principal?: Record<string, string[] | string> | string;
  Resource?: string[] | string;
  Action: string[] | string;
  Effect: string;
  Condition?: Record<string, ConditionInput>;
};
