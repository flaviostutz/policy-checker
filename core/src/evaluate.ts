import { Context } from './types/Context';
import { PrincipalStatement } from './types/PrincipalStatement';
import { Result } from './types/Result';

const evaluate = (context: Context, statements: Map<string, PrincipalStatement[]>): boolean => {
  const { ctxAction, ctxResource } = getContextElements(context);

  const principal = getPrincipal(context);

  let allowed = false;

  // check matches for statements specific for this principal
  const psttP = statements.get(principal);
  if (psttP) {
    for (let i = 0; i < psttP.length; i += 1) {
      const allowedP = checkAllowed(ctxResource, ctxAction, psttP[i]);
      if (allowedP === Result.DENY) {
        return false;
      }
      if (allowedP === Result.ALLOW) {
        allowed = true;
      }
    }
  }

  // check special case when a policy is applied to all Principals
  const psttW = statements.get('*');
  if (psttW) {
    for (let i = 0; i < psttW.length; i += 1) {
      const allowedW = checkAllowed(ctxResource, ctxAction, psttW[i]);
      if (allowedW === Result.DENY) {
        return false;
      }
      if (allowedW === Result.ALLOW) {
        allowed = true;
      }
    }
    allowed = true;
  }

  return allowed;
};

const checkAllowed = (ctxResource: string, ctxAction: string, pstt: PrincipalStatement): Result => {
  let allowed = Result.NONE;

  for (let i = 0; i < pstt.Resource.length; i += 1) {
    const princResource = pstt.Resource[i];
    if (matches(ctxResource, princResource)) {
      for (let j = 0; j < pstt.Action.length; j += 1) {
        const princAction = pstt.Action[j];
        if (matches(ctxAction, princAction)) {
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

const getContextElements = (context: Context): { ctxAction: string; ctxResource: string } => {
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

const getPrincipal = (context: Context): string => {
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

const matches = (value: string, expression: string): boolean => {
  const regex = expression.replace('*', '.*');
  const re = new RegExp(regex);
  return re.test(value);
};

export { evaluate };
