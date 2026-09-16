import { PoiFilter, PoiFilterCondition } from '@/types/StoryConfig';

const evaluateCondition = (values: Record<string, unknown>, condition: PoiFilterCondition): boolean => {
  const actual = values[condition.field];

  switch (condition.operator) {
    case 'equals':
      return actual === condition.value;
    case 'notEquals':
      return actual !== condition.value;
    case 'contains':
      return typeof actual === 'string' && typeof condition.value === 'string' && actual.includes(condition.value);
    case 'gt':
      return (actual as number) > (condition.value as number);
    case 'gte':
      return (actual as number) >= (condition.value as number);
    case 'lt':
      return (actual as number) < (condition.value as number);
    case 'lte':
      return (actual as number) <= (condition.value as number);
    case 'in':
      return Array.isArray(condition.value) && (condition.value as unknown[]).includes(actual);
    case 'isNull':
      return actual === null || actual === undefined;
    case 'isNotNull':
      return actual !== null && actual !== undefined;
    default:
      return true;
  }
};

/**
 * Evaluates a structured (not string/eval-based) filter against one feature's attribute values.
 * Plain JSON conditions/groups instead of a SQL-like string to parse - no injection risk, and
 * `all`/`any`/`not` nesting gives arbitrary boolean grouping without needing operator precedence rules.
 */
export const evaluatePoiFilter = (values: Record<string, unknown>, filter: PoiFilter): boolean => {
  if ('field' in filter) {
    return evaluateCondition(values, filter);
  }
  if (filter.all) {
    return filter.all.every((f) => evaluatePoiFilter(values, f));
  }
  if (filter.any) {
    return filter.any.some((f) => evaluatePoiFilter(values, f));
  }
  if (filter.not) {
    return !evaluatePoiFilter(values, filter.not);
  }
  return true;
};
