/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import {
  validateNonEmpty,
  validateActionStatement,
  PolicyDocument,
  RequestContext,
  Statement,
  compilePolicies,
} from '@policyval/core';

import { Attacher } from './types/Attacher';

const newAttacher = (): Attacher => {
  let globalPolicies: PolicyDocument[] = [];
  let globalBoundaries: PolicyDocument[] = [];
  const principalPolicies: Record<string, PolicyDocument[]> = {};
  const principalBoundaries: Record<string, PolicyDocument[]> = {};
  const groupPolicies: Record<string, PolicyDocument[]> = {};
  const principalGroups: Record<string, string[]> = {};
  const resourcePolicies: Record<string, PolicyDocument[]> = {};

  return {
    setGlobalPolicies: (policies: PolicyDocument[]): void => {
      validate(policies, true, true);
      globalPolicies = policies;
    },
    setGlobalBoundaries: (boundaries: PolicyDocument[]): void => {
      validate(boundaries, true, false);
      globalBoundaries = boundaries;
    },
    setPrincipalPolicies: (
      principal: Record<string, string> | string,
      policies: PolicyDocument[],
    ): void => {
      validate(policies, true, false);
      const ps = getPrincipalStr(principal);
      principalPolicies[ps] = policies;
    },
    setPrincipalBoundaries: (
      principal: Record<string, string> | string,
      boundaries: PolicyDocument[],
    ): void => {
      validate(boundaries, true, false);
      const ps = getPrincipalStr(principal);
      principalBoundaries[ps] = boundaries;
    },
    setGroupPolicies: (groupName: string, policies: PolicyDocument[]): void => {
      validate(policies, true, false);
      groupPolicies[groupName] = policies;
    },
    setPrincipalGroups: (principal: Record<string, string> | string, groups: string[]): void => {
      const ps = getPrincipalStr(principal);
      principalGroups[ps] = groups;
    },
    setResourcePolicies: (resourceUrn: string, policies: PolicyDocument[]): void => {
      validate(policies, false, true);
      resourcePolicies[resourceUrn] = policies;
    },
    compute: (
      requestContext: RequestContext,
    ): { policies: PolicyDocument[]; boundaries: PolicyDocument[] } => {
      return computeInt(
        requestContext,
        globalPolicies,
        globalBoundaries,
        principalPolicies,
        principalBoundaries,
        groupPolicies,
        principalGroups,
        resourcePolicies,
      );
    },
    evaluate: (requestContext: RequestContext): boolean => {
      const { policies, boundaries } = computeInt(
        requestContext,
        globalPolicies,
        globalBoundaries,
        principalPolicies,
        principalBoundaries,
        groupPolicies,
        principalGroups,
        resourcePolicies,
      );
      const cpol = compilePolicies(policies, boundaries);
      return cpol.evaluate(requestContext);
    },
  };
};

const computeInt = (
  requestContext: RequestContext,
  globalPolicies: PolicyDocument[],
  globalBoundaries: PolicyDocument[],
  principalPolicies: Record<string, PolicyDocument[]>,
  principalBoundaries: Record<string, PolicyDocument[]>,
  groupPolicies: Record<string, PolicyDocument[]>,
  principalGroups: Record<string, string[]>,
  resourcePolicies: Record<string, PolicyDocument[]>,
): { policies: PolicyDocument[]; boundaries: PolicyDocument[] } => {
  const rpolicies: PolicyDocument[] = [];
  const rboundaries: PolicyDocument[] = [];

  // global attachments
  rpolicies.push(...globalPolicies);
  rboundaries.push(...globalBoundaries);

  // principal attachments
  const principal = getUrnValue(requestContext.Principal);
  let principalStr = principal;
  if (typeof principalStr === 'object') {
    principalStr = JSON.stringify(principal);
  }
  const pp = principalPolicies[principalStr];
  if (pp) {
    rpolicies.push(...copyPolicyDocuments(pp, null, principal));
  }
  const pb = principalBoundaries[principalStr];
  if (pb) {
    rboundaries.push(...copyPolicyDocuments(pb, null, principal));
  }

  // copy policies from all groups the principal is related to
  const groups = principalGroups[principalStr];
  if (groups) {
    groups.forEach((group: string) => {
      const gpolicies = groupPolicies[group];
      if (gpolicies) {
        rpolicies.push(...copyPolicyDocuments(gpolicies, null, principal));
      }
    });
  }

  // resource attachments
  const resource = getUrnValue(requestContext.Resource);
  if (!resource || typeof resource !== 'string') {
    throw new Error("Couldn't get Resource value from request context");
  }
  const rp = resourcePolicies[resource];
  if (rp) {
    rpolicies.push(...copyPolicyDocuments(rp, resource, null));
  }

  return {
    policies: rpolicies,
    boundaries: rboundaries,
  };
};

const getPrincipalStr = (principal: Record<string, string> | string): string => {
  let ps = principal;
  if (typeof ps !== 'string') {
    ps = JSON.stringify(principal);
  }
  return ps;
};

const getUrnValue = (elem: any): Record<string, string> | string | null => {
  if (typeof elem === 'string') {
    return elem;
  }
  if (elem.Urn) {
    return elem.Urn;
  }
  return null;
};

const validate = (
  policies: PolicyDocument[],
  allowResource: boolean,
  allowPrincipal: boolean,
): void => {
  for (let i = 0; i < policies.length; i += 1) {
    const pol = policies[i];
    for (let j = 0; j < pol.Statement.length; j += 1) {
      const stt = pol.Statement[i];

      validateActionStatement(stt);

      if (allowResource) {
        validateNonEmpty(stt.Resource, 'Resource');
      } else if (stt.Resource) {
        throw new Error("'Resource' shouldn't be defined");
      }

      if (allowPrincipal) {
        validateNonEmpty(stt.Principal, 'Principal');
      } else if (stt.Principal) {
        throw new Error("'Principal' shouldn't be defined");
      }
    }
  }
};

const copyPolicyDocuments = (
  policies: PolicyDocument[],
  setResourceTo: string | null,
  setPrincipalTo: string | Record<string, string> | null,
): PolicyDocument[] => {
  const rpolicies: PolicyDocument[] = [];
  policies.forEach((pol) => {
    const npol: PolicyDocument = {
      Statement: [],
    };
    pol.Statement.forEach((stt: Statement) => {
      if (stt.Principal && setPrincipalTo) {
        throw new Error('If Principal is meant to be set, it shoulnt be already defined');
      }
      let principal = stt.Principal;
      if (setPrincipalTo) {
        principal = setPrincipalTo;
      }

      if (stt.Resource && setResourceTo) {
        throw new Error('If Resource is meant to be set, it shoulnt be already defined');
      }
      let resource = stt.Resource;
      if (setResourceTo) {
        resource = setResourceTo;
      }

      if (!resource || !principal) {
        throw new Error('Both Resource and Principal should have a value');
      }

      const clone: Statement = {
        Principal: principal,
        Resource: resource,
        Action: stt.Action,
        Effect: stt.Effect,
      };
      if (stt.Id) {
        clone.Id = stt.Id;
      }
      if (stt.Condition) {
        clone.Condition = stt.Condition;
      }
      npol.Statement.push(clone);
    });
    rpolicies.push(npol);
  });
  return rpolicies;
};

export { newAttacher };
