const DateEquals = {
  name: (): string => 'DateEquals',
  evaluate: (varValue: string, value: string): boolean => {
    try {
      const varValueTime = Date.parse(varValue);
      const valueTime = Date.parse(value);
      return varValueTime === valueTime;
    } catch (err) {
      return false;
    }
  },
};

const DateNotEquals = {
  name: (): string => 'DateNotEquals',
  evaluate: (varValue: string, value: string): boolean => {
    return !DateEquals.evaluate(varValue, value);
  },
};

const DateLessThan = {
  name: (): string => 'DateLessThan',
  evaluate: (varValue: string, value: string): boolean => {
    try {
      const varValueTime = Date.parse(varValue);
      const valueTime = Date.parse(value);
      return varValueTime < valueTime;
    } catch (err) {
      return false;
    }
  },
};

const DateLessThanEquals = {
  name: (): string => 'DateLessThanEquals',
  evaluate: (varValue: string, value: string): boolean => {
    try {
      const varValueTime = Date.parse(varValue);
      const valueTime = Date.parse(value);
      return varValueTime <= valueTime;
    } catch (err) {
      return false;
    }
  },
};

const DateGreaterThan = {
  name: (): string => 'DateGreaterThan',
  evaluate: (varValue: string, value: string): boolean => {
    try {
      const varValueTime = Date.parse(varValue);
      const valueTime = Date.parse(value);
      return varValueTime > valueTime;
    } catch (err) {
      return false;
    }
  },
};

const DateGreaterThanEquals = {
  name: (): string => 'DateGreaterThanEquals',
  evaluate: (varValue: string, value: string): boolean => {
    try {
      const varValueTime = Date.parse(varValue);
      const valueTime = Date.parse(value);
      return varValueTime >= valueTime;
    } catch (err) {
      return false;
    }
  },
};

export {
  DateEquals,
  DateNotEquals,
  DateLessThan,
  DateLessThanEquals,
  DateGreaterThan,
  DateGreaterThanEquals,
};
