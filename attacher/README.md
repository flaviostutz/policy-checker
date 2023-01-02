# policyval attacher

This utility helps you attach Global policies, policies to Principals, Principal groups and Resources. It's possible to attach Permission Boundaries also as a second layer of protection. This is similar to the basic AWS IAM concepts.

## Usage example

- `npm install --save @policyval/attacher`

```ts
import { newAttacher } from '@policyval/attacher';
import { PolicyDocument, compilePolicies } from '@policyval/core';

const attacher = newAttacher();

// policies and boundaries that applies to all request contexts
const pol1:PolicyDocument = {...};
const pol2:PolicyDocument = {...};
attacher.setGlobalPolicies('anthony123', [pol1]);
attacher.setGlobalBoundaries('anthony123', pol2);

// policies and boundaries that applies only to a specific principal
const pol3:PolicyDocument = {...};
const pol4:PolicyDocument = {...};
attacher.setPrincipalPolicies('anthony123', [pol3]);
attacher.setPrincipalBoundaries('anthony123', pol4);

// policies that applies to all principals that are part of a certain group
// if a principal is part of multiple groups, the policies for multiple groups
// will apply to this principal
const pol5:PolicyDocument = {...};
const pol6:PolicyDocument = {...};
attacher.setGroupPolicies('group1', [pol5]);
attacher.setGroupPolicies('group2', [pol6]);
attacher.setPrincipalGroups('anthony123', ['group1','group2']);

// policies that applies only to a specific resource
const pol7:PolicyDocument = {...};
attacher.setResourcePolicies('tasks:123456', [pol7]);

// compute complete policies and evaluate permission
const allowed = attacher.evaluate({
  Principal: 'anthony123',
  Action: 'tasks:delete',
  Resource: 'tasks:123456',
});

// evaluate calls: computePolicies(), compilePolicies() and evaluate()
```

## Reference

### Global

Policies and boundaries applied to all cases.

### Principal Group

A Principal identification can be part of one or more groups. The group can have attached policies, so when computing the policies for a certain Principal, the groups it belongs will be part of its policy along with policies attached directly to the Principal.

### Functions

- **attacher.compute(requestContext):{policies,boundaries}**

  - Returns a list of computed policies after adding global policies, expanding principal policies regarding to the groups it belongs, filtering related resource policies.

  - Returns a list of computed boundaries related to Global and Principal attachments.
