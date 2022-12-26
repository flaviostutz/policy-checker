/**
 * Context to be evaluated
 */
export type RequestContext = {
  Principal:
    | {
        Urn: Record<string, string[] | string> | string;
        Tags?: Record<string, string>;
      }
    | string;
  Resource:
    | {
        Urn: string;
        Tags?: Record<string, string>;
      }
    | string;
  Action: string;
  Vars?: Record<string, string>;
};
