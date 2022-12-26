import { evaluate } from './evaluate';
import { Context } from './types/Context';
import { PolicyDocument } from './types/PolicyDocument';
import { PolicyEvaluator } from './types/PolicyEvaluator';
import { PrincipalStatement } from './types/PrincipalStatement';
import { Statement } from './types/Statement';

/**
 * Compile policy documents and prepare for evaluation
 * @param policies Collection of policy documents
 */
const compilePolicies = (policies: PolicyDocument[]): PolicyEvaluator => {
  // index map by each Principal (flat)
  const principalStatements = new Map<string, PrincipalStatement[]>();

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
    evaluate: (context: Context): boolean => {
      return evaluate(context, principalStatements);
    },
  };
};

const addPrincipalStatement = (
  principalStatements: Map<string, PrincipalStatement[]>,
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
  pss.push(principalStatement(statement));
  principalStatements.set(princ, pss);
};

const principalStatement = (stt: Statement): PrincipalStatement => {
  validateNonEmpty(stt.Action, 'Action');
  validateNonEmpty(stt.Resource, 'Resource');

  // Effect attribute
  if (stt.Effect !== 'Allow' && stt.Effect !== 'Deny') {
    throw new Error("'Effect' must be either 'Allow' or 'Deny'");
  }

  // normalize to always be array
  let action = [];
  if (typeof stt.Action === 'string') {
    action.push(stt.Action);
  } else {
    action = stt.Action;
  }

  let resource = [];
  if (typeof stt.Resource === 'string') {
    resource.push(stt.Resource);
  } else {
    resource = stt.Resource;
  }

  const pss: PrincipalStatement = {
    Action: action,
    Resource: resource,
    Effect: stt.Effect,
    Id: stt.Id,
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

export { compilePolicies };
