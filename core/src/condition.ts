/*
 * Conditions as in https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html
 */

import { ConditionEvaluator } from './types/ConditionEvaluator';
import {
  StringEquals,
  StringEqualsIgnoreCase,
  StringLike,
  StringNotEquals,
  StringNotEqualsIgnoreCase,
  StringNotLike,
} from './conditions/string';
import {
  DateEquals,
  DateGreaterThan,
  DateGreaterThanEquals,
  DateLessThan,
  DateLessThanEquals,
  DateNotEquals,
} from './conditions/date';
import {
  NumericEquals,
  NumericGreaterThan,
  NumericGreaterThanEquals,
  NumericLessThan,
  NumericLessThanEquals,
  NumericNotEquals,
} from './conditions/number';
import { Bool, IpAddress } from './conditions/misc';
import { RequestContext } from './types/RequestContext';
import { ConditionInput } from './types/ConditionInput';
import { resolveVar } from './conditions/resolver';

const evaluators = new Map<string, ConditionEvaluator>();

// register condition evaluators
evaluators.set(StringEquals.name(), StringEquals);
evaluators.set(StringNotEquals.name(), StringNotEquals);
evaluators.set(StringEqualsIgnoreCase.name(), StringEqualsIgnoreCase);
evaluators.set(StringNotEqualsIgnoreCase.name(), StringNotEqualsIgnoreCase);
evaluators.set(StringLike.name(), StringLike);
evaluators.set(StringNotLike.name(), StringNotLike);

evaluators.set(DateEquals.name(), DateEquals);
evaluators.set(DateGreaterThan.name(), DateGreaterThan);
evaluators.set(DateGreaterThanEquals.name(), DateGreaterThanEquals);
evaluators.set(DateLessThan.name(), DateLessThan);
evaluators.set(DateLessThanEquals.name(), DateLessThanEquals);
evaluators.set(DateNotEquals.name(), DateNotEquals);

evaluators.set(NumericEquals.name(), NumericEquals);
evaluators.set(NumericGreaterThan.name(), NumericGreaterThan);
evaluators.set(NumericGreaterThanEquals.name(), NumericGreaterThanEquals);
evaluators.set(NumericLessThan.name(), NumericLessThan);
evaluators.set(NumericLessThanEquals.name(), NumericLessThanEquals);
evaluators.set(NumericNotEquals.name(), NumericNotEquals);

evaluators.set(Bool.name(), Bool);
evaluators.set(IpAddress.name(), IpAddress);

// eslint-disable-next-line complexity
const evaluateConditions = (
  context: RequestContext,
  condition?: Record<string, ConditionInput>,
): boolean => {
  for (const opn in condition) {
    if (!Object.prototype.hasOwnProperty.call(condition, opn)) {
      continue;
    }

    // special operator
    if (opn === 'Null') {
      const ok = evaluateNullOperator(context, condition[opn]);
      if (!ok) {
        return false;
      }
      continue;
    }

    let operatorName = opn;
    let ifExists = false;
    if (opn.endsWith('IfExists')) {
      operatorName = opn.substring(0, opn.indexOf('IfExists'));
      ifExists = true;
    }

    const evaluator = evaluators.get(operatorName);
    if (!evaluator) {
      throw new Error(`Condition evaluator for '${operatorName}' doesn't exist`);
    }

    const input = condition[opn];
    for (const key in input) {
      if (!Object.prototype.hasOwnProperty.call(input, key)) {
        continue;
      }

      const value = input[key];
      const varKey = resolveVar(context, key);

      if (Array.isArray(value)) {
        let okOr = false;
        for (let i = 0; i < value.length; i += 1) {
          const varValue = resolveVarValue(context, value[i]);

          let ok = false;
          if (varKey === null) {
            ok = ifExists;
          } else {
            ok = evaluator.evaluate(varKey, varValue);
          }
          if (ok) {
            okOr = true;
          }
        }
        if (!okOr) {
          return false;
        }
      } else {
        if (typeof value !== 'string') {
          return false;
        }

        const varValue = resolveVarValue(context, value);

        let ok = false;
        if (varKey === null) {
          ok = ifExists;
        } else {
          ok = evaluator.evaluate(varKey, varValue);
        }
        if (!ok) {
          return false;
        }
      }
    }
  }
  return true;
};

const evaluateNullOperator = (context: RequestContext, input: ConditionInput): boolean => {
  for (const key in input) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) {
      continue;
    }
    const varValue = resolveVar(context, key);
    const value = input[key];
    let ok = false;
    if (varValue === null) {
      // prettier-ignore
      ok = (value === 'true');
    } else {
      // prettier-ignore
      ok = (value === 'false');
    }
    if (!ok) {
      return false;
    }
  }
  return true;
};

const conditionExists = (name: string): boolean => {
  if (name === 'Null') {
    return true;
  }
  let cname = name;
  if (name.endsWith('IfExists')) {
    cname = name.substring(0, name.indexOf('IfExists'));
  }
  return evaluators.has(cname);
};

const resolveVarValue = (context: RequestContext, valueContents: string): string => {
  let result = null;
  if (valueContents.startsWith('${') && valueContents.endsWith('}')) {
    result = resolveVar(context, valueContents.substring(2, valueContents.length - 1));
  }
  if (result === null) {
    return valueContents;
  }
  return result;
};

export { conditionExists, evaluateConditions };
