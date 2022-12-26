export interface ConditionEvaluator {
  /**
   * Checks, according to the policies used for building this evaluator,
   * if the context is allowed or disallowed
   * @param varValue resolved var value from RequestContext
   * @param value fixed value to be compared to varValue
   */
  evaluate(varValue: string, value: string): boolean;
  name(): string;
}
