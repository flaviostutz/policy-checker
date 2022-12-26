/**
 * Policy statement
 */

export type Statement = {
  Id?: string;
  Principal: Record<string, string[] | string> | string;
  Resource: string[] | string;
  Action: string[] | string;
  Effect: string;
};
