# policyval attacher

This utility helps you attach Global policies, policies to Principals, Principal groups and Resources. It's possible to attach Permission Boundaries also as a second layer of protection for permissioning. This is similar to the AWS IAM concepts.


IF CUSTOMER
   - assume role CUSTOMER
        - tags username, customerId

IF EMPLOYEE
   - assume role EMPLOYEE
         - tags username=flaviostutz, role:AGF938=true, role: GPRI321:true

Then we can do RBAC for specific resources:
   - attach policy for ROLE EMPLOYEE:
      - Action:read, Resource:tasks:*, Conditions: PrincipalTag/role:AGF938==true
   - attach policy for ROLE CUSTOMER:
      - Action:read,write, Resource:tasks:*, Conditions: ResourceTag/username==PrincipalTag/username
   - attach policy to resource with custom:
      - Action:read,write, Resource:tasks:123456, Principal: { jwt: flaviostutz@gmail.com, eliot@gnask.com }


## Usage example

- `npm install --save @policyval/attacher`

```ts
import { newAttacher } from '@policyval/attacher';
import { PolicyDocument, compilePolicies } from '@policyval/core';

const attacher = newAttacher();

// policies and boundaries that applies to all request contexts
const pol1:PolicyDocument = {...};
const pol2:PolicyDocument = {...};
attacher.setGlobalPolicies({jwt:'anthony123'}, [pol1]);
attacher.setGlobalBoundaries({jwt:'anthony123'}, pol2);

// policies and boundaries that applies only to a specific principal
const pol3:PolicyDocument = {...};
const pol4:PolicyDocument = {...};
attacher.setPrincipalPolicies({jwt:'anthony123'}, [pol3]);
attacher.setPrincipalBoundaries({jwt:'anthony123'}, pol4);

// policies that applies to all principals that are part of a certain group
// if a principal is part of multiple groups, the policies for multiple groups 
// will apply to this principal
const pol5:PolicyDocument = {...};
const pol6:PolicyDocument = {...};
attacher.setGroupPolicies('group1', [pol5]);
attacher.setGroupPolicies('group2', [pol6]);
attacher.setPrincipalGroups({jwt:'anthony123'}, ['group1','group2']);

// policies that applies only to a specific resource
const pol7:PolicyDocument = {...};
attacher.setResourcePolicies('tasks:123456', [pol7]);

// compute complete policies and evaluate permission
const allowed = attacher.evaluate({
  Principal: { jwt:'anthony123' },
  Action: 'tasks:delete',
  Resource: { Urn: 'tasks:123456' },
});

// evaluate calls: computePolicies(), compilePolicies() and evaluate()
```

## Reference

### Global

Policies and boundaries applied to all cases.

### Principal Group

A Principal identification can be part of one or more groups. The group can have attached policies, so when computing the policies for a certain Principal, the groups it belongs will be part of its policy along with policies attached directly to the Principal.

### Functions

- **attacher.computePolicies(requestContext)**

  - Returns a list of computed policies after adding global policies, expanding principal policies regarding to the groups it belongs, filtering related resource policies.

- **attacher.computeBoundaries(requestContext)**

  - Returns a list of computed boundaries related to Global and Principal attachments.

