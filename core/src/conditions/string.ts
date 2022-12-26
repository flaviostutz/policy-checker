const StringEquals = {
  name: (): string => 'StringEquals',
  evaluate: (varValue: string, value: string): boolean => {
    return varValue === value;
  },
};

const StringNotEquals = {
  name: (): string => 'StringNotEquals',
  evaluate: (varValue: string, value: string): boolean => {
    return !StringEquals.evaluate(varValue, value);
  },
};

const StringEqualsIgnoreCase = {
  name: (): string => 'StringEqualsIgnoreCase',
  evaluate: (varValue: string, value: string): boolean => {
    return varValue.toLowerCase() === value.toLowerCase();
  },
};

const StringNotEqualsIgnoreCase = {
  name: (): string => 'StringNotEqualsIgnoreCase',
  evaluate: (varValue: string, value: string): boolean => {
    return !StringEqualsIgnoreCase.evaluate(varValue, value);
  },
};

const StringLike = {
  name: (): string => 'StringLike',
  evaluate: (varValue: string, value: string): boolean => {
    const regex = value.replace('*', '.*');
    const re = new RegExp(regex);
    return re.test(varValue);
  },
};

const StringNotLike = {
  name: (): string => 'StringNotLike',
  evaluate: (varValue: string, value: string): boolean => {
    return !StringLike.evaluate(varValue, value);
  },
};

export {
  StringEquals,
  StringNotEquals,
  StringEqualsIgnoreCase,
  StringNotEqualsIgnoreCase,
  StringLike,
  StringNotLike,
};
