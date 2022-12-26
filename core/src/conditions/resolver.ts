import { RequestContext } from '../types/RequestContext';

const resolveVar = (context: RequestContext, name: string): string | null => {
  const pos = name.indexOf('ctx:');
  if (pos === -1) {
    return null;
  }
  const varName = name.substring(pos + 4);
  if (varName === '') {
    return null;
  }

  if (varName.startsWith('ResourceTag/')) {
    return getResourceTag(context, varName);
  }

  if (varName.startsWith('PrincipalTag/')) {
    return getPrincipalTag(context, varName);
  }

  if (varName.startsWith('CurrentTime')) {
    return `${new Date().toISOString().split('.')[0]}Z`;
  }

  if (varName.startsWith('EpochTime')) {
    return `${new Date().getTime()}`;
  }

  if (context.Vars) {
    const var1 = context.Vars[varName];
    if (typeof var1 === 'undefined') {
      return null;
    }
    return var1;
  }

  return null;
};

const getResourceTag = (context: RequestContext, varName: string): string | null => {
  const resTag = varName.substring(12);
  if (resTag === '') {
    return null;
  }
  if (typeof context.Resource === 'object') {
    if (context.Resource.Tags) {
      const tagValue = context.Resource.Tags[resTag];
      if (typeof tagValue !== 'undefined') {
        return tagValue;
      }
    }
  }
  return null;
};

const getPrincipalTag = (context: RequestContext, varName: string): string | null => {
  const resTag = varName.substring(13);
  if (resTag === '') {
    return null;
  }
  if (typeof context.Principal === 'object') {
    if (context.Principal.Tags) {
      const tagValue = context.Principal.Tags[resTag];
      if (typeof tagValue !== 'undefined') {
        return tagValue;
      }
    }
  }
  return null;
};

export { resolveVar };
