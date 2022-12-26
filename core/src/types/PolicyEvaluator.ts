import { RequestContext } from './RequestContext';

export interface PolicyEvaluator {
  /**
   * Checks, according to the policies used for building this evaluator,
   * if the context is allowed or disallowed
   */
  evaluate(context: RequestContext): boolean;
}
