const Bool = {
  name: (): string => 'Bool',
  evaluate: (varValue: string, value: string): boolean => {
    if (varValue !== 'true' && varValue !== 'false') {
      return false;
    }
    if (value !== 'true' && value !== 'false') {
      return false;
    }
    return varValue === value;
  },
};

// IP mask Check
const IpAddress = {
  name: (): string => 'IpAddress',
  evaluate: (varValue: string, value: string): boolean => {
    const pos = value.indexOf('/');
    if (pos === -1) {
      return false;
    }
    const ipBase = value.substring(0, pos);
    const ipMask = value.substring(pos + 1);
    try {
      const ipMaskNbr = parseInt(ipMask, 10);
    // eslint-disable-next-line no-bitwise
      return (ipNumber(varValue) & ipMaskNumber(ipMaskNbr)) === ipNumber(ipBase);
    } catch (err) {
      return false;
    }
  },
};
const ipNumber = (ipAddress:string):number => {
  const ip = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(ipAddress);
  if (ip) {
    // eslint-disable-next-line no-bitwise
    return (Number(ip[1]) << 24) + (Number(ip[2]) << 16) + (Number(ip[3]) << 8) + (Number(ip[4]));
  }
  throw new Error('Unknown ip format');
};
const ipMaskNumber = (maskSize:number):number => {
  // eslint-disable-next-line no-bitwise
  return -1 << (32 - maskSize);
};


export { Bool, IpAddress };
