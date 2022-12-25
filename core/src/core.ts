import { Context } from './types/Context';
import { PolicyDocument } from './types/PolicyDocument';
import { PolicyEvaluator } from './types/PolicyEvaluator';
import { PrincipalStatement } from './types/PrincipalStatement';
import { Result } from './types/Result';
import { Statement } from './types/Statement';

/**
 * Compile policy documents and prepare for evaluation
 * @param policies Collection of policy documents
 */
const compilePolicies = (policies: PolicyDocument[]):PolicyEvaluator => {
  // index map by each Principal (flat)
  const principalStatements = new Map<string, PrincipalStatement[]>();

  policies.forEach((poldoc) => {
    poldoc.Statement.forEach((statement) => {
      let principal = statement.Principal;

      if(!principal) {
        throw new Error(`'Principal' must be defined and non empty`);
      }

      if(typeof principal === 'string') {
        if(principal !== '*' && principal.includes('*')) {
          throw new Error('\'Principal\' cannot contain wildcards (only if plain \'*\'');
        }
        addPrincipalStatement(principalStatements, principal, statement)
        return;
      }

      if(typeof principal === 'object') {
        if(Object.keys(principal).length == 0) {
          throw new Error('\'Principal\' must be defined with an non empty object');
        }
        for (const princType in principal) {
          const princValue = principal[princType];

          if(Array.isArray(princValue)) {
            if(princValue.length == 0) {
              throw new Error('\'Principal\' array must be non empty');
            }
            princValue.forEach((pv) => {
              if(typeof pv !== 'string' || !pv) {
                throw new Error('\'Principal\' value must be a non-empty string');
              }
              const fprincipal = { princType: pv };
              addPrincipalStatement(principalStatements, fprincipal, statement)
            })
            continue;
          }

          if(typeof princValue !== 'string' || !princValue) {
            throw new Error('\'Principal\' value must be a non-empty string');
          }
          
          const fprincipal = { princType: princValue };
          addPrincipalStatement(principalStatements, fprincipal, statement)
        }

        return;
      }
    })
  })

  return {
    evaluate: (context: Context): boolean => {
      // validate Action
      if(context.Action !== 'string' || !context.Action) {
        throw new Error('\'Action\' must be a non-empty string');
      }

      // validate Resource
      if(!context.Resource) {
        throw new Error('\'Resource\' must be a defined');
      }
      if(typeof context.Resource === 'object') {
        if(!context.Resource?.Urn) {
          throw new Error('\'Resource.Urn\' must be a non-empty string');
        }
      }

      // validate Principal
      let principal:string;
      if(!context.Principal) {
        throw new Error('\'Principal\' must be a defined');
      }
      if(typeof context.Principal === 'object') {
        if(Object.keys(context.Principal).length==0) {
          throw new Error('\'Principal\' must be a non-empty object');
        }
        principal = JSON.stringify(context.Principal)
      } else if(typeof context.Principal === 'string') {
        principal = context.Principal;
      } else {
        throw new Error('\'Principal\' must be a non-empty string');
      }


      let allowed = false;

      // check matches for statements specific for this principal
      const psttP = principalStatements.get(principal);
      if(psttP) {
        for(let i=0; i<psttP.length; i+=1) {
          const allowedP = checkAllowed(context, psttP[i]);
          if(allowedP === Result.DENY) {
            return false;
          }
          if(allowedP === Result.ALLOW) {
            allowed = true;
          }
        }
      }

      //check special case when a policy is applyed to all Principals
      const psttW = principalStatements.get('*');
      if(psttW) {
        for(let i=0; i<psttW.length; i+=1) {
          const allowedW = checkAllowed(context, psttW[i]);
          if(allowedW === Result.DENY) {
            return false;
          }
          if(allowedW === Result.ALLOW) {
            allowed = true;
          }
        }
        allowed = true;
      }

      return allowed;
    }  
  }
}

const checkAllowed = (context:Context, pstt:PrincipalStatement):Result => {
  let allowed = Result.NONE;

  // Context
  let ctxResource = '';
  if(typeof context.Resource === 'object') {
    ctxResource = context.Resource.Urn;
  } else if(typeof context.Resource === 'string') {
    ctxResource = context.Resource;
  }

  for(const princResource in pstt.Resource) {
    if(ctxResource.includes('*')) {
      throw new Error(`'Resource' context cannot contain '*'`);
    }
    if(matches(ctxResource, princResource)) {
      for(const princAction in pstt.Action) {
        if(context.Action.includes('*')) {
          throw new Error(`'Action' context cannot contain '*'`);
        }
        if(matches(context.Action, princAction)) {
          if(pstt.Effect === 'Allow') {
            allowed = Result.ALLOW;
          }
          return Result.DENY;
        }
      }
    }
  }

  return allowed;
}

const matches = (value:string, expression:string):boolean => {
  const regex = expression.replace('*', '.*');
  const re = new RegExp(regex);
  return re.test(value);
}

const addPrincipalStatement = (principalStatements:Map<string, PrincipalStatement[]>, principal:any, statement:Statement):void => {
  let princ = principal;
  if(typeof principal !== 'string') {
    princ = JSON.stringify(principal);
  }
  let pss = principalStatements.get(princ);
  if(!pss) {
    pss = new Array<PrincipalStatement>();
  }
  pss.push(principalStatement(statement));
  principalStatements.set(princ, pss)
}

const principalStatement = (stt:Statement):PrincipalStatement => {
  validateNonEmpty(stt.Action, 'Action');
  validateNonEmpty(stt.Resource, 'Resource');

  // Effect attribute
  if(stt.Effect !== 'Allow' && stt.Effect !== 'Deny') {
    throw new Error('\'Effect\' must be either \'Allow\' or \'Deny\'');
  }
  let effect = 'Allow';
  if(stt.Effect) {
    effect = stt.Effect;
  }

  // normalize to always be array
  let action = [];
  if(typeof stt.Action === 'string') {
    action.push(stt.Action);
  } else {
    action = stt.Action;
  }

  let resource = [];
  if(typeof stt.Resource === 'string') {
    resource.push(stt.Resource);
  } else {
    resource = stt.Resource;
  }

  const r:PrincipalStatement = {
    Action: action,
    Resource: resource,
    Effect: effect,
    Id: stt.Id
  }
  return r;
}

const validateNonEmpty = (value:any, name:string)=> {
  if(!value) {
    throw new Error(`'${name}' must be defined and a non empty`);
  }
  if(Array.isArray(value)) {
    if(value.length === 0) {
      throw new Error(`'${name}' must be an array with at least one element`);
    }
    value.forEach((elem)=>{
      if(!elem) {
        throw new Error(`'${name}' must be an array with non empty elements`);
      }
    })
  }
}

export { compilePolicies };

