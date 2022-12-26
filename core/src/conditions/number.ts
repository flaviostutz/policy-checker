const NumericEquals = {
  name: (): string => 'NumericEquals',
  evaluate: (varValue: string, value: string): boolean => {
    try {
      const varValueInt = parseInt(varValue, 10);
      const valueInt = parseInt(value, 10);
      return varValueInt === valueInt;
    } catch (err) {
      return false;
    }
  },
};

const NumericNotEquals = {
  name: (): string => 'NumericNotEquals',
  evaluate: (varValue: string, value: string): boolean => {
    return !NumericEquals.evaluate(varValue, value);
  },
};

const NumericLessThan = {
  name: (): string => 'NumericLessThan',
  evaluate: (varValue: string, value: string): boolean => {
    try {
      const varValueInt = parseInt(varValue, 10);
      const valueInt = parseInt(value, 10);
      return varValueInt < valueInt;
    } catch (err) {
      return false;
    }
  },
};

const NumericLessThanEquals = {
  name: (): string => 'NumericLessThanEquals',
  evaluate: (varValue: string, value: string): boolean => {
    try {
      const varValueInt = parseInt(varValue, 10);
      const valueInt = parseInt(value, 10);
      return varValueInt <= valueInt;
    } catch (err) {
      return false;
    }
  },
};

const NumericGreaterThan = {
  name: (): string => 'NumericGreaterThan',
  evaluate: (varValue: string, value: string): boolean => {
    try {
      const varValueInt = parseInt(varValue, 10);
      const valueInt = parseInt(value, 10);
      return varValueInt > valueInt;
    } catch (err) {
      return false;
    }
  },
};

const NumericGreaterThanEquals = {
  name: (): string => 'NumericGreaterThanEquals',
  evaluate: (varValue: string, value: string): boolean => {
    try {
      const varValueInt = parseInt(varValue, 10);
      const valueInt = parseInt(value, 10);
      return varValueInt >= valueInt;
    } catch (err) {
      return false;
    }
  },
};

export {
  NumericEquals,
  NumericNotEquals,
  NumericLessThan,
  NumericLessThanEquals,
  NumericGreaterThan,
  NumericGreaterThanEquals,
};
