import { evaluate } from './evaluate';
import { RequestContext } from './types/RequestContext';
import { PolicyDocument } from './types/PolicyDocument';
import { PolicyEvaluator } from './types/PolicyEvaluator';
import { ResourceActionStatement } from './types/ResourceActionStatement';
import { Statement } from './types/Statement';
import { conditionExists } from './condition';

/**
 * Compile policy documents and prepare for evaluation
 * @param policies Collection of policy documents
 */
const compilePolicies = (policies: PolicyDocument[], permissionBoundaries?: PolicyDocument[]): PolicyEvaluator => {
  // index map by each Principal (flat)
  const principalStatements = new Map<string, ResourceActionStatement[]>();

  // compile boundaries
  const boundaries:ResourceActionStatement[] = [];
  if (permissionBoundaries) {
    permissionBoundaries.forEach((poldoc) => {
      poldoc.Statement.forEach((statement) => {
        if (statement.Principal) {
          throw new Error('Boundary permissions shouldn\'t have Principals defined');
        }
        boundaries.push(resourceActionStatement(statement));
      });
    });
  }

  // compile policies
  policies.forEach((poldoc) => {
    poldoc.Statement.forEach((statement) => {
      const principal = statement.Principal;

      if (!principal) {
        throw new Error("'Principal' must be defined and non empty");
      }

      if (typeof principal === 'string') {
        if (principal !== '*' && principal.includes('*')) {
          throw new Error("'Principal' cannot contain wildcards (only if plain '*'");
        }
        addPrincipalStatement(principalStatements, principal, statement);
        return;
      }

      if (typeof principal === 'object') {
        if (Object.keys(principal).length === 0) {
          throw new Error("'Principal' must be defined with an non empty object");
        }
        for (const princType in principal) {
          if (!Object.prototype.hasOwnProperty.call(principal, princType)) {
            continue;
          }
          const princValue = principal[princType];

          if (Array.isArray(princValue)) {
            if (princValue.length === 0) {
              throw new Error("'Principal' array must be non empty");
            }
            princValue.forEach((pv) => {
              if (typeof pv !== 'string' || !pv) {
                throw new Error("'Principal' value must be a non-empty string");
              }
              const fprincipal = { [princType]: pv };
              addPrincipalStatement(principalStatements, fprincipal, statement);
            });
            continue;
          }

          if (typeof princValue !== 'string' || !princValue) {
            throw new Error("'Principal' value must be a non-empty string");
          }

          const fprincipal = { [princType]: princValue };
          addPrincipalStatement(principalStatements, fprincipal, statement);
        }
      }
    });
  });

  return {
    evaluate: (context: RequestContext): boolean => {
      return evaluate(context, principalStatements, boundaries);
    },
  };
};

const addPrincipalStatement = (
  principalStatements: Map<string, ResourceActionStatement[]>,
  principal: any,
  statement: Statement,
): void => {
  let princ = principal;
  if (typeof principal !== 'string') {
    princ = JSON.stringify(principal);
  }
  let pss = principalStatements.get(princ);
  if (!pss) {
    pss = [];
  }
  pss.push(resourceActionStatement(statement));
  principalStatements.set(princ, pss);
};

const resourceActionStatement = (stt: Statement): ResourceActionStatement => {
  validateNonEmpty(stt.Action, 'Action');
  validateNonEmpty(stt.Resource, 'Resource');

  // Effect attribute
  if (stt.Effect !== 'Allow' && stt.Effect !== 'Deny') {
    throw new Error("'Effect' must be either 'Allow' or 'Deny'");
  }

  // Condition attribute
  validateCondition(stt.Condition);

  // normalize to always be array
  let action = [];
  if (typeof stt.Action === 'string') {
    action.push(stt.Action);
  } else {
    action = stt.Action;
  }

  let resource:string[] | string = [];
  if (typeof stt.Resource === 'string') {
    resource.push(stt.Resource);
  } else if (stt.Resource) {
    resource = stt.Resource;
  }

  const pss: ResourceActionStatement = {
    Id: stt.Id,
    Effect: stt.Effect,
    Action: action,
    Resource: resource,
    Condition: stt.Condition,
  };
  return pss;
};

const validateNonEmpty = (value: any, name: string): void => {
  if (!value) {
    throw new Error(`'${name}' must be defined and a non empty`);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      throw new Error(`'${name}' must be an array with at least one element`);
    }
    value.forEach((elem) => {
      if (!elem) {
        throw new Error(`'${name}' must be an array with non empty elements`);
      }
    });
  }
};

const validateCondition = (condition: any): void => {
  if (!condition) {
    return;
  }
  if (typeof condition !== 'object') {
    throw new Error("'Condition' should be an object");
  }
  for (const operator in condition) {
    if (!Object.prototype.hasOwnProperty.call(condition, operator)) {
      continue;
    }
    if (!conditionExists(operator)) {
      throw new Error(`Condition operator '${operator}' is not supported`);
    }
    const condAttr = condition[operator];
    if (typeof condAttr !== 'object') {
      throw new Error("'Condition' attribute should be an object");
    }
    for (const cattr in condAttr) {
      if (!Object.prototype.hasOwnProperty.call(condAttr, cattr)) {
        continue;
      }
      const condAttr2 = condAttr[cattr];
      if (typeof condAttr2 !== 'string' && !Array.isArray(condAttr2)) {
        throw new Error("'Condition' value should be a string or an array of strings");
      }
    }
  }
};

export { compilePolicies };
