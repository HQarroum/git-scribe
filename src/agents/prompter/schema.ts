import { Output } from 'ai';
import { PromptResultSchema } from '../../data-models/prompt-result.js';

/**
 * The schema for the query object.
 */
export const PromptSchema = Output.object({
  schema: PromptResultSchema
}) as ReturnType<typeof Output.object>;
