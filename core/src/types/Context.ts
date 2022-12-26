/**
 * Context to be evaluated
 */
export type Context = {
  Principal:
    | {
        Urn: Record<string, string[] | string> | string;
        Tags?: string[];
      }
    | string;
  Resource:
    | {
        Urn: string;
        Tags?: Record<string, string>;
      }
    | string;
  Action: string;
};
