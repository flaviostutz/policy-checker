import { PolicyDocument, RequestContext } from '@policyval/core';

export interface Attacher {
  setGlobalPolicies(policies: PolicyDocument[]): void;
  setGlobalBoundaries(boundaries: PolicyDocument[]): void;
  setPrincipalPolicies(
    principal: Record<string, string> | string,
    policies: PolicyDocument[],
  ): void;
  setPrincipalBoundaries(
    principal: Record<string, string> | string,
    boundaries: PolicyDocument[],
  ): void;
  setGroupPolicies(groupName: string, policies: PolicyDocument[]): void;
  setPrincipalGroups(principal: Record<string, string> | string, groups: string[]): void;
  setResourcePolicies(resourceUrn: string, policies: PolicyDocument[]): void;
  /**
   * Look at the attached policies and boundaries of this attacher and
   * select only the policies and boundaries related to the resources involved in
   * a request context
   * @param requestContext Resource, Principal and Action involved in a call
   */
  compute(requestContext: RequestContext): {
    policies: PolicyDocument[];
    boundaries: PolicyDocument[];
  };
  /**
   * Computes policies and boundaries for these attachments and then
   * evaluates permission using core module
   * @param requestContext Resource, Principal and Action involved in a call
   */
  evaluate(requestContext: RequestContext): boolean;
}
