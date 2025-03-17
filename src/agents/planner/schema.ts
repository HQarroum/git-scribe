import { Output } from 'ai';
import { PlanResultSchema } from '../../data-models/plan-result.js';

/**
 * The schema for the plan output.
 */
export const PlanOutputSchema = Output.object({
  schema: PlanResultSchema
}) as ReturnType<typeof Output.object>;
