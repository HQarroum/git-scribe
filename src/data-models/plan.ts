import { z } from 'zod';
import { SectionSchema } from './section.js';

/**
 * The schema for the plan object.
 */
export const PlanSchema = z.object({
  title: z.string(),
  coverImage: z.object({
    searchQueryTerms: z.string()
  }),
  documentType: z.string(),
  plan: z.array(SectionSchema)
});

export type Plan = z.infer<typeof PlanSchema>;
