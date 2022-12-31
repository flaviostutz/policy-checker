import { RequestContext } from './types/RequestContext';
import { ResourceActionStatement } from './types/ResourceActionStatement';
import { Result } from './types/Result';
import { evaluateConditions } from './condition';
import { resolveVar } from './conditions/resolver';

const evaluate = (
  context: RequestContext,
  statements: Map<string, ResourceActionStatement[]>,
  boundaries?: ResourceActionStatement[],
): boolean => {
  const { ctxAction, ctxResource } = getContextElements(context);
  const principal = getPrincipal(context);

  if (boundaries) {
    for (let i = 0; i < boundaries.length; i += 1) {
      const effectB = checkEffect(context, ctxResource, ctxAction, boundaries[i]);
      if (effectB !== Result.ALLOW) {
        return false;
      }
    }
  }

  let allowed = false;

  // check matches for statements specific for this principal
  const psttP = statements.get(principal);
  if (psttP) {
    for (let i = 0; i < psttP.length; i += 1) {
      const effectP = checkEffect(context, ctxResource, ctxAction, psttP[i]);
      if (effectP === Result.DENY) {
        return false;
      }
      if (effectP === Result.ALLOW) {
        allowed = true;
      }
    }
  }

  // check special case when a policy is applied to all Principals
  const psttW = statements.get('*');
  if (psttW) {
    for (let i = 0; i < psttW.length; i += 1) {
      const effectW = checkEffect(context, ctxResource, ctxAction, psttW[i]);
      if (effectW === Result.DENY) {
        return false;
      }
      if (effectW === Result.ALLOW) {
        allowed = true;
      }
    }
  }

  return allowed;
};

const checkEffect = (
  context: RequestContext,
  ctxResource: string,
  ctxAction: string,
  pstt: ResourceActionStatement,
): Result => {
  let allowed = Result.NONE;

  for (let i = 0; i < pstt.Resource.length; i += 1) {
    const princResource = pstt.Resource[i];
    if (matches(ctxResource, princResource, context)) {
      for (let j = 0; j < pstt.Action.length; j += 1) {
        const princAction = pstt.Action[j];
        if (
          matches(ctxAction, princAction, context) &&
          evaluateConditions(context, pstt.Condition)
        ) {
          if (pstt.Effect === 'Allow') {
            allowed = Result.ALLOW;
          } else {
            return Result.DENY;
          }
        }
      }
    }
  }

  return allowed;
};

const getContextElements = (
  context: RequestContext,
): { ctxAction: string; ctxResource: string } => {
  // validate Action
  if (typeof context.Action !== 'string' || !context.Action) {
    throw new Error("'Action' must be a non-empty string");
  }
  if (context.Action.includes('*')) {
    throw new Error("'Action' context cannot contain '*'");
  }

  // validate Resource
  let ctxResource = '';
  if (!context.Resource) {
    throw new Error("'Resource' must be a defined");
  }
  if (typeof context.Resource === 'object') {
    ctxResource = context.Resource.Urn;
  } else if (typeof context.Resource === 'string') {
    ctxResource = context.Resource;
  }

  if (!ctxResource) {
    throw new Error("'Resource' context must be non-empty");
  }
  if (ctxResource.includes('*')) {
    throw new Error("'Resource' context cannot contain '*'");
  }

  return { ctxAction: context.Action, ctxResource };
};

const getPrincipal = (context: RequestContext): string => {
  // validate Principal
  let principal: string = '';
  if (!context.Principal) {
    throw new Error("'Principal' must be a defined");
  }
  if (typeof context.Principal === 'object') {
    if (Object.keys(context.Principal).length === 0) {
      throw new Error("'Principal' must be a non-empty object");
    }
    if (Array.isArray(context.Principal.Urn)) {
      throw new Error("'Principal' cannot be an array");
    }
    if (typeof context.Principal.Urn === 'object') {
      if (Object.keys(context.Principal.Urn).length === 0) {
        throw new Error("'Principal.Urn' must be a non-empty object");
      }
      principal = JSON.stringify(context.Principal.Urn);
    } else if (typeof context.Principal.Urn === 'string') {
      principal = context.Principal.Urn;
    }
  } else if (typeof context.Principal === 'string') {
    principal = context.Principal;
  } else {
    throw new Error("'Principal' must be a non-empty string");
  }
  if (!principal) {
    throw new Error('Couldnt get Principal from context');
  }
  if (principal !== '*' && principal.includes('*')) {
    throw new Error("'Principal' cannot contain wildcards");
  }
  return principal;
};

const matches = (ctxValue: string, polValue: string, context: RequestContext): boolean => {
  let polValue2 = polValue;

  // resolve var expressions
  // ex: something-${ctx:myvar, 'mydefault1'}-blah - this will find "${ctx:myvar, 'mydefault1'}""
  const regVars = new RegExp(/\${[a-zA-Z][a-zA-Z0-9-_:\\/]*[^}]*}/gm);
  let varResults;
  while ((varResults = regVars.exec(polValue)) !== null) {
    const vr = varResults[0];
    // resolve "variable key" and "default value" inside var expression
    const regValue = /\${([a-zA-Z][a-zA-Z0-9-_:\\/]*)[, ]*[']*([^'.]*)[']*}/gm;
    let variableName = '';
    // don't use '' to mark no default because user can use empty as actual desired default
    let defaultValue = '_ANYRANDOMDEFAULT_';

    let rvalue;
    while ((rvalue = regValue.exec(vr)) !== null) {
      if (rvalue.length > 1) {
        variableName = rvalue[1];
      }
      if (rvalue.length > 2) {
        defaultValue = rvalue[2];
      }
    }

    if (!variableName) {
      return false;
    }

    let varValue = resolveVar(context, variableName);
    if (varValue == null) {
      if (defaultValue === '_ANYRANDOMDEFAULT_') {
        return false;
      }
      varValue = defaultValue;
    }

    polValue2 = polValue2.replace(vr, varValue);
  }

  // test if regex matches for wildcards in policy values
  const regex = polValue2.replace('.', '\\.').replace('*', '.*').replace('?', '.{0,1}');
  const re = new RegExp(regex);
  return re.test(ctxValue);
};

export { evaluate, matches };
