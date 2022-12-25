import { Context } from './Context';

export interface PolicyEvaluator {
  /**
   * Checks, according to the policies used for building this evaluator,
   * if the context is allowed or disallowed
   */
  evaluate(context:Context): boolean;

}
