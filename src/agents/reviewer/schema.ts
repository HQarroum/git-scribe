import { Output } from 'ai';
import { ReviewSchema } from '../../data-models/review.js';

/**
 * The schema for the review output.
 */
export const ReviewOutputSchema = Output.object({
  schema: ReviewSchema
}) as ReturnType<typeof Output.object>;
